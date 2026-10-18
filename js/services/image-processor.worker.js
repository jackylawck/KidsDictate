self.onmessage = async (e) => {
  const { id, file } = e.data;
  let bitmap = null;
  try {
    const okExt = /\.(jpe?g|png|webp|heic|heif|avif|bmp)$/i.test(file.name);
    if (file.type ? !file.type.startsWith('image/') : !okExt) throw Object.assign(new Error('不支援的圖片格式'), { code: 'INVALID_TYPE' });
    if (file.size > 15 * 1024 * 1024) throw Object.assign(new Error('圖片過大'), { code: 'TOO_LARGE' });
    if (typeof OffscreenCanvas === 'undefined') throw Object.assign(new Error('不支援背景圖形加速'), { code: 'NO_OFFSCREEN_CANVAS' });

    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (err) {
      const msg = /\.(hei[cf])$/i.test(file.name) ? '此格式需轉為 JPG' : '圖片解碼失敗';
      throw Object.assign(new Error(msg), { code: 'DECODE_FAILED' });
    }

    if (bitmap.width === 0 || bitmap.height === 0) throw Object.assign(new Error('圖片尺寸異常'), { code: 'DECODE_FAILED' });

    const MAX = 1600;
    const ratio = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const hist = new Int32Array(256);
    for (let i = 0; i < d.length; i += 4) {
      const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      d[i] = d[i+1] = d[i+2] = gray;
      hist[gray]++;
    }

    const totalPixels = d.length / 4;
    let p1 = 0, p99 = 255, count = 0;
    for (let i = 0; i < 256; i++) { count += hist[i]; if (count > totalPixels * 0.01) { p1 = i; break; } }
    count = 0;
    for (let i = 255; i >= 0; i--) { count += hist[i]; if (count > totalPixels * 0.01) { p99 = i; break; } }

    if (p99 > p1) {
      for (let i = 0; i < d.length; i += 4) {
        let v = d[i];
        if (v <= p1) v = 0; else if (v >= p99) v = 255; else v = ((v - p1) / (p99 - p1)) * 255;
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
