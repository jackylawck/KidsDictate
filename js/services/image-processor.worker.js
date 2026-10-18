self.onmessage = async (e) => {
  const { id, file } = e.data;
  let bitmap = null;
  try {
    if (!file || typeof file.name !== 'string') {
      throw Object.assign(new Error('無效的檔案參數'), { code: 'INVALID_INPUT' });
    }

    const okExt = /\.(jpe?g|png|webp|heic|heif|avif|bmp)$/i.test(file.name);
    if (file.type ? !file.type.startsWith('image/') : !okExt) {
      throw Object.assign(new Error('不支援的圖片格式'), { code: 'INVALID_TYPE' });
    }
    if (file.size > 15 * 1024 * 1024) {
      throw Object.assign(new Error('圖片過大 (>15MB)'), { code: 'TOO_LARGE' });
    }
    if (typeof OffscreenCanvas === 'undefined') {
      throw Object.assign(new Error('瀏覽器過舊，不支援圖形加速'), { code: 'NO_OFFSCREEN_CANVAS' });
    }

    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (err) {
      // [UX 恢復] 保留 HEIC 特判，並給予專屬的 Actionable Code
      const isHeic = /\.(hei[cf])$/i.test(file.name);
      throw Object.assign(
        new Error(isHeic ? '此格式需轉為 JPG 後再試' : '圖片解碼失敗'),
        { code: isHeic ? 'HEIC_UNSUPPORTED' : 'DECODE_FAILED' }
      );
    }

    if (bitmap.width === 0 || bitmap.height === 0) {
      throw Object.assign(new Error('圖片尺寸異常'), { code: 'DECODE_FAILED' });
    }

    const MAX = 1600;
    const ratio = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw Object.assign(new Error('無法建立繪圖核心'), { code: 'NO_CONTEXT' });
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const hist = new Int32Array(256);
    
    for (let i = 0; i < d.length; i += 4) {
      const gray = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8; 
      d[i] = d[i+1] = d[i+2] = gray;
      hist[gray]++;
    }

    const totalPixels = d.length / 4;
    let p1 = 0, p99 = 255, count = 0;
    
    for (let i = 0; i < 256; i++) { count += hist[i]; if (count >= totalPixels * 0.01) { p1 = i; break; } }
    count = 0;
    for (let i = 255; i >= 0; i--) { count += hist[i]; if (count >= totalPixels * 0.01) { p99 = i; break; } }

    if (p99 > p1) {
      const lut = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        if (i <= p1) lut[i] = 0;
        else if (i >= p99) lut[i] = 255;
        else lut[i] = Math.round(((i - p1) / (p99 - p1)) * 255);
      }
      
      for (let i = 0; i < d.length; i += 4) {
        const v = lut[d[i]]; 
        d[i] = d[i+1] = d[i+2] = v;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
    
    self.postMessage({ id, status: 'success', blob: processedBlob });
  } catch (err) {
    self.postMessage({ id, status: 'error', code: err.code || 'UNKNOWN_ERROR', message: err.message });
  } finally {
    if (bitmap) bitmap.close();
  }
};
