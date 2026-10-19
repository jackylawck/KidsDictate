// 輕量級 WebAssembly SIMD 支援檢測
const supportsSimd = (() => {
  try {
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 
      3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
    ]));
  } catch {
    return false;
  }
})();

export class OcrService {
  static worker = null;
  static _pendingRequests = new Map();
  static _requestId = 0;

  /**
   * 透過共用的 Web Worker 進行圖片預處理（降維、轉灰階）
   */
  static async preprocess(file, timeoutMs = 30000) {
    if (!this.worker) {
      this.worker = new Worker(new URL('./image-processor.worker.js', import.meta.url), { type: 'module' });
      
      this.worker.onmessage = (e) => {
        const { id, status, blob, message, code } = e.data;
        const pending = this._pendingRequests.get(id);
        if (!pending) return;

        clearTimeout(pending.timer);
        this._pendingRequests.delete(id);

        if (status === 'success') {
          pending.resolve(blob);
        } else {
          pending.reject(Object.assign(new Error(message || 'IMAGE_PROCESSING_FAILED'), { code }));
        }
      };

      this.worker.onerror = (err) => {
        console.error('[Image Processor Worker Error]', err);
        this._pendingRequests.forEach(req => {
          clearTimeout(req.timer);
          req.reject(Object.assign(new Error('WORKER_CRASH'), { code: 'WORKER_CRASH' }));
        });
        this._pendingRequests.clear();
        
        try { this.worker.terminate(); } catch {}
        this.worker = null;
      };
    }

    const id = ++this._requestId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pendingRequests.delete(id);
        reject(Object.assign(new Error('圖片處理超時'), { code: 'TIMEOUT' }));
      }, timeoutMs);

      this._pendingRequests.set(id, { resolve, reject, timer });
      this.worker.postMessage({ id, file });
    });
  }

  /**
   * 執行本機 OCR 辨識
   */
  static async recognizeText(file, onProgress) {
    const blob = await this.preprocess(file);
    
    if (typeof Tesseract === 'undefined') {
      throw Object.assign(new Error('OCR 引擎未載入'), { code: 'ENGINE_NOT_LOADED' });
    }

    const base = new URL('../../vendor/', import.meta.url).href;
    let tesseractWorker;
    
    try {
      tesseractWorker = await Tesseract.createWorker(['chi_tra', 'eng'], 1, {
        workerPath: `${base}worker.min.js`,
        // [P3 修復] 動態選擇 corePath，優雅降級以支援舊版 iPad / 低階手機
        corePath: supportsSimd ? `${base}tesseract-core-simd.wasm.js` : `${base}tesseract-core.wasm.js`,
        langPath: `${base}tessdata/`,
        cacheMethod: 'indexedDB',
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });
    } catch (err) {
      console.error('[OCR Engine Init Error]', err);
      throw Object.assign(new Error('OCR 引擎初始化失敗'), { code: 'ENGINE_INIT_FAILED' });
    }

    let timeoutId;
    try {
      // [P3 修復] 加入 60 秒的 Promise.race 超時防禦，防止極端網路環境下的永久卡死
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(Object.assign(new Error('OCR 辨識超時'), { code: 'OCR_TIMEOUT' }));
        }, 60000);
      });

      const result = await Promise.race([
        tesseractWorker.recognize(blob),
        timeoutPromise
      ]);
      
      clearTimeout(timeoutId); // 成功辨識後清除計時器

      // 保留原本強大的正則表達式
      return result.data.text.split('\n')
        .map(line => line.replace(/^([0-9０-９]+|[一二三四五六七八九十]+)[.．\、\s\-]+/, '').trim())
        .filter(line => line.length > 0 && !/^[-—_+=*#~`]+$/.test(line));

    } catch (err) {
      clearTimeout(timeoutId);
      throw Object.assign(new Error(err.message || '文字辨識失敗'), { code: err.code || 'OCR_FAILED' });
    } finally {
      if (tesseractWorker) {
        try { await tesseractWorker.terminate(); } catch {}
      }
    }
  }
}
