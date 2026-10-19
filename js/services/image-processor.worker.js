/**
 * 建立帶有專屬錯誤代碼的 Error 物件
 * [P3-3 優化] 避免產生 { code: undefined } 的無用屬性
 */
const createError = (message, code) => {
  const err = new Error(message);
  if (code) err.code = code;
  return err;
};

self.onmessage = async (e) => {
  const { id, file } = e.data;
  let bitmap = null;
  
  try {
    // 1. 基本安全與格式防禦
    if (!file || typeof file.name !== 'string') {
      throw createError('無效的檔案參數', 'INVALID_INPUT');
    }

    const okExt = /\.(jpe?g|png|webp|heic|heif|avif|bmp)$/i.test(file.name);
    if (file.type ? !file.type.startsWith('image/') : !okExt) {
      throw createError('不支援的圖片格式', 'INVALID_TYPE');
    }
    
    if (file.size > 15 * 1024 * 1024) {
      throw createError('圖片過大 (>15MB)', 'TOO_LARGE');
    }
    
    if (typeof OffscreenCanvas === 'undefined') {
      throw createError('瀏覽器過舊，不支援圖形加速', 'NO_OFFSCREEN_CANVAS');
    }

    // 2. 解碼與 EXIF 旋轉校正
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (err) {
      const isHeic = /\.(hei[cf])$/i.test(file.name);
      throw createError(
        isHeic ? '此格式需轉為 JPG 後再試' : '圖片解碼失敗',
        isHeic ? 'HEIC_UNSUPPORTED' : 'DECODE_FAILED'
      );
    }

    if (bitmap.width === 0 || bitmap.height === 0) {
      throw createError('圖片尺寸異常', 'DECODE_FAILED');
    }

    // 3. 降維壓縮 (最大 1600px)
    const MAX = 1600;
    const ratio = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw createError('無法建立繪圖核心', 'NO_CONTEXT');
    }
    
    ctx.fillStyle = '#FFF'; 
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    // 4. 高效灰階轉換 (Bitwise Shift 優化)
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const hist = new Int32Array(256);
    
    for (let i = 0; i < d.length; i += 4) {
      const gray = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8; 
      d[i] = d[i+1] = d[i+2] = gray;
      hist[gray]++;
    }

    // 5. 對比拉伸 (百分位 1% ~ 99% 消除極端雜訊)
    const totalPixels = d.length / 4;
    // [P3-1 優化] 修正命名，明確表達這是像素數量的計數閾值，而非灰階亮度閾值
    const percentileCount = totalPixels * 0.01; 
    let p1 = 0, p99 = 255, count = 0;
    
    for (let i = 0; i < 256; i++) { count += hist[i]; if (count >= percentileCount) { p1 = i; break; } }
    count = 0;
    for (let i = 255; i >= 0; i--) { count += hist[i]; if (count >= percentileCount) { p99 = i; break; } }

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

    // 6. 輸出最終結果
    ctx.putImageData(imgData, 0, 0);
    const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
    
    self.postMessage({ id, status: 'success', blob: processedBlob });
    
  } catch (err) {
    // [P3-2 優化] 對非 Error 實例的 throw 進行防禦，確保 message 永遠有值
    const errorMessage = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, status: 'error', code: err.code || 'UNKNOWN_ERROR', message: errorMessage });
  } finally {
    if (bitmap) bitmap.close();
  }
};
