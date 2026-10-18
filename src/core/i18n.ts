export type Locale = 'zh-HK' | 'en';

export const translations = {
  'zh-HK': {
    appTitle: '童心默書 KidsDictate',
    appSubtitle: '本機離線運算 · 零資料上傳 · 家長安心',
    privacyTitle: '🔒 隱私與安全說明 (家長請看)',
    privacyP1: '✅ 零資料上傳：照片與詞表只在手機記憶體內處理，絕對不上傳伺服器。',
    privacyP2: '✅ 離線可用：無追蹤碼、無廣告、不收集姓名或學校資料。',
    privacyP3: '✅ 開源可查：原始碼完全公開透明，任何人皆可審計。',
    photoBtn: '📸 影相或選取默書範圍',
    testVoiceBtn: '🔊 測試發音',
    startBtn: '▶ 開始默書',
    stopBtn: '⏹ 結束默書',
    pauseBtn: '⏸ 暫停',
    resumeBtn: '▶️ 繼續',
    replayBtn: '🔁 重聽這題',
    skipBtn: '⏭ 跳過',
    prevBtn: '⬅️ 上一題',
    printBtn: '🖨️ 列印答案',
    closeBtn: '關閉',
    langLabel: '語言發音',
    speedLabel: '語速調整',
    repeatLabel: '重複次數',
    pauseTimeLabel: '書寫停頓 (秒)',
    maskLabel: '默書時隱藏文字（防偷看）',
    maskedText: '🙈 專心聽音默寫中...',
    pausedStatus: '⏸ 已暫停（點擊繼續）',
    initVoiceStatus: '語音引擎初始化中...',
    writingStatus: '請書寫，剩餘 {sec} 秒',
    readingStatus: '第 {current} / {total} 次朗讀',
    progressText: '第 {current} / {total} 題',
    finishedToast: '🎉 默書完成，辛苦小朋友喇！',
    emptyInputError: '請先輸入或影相辨識默書內容！',
    answerSheetTitle: '📝 答案對照表',
    answerSheetDesc: '請家長根據下方清單，核對小朋友的默書簿：',
    dictationPlaceholder: '1. 影相後文字會自動顯示於此\n2. 家長可以修改錯字\n3. 每行一句，系統會逐行朗讀'
  },
  'en': {
    appTitle: 'KidsDictate',
    appSubtitle: 'Client-Side Only · Zero Data Retention · 100% Private',
    privacyTitle: '🔒 Privacy & Security Guarantee',
    privacyP1: '✅ Zero Data Upload: Photos & words are processed entirely in device memory.',
    privacyP2: '✅ Works Offline: Pure client-side processing with zero network trackers.',
    privacyP3: '✅ Open Source: 100% open-source and auditable code.',
    photoBtn: '📸 Take Photo or Select Image',
    testVoiceBtn: '🔊 Test Voice',
    startBtn: '▶ Start Dictation',
    stopBtn: '⏹ End',
    pauseBtn: '⏸ Pause',
    resumeBtn: '▶️ Resume',
    replayBtn: '🔁 Replay',
    skipBtn: '⏭ Skip',
    prevBtn: '⬅️ Previous',
    printBtn: '🖨️ Print Sheet',
    closeBtn: 'Close',
    langLabel: 'Voice Language',
    speedLabel: 'Voice Speed',
    repeatLabel: 'Repetitions',
    pauseTimeLabel: 'Writing Pause (s)',
    maskLabel: 'Hide text during dictation',
    maskedText: '🙈 Listen carefully and write...',
    pausedStatus: '⏸ Paused (Tap Resume)',
    initVoiceStatus: 'Initializing voice engine...',
    writingStatus: 'Writing time: {sec}s remaining',
    readingStatus: 'Reading {current} of {total}',
    progressText: 'Word {current} of {total}',
    finishedToast: '🎉 Dictation completed! Great job!',
    emptyInputError: 'Please enter or scan dictation words first!',
    answerSheetTitle: '📝 Answer Sheet',
    answerSheetDesc: 'Parents can check against the list below:',
    dictationPlaceholder: '1. OCR text will appear here.\n2. Parents can edit freely.\n3. One sentence per line.'
  }
} as const;

export type TranslationKey = keyof typeof translations['zh-HK'];

export class I18nService {
  private currentLocale: Locale;
  private listeners: Set<(locale: Locale) => void> = new Set();

  constructor() {
    const saved = localStorage.getItem('kidsdictate_locale') as Locale;
    if (saved && (saved === 'zh-HK' || saved === 'en')) {
      this.currentLocale = saved;
    } else {
      this.currentLocale = navigator.language.startsWith('zh') ? 'zh-HK' : 'en';
    }
    document.documentElement.lang = this.currentLocale;
  }

  public getLocale(): Locale { return this.currentLocale; }

  public setLocale(locale: Locale): void {
    if (this.currentLocale === locale) return;
    this.currentLocale = locale;
    localStorage.setItem('kidsdictate_locale', locale);
    document.documentElement.lang = locale;
    this.listeners.forEach(fn => fn(locale));
  }

  public t(key: TranslationKey, params?: Record<string, string | number>): string {
    let str: string = translations[this.currentLocale][key] || translations['zh-HK'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  }

  public onChange(listener: (locale: Locale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const i18n = new I18nService();
