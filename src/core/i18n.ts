export const translations = {
  'zh-HK': {
    appTitle: '童心默書 KidsDictate',
    appSubtitle: '本機離線運算 · 零資料上傳 · 家長安心',
    // ... 其餘按鈕與狀態設定保持不變
  },
  'en': {
    appTitle: 'KidsDictate',
    appSubtitle: 'Client-Side Only · Zero Data Retention · 100% Private',
    // ... 其餘按鈕與狀態設定保持不變
  }
} as const;

// 儲存偏好的 Key 同步規範化
localStorage.getItem('kidsdictate_locale');
localStorage.setItem('kidsdictate_locale', locale);
