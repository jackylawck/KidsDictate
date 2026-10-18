export class OcrService {
  static worker = null;
  static requestId = 0;
  static pending = new Map();

  static getWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL('./image-processor.worker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => {
        const { id, status, blob, message, code } = e.data;
        const deferred = this.pending.get(id);
        if (!deferred) return;
        this.pending.delete(id);
        status === 'success' ? deferred.resolve(blob) : deferred.reject(Object.assign(new Error(message), { code }));
      };
      this.worker.onerror = (e) => {
        for (const [id, d] of this.pending) d.reject(Object.assign(new Error('影像處理核心崩潰'), { code: 'WORKER_CRASH' }));
        this.pending.clear();
        try { this.worker.terminate(); } catch {}
        this.worker = null;
      };
    }
    return this.worker;
  }

  // [P3 修復] 補上 30 秒超時機制，防止 Worker 被 OS 砍掉時 Promise 永久懸掛
  static preprocess(file, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(Object.assign(new Error('影像處理超時 / Image processing timeout'), { code: 'WORKER_TIMEOUT' }));
      }, timeoutMs);

      this.pending.set(id, { 
        resolve: (v) => { clearTimeout(timer); resolve(v); }, 
        reject: (e) => { clearTimeout(timer); reject(e); } 
      });
      
      this.getWorker().postMessage({ id, file });
    });
  }

  static async recognizeText(file, onProgress) {
    const blob = await this.preprocess(file);
    if (typeof Tesseract === 'undefined') {
      throw Object.assign(new Error('OCR 引擎未載入 / OCR engine not loaded'), { code: 'ENGINE_INIT_FAILED' });
    }

    // [P2 修復] 加上結尾斜線，防禦不同版本 Tesseract.js 的路徑拼接差異
    const langPath = new URL('../../vendor/tessdata/', import.meta.url).href;
    let worker;

    // [P1 修復] 將 createWorker 拉進 try/catch，防禦 404、IndexedDB 被擋、WASM 失敗等環境地雷
    try {
      worker = await Tesseract.createWorker(['chi_tra', 'eng'], 1, {
        logger: m => {
          let p = 10; 
          if (m.status === 'loading tesseract core') p = 10 + (m.progress * 10); 
          else if (m.status === 'loading language traineddata') p = 20 + (m.progress * 20); 
          else if (m.status.includes('initializing')) p = 40 + (m.progress * 10); 
          else if (m.status === 'recognizing text') p = 50 + (m.progress * 50); 
          
          if (p > 10) onProgress?.(Math.round(p));
        },
        langPath: langPath,
        cacheMethod: 'indexedDB'
      });
    } catch (err) {
      throw Object.assign(
        new Error('OCR 引擎初始化失敗，請檢查網路或重試 / Engine init failed'), 
        { code: 'ENGINE_INIT_FAILED' }
      );
    }

    try {
      const result = await worker.recognize(blob);
      await worker.terminate();
      
      return result.data.text.split('\n')
        .map(line => line.replace(/^([0-9０-９]+|[一二三四五六七八九十]+)[.．\、\s\-]+/, '').trim())
        .filter(line => line.length > 0 && !/^[-—_+=*#~`]+$/.test(line));
    } catch (err) {
      // [P2 修復] terminate 加上 try/catch，防止已崩潰的 worker 再次拋錯而吞噬掉最原始的 OCR_FAILED
      try { await worker.terminate(); } catch {}
      throw Object.assign(new Error(err.message || '文字辨識失敗 / Text recognition failed'), { code: 'OCR_FAILED' });
    }
  }
}
