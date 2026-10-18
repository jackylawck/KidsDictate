import { AppController } from './controllers/appController.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 綁定到 window 方便 DevTools 除錯（Console 可直接訪問 window.kidsDictateApp 查看狀態）
    window.kidsDictateApp = new AppController();

    // [v1.1 預留] PWA Service Worker 註冊點
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('[App] PWA Service Worker registered.', reg.scope),
        (err) => console.warn('[App] PWA SW registration failed:', err)
      );
    }
    */
  } catch (error) {
    // 系統致命錯誤，技術細節留在 Console，不在 UI 上暴露給家長看
    console.error('[KidsDictate] 系統致命錯誤，無法啟動:', error);
    
    // 極限降級防禦：純 DOM 操作，堅守零 innerHTML 原則，徹底杜絕 XSS
    document.body.replaceChildren();
    
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f8fafc;color:#334155;padding:20px;text-align:center;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fee2e2;color:#b91c1c;padding:20px;border-radius:12px;max-width:400px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);display:flex;flex-direction:column;align-items:center;';

    const h2 = document.createElement('h2');
    h2.textContent = '⚠️ 系統啟動失敗';
    h2.style.cssText = 'margin-top:0;font-size:1.25rem;font-weight:bold;';

    const p1 = document.createElement('p');
    p1.textContent = '很抱歉，應用程式無法初始化。這可能是因為您的瀏覽器版本較舊，或網路環境導致檔案載入不全。';
    p1.style.cssText = 'font-size:0.9rem;line-height:1.5;margin-bottom:10px;';

    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '重新整理';
    reloadBtn.style.cssText = 'margin-top:15px;padding:10px 24px;background:#b91c1c;color:white;border:none;border-radius:8px;font-size:0.9rem;font-weight:bold;cursor:pointer;box-shadow:0 2px 4px rgba(185,28,28,0.2);';
    reloadBtn.addEventListener('click', () => location.reload());

    card.append(h2, p1, reloadBtn);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
  }
});
