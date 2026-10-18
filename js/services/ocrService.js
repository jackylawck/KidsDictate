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

  static preprocess(file) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.pending.set(id, { resolve, reject });
      this.getWorker().postMessage({ id, file });
    });
  }

  static async recognizeText(file, onProgress) {
    const blob = await this.preprocess(file);
    if (typeof Tesseract === 'undefined') throw Object.assign(new Error('OCR 引擎加載失敗'), { code: 'ENGINE_INIT_FAILED' });

    const langPath = new URL('../../vendor/tessdata', import.meta.url).href;
    const worker = await Tesseract.createWorker(['chi_tra', 'eng'], 1, {
      logger: m => m.status === 'recognizing text' && onProgress?.(Math.round(m.progress * 100)),
      langPath: langPath,
      cacheMethod: 'indexedDB'
    });

    try {
      const result = await worker.recognize(blob);
      await worker.terminate();
      return result.data.text.split('\n').map(line => line.replace(/^[0-9]+[.\、\s\-]+/, '').trim()).filter(line => line.length > 0 && !/^[-—_+=*#~`]+$/.test(line));
    } catch (err) {
      await worker.terminate();
      throw err;
    }
  }
}
