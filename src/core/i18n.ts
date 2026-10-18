export type Locale = 'zh-HK' | 'en';

const STORAGE_KEY = 'kidsdictate_locale';

export const translations = {
  'zh-HK': {
    appTitle: '童心默書 KidsDictate',
    appSubtitle: '本機離線運算 · 零資料上傳 · 家長安心',
    privacyTitle: '🔒 隱私與安全說明 (家長請看)',
    privacyP1: '✅ 零資料上傳：照片與詞表只在手機記憶體內處理，絕對不上傳伺服器。',
    privacyP2: '✅ 本機運算：無追蹤碼、無廣告、不收集姓名或學校資料。',
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
    dictationPlaceholder: '1. 影相後文字會自動顯示於此\n2. 家長可以修改錯字\n3. 每行一句，系統會逐行朗讀',
    systemDefaultVoice: '(系統預設)',
    voiceLocal: '(本機)',
    voiceCloud: '(雲端)',
    ocrOk: '完成',
    ocrError: '辨識失敗',
    voiceListLoadError: '語音清單載入失敗，請重試',
    noVoiceAvailable: '⚠️ 此裝置無該語言的語音包',
    
    // [P1 修復] 補齊語系選單的翻譯 Key，解決 UI 上顯示 langZhHK 等原始 Key 名的問題
    langZhHK: '粵語 (廣東話)',
    langEnUS: 'English (US)',
    langEnGB: 'English (UK)'
  },
  'en': {
    appTitle: 'KidsDictate',
    appSubtitle: 'Client-Side Only · Zero Data Retention · 100% Private',
    privacyTitle: '🔒 Privacy & Security Guarantee',
    privacyP1: '✅ Zero Data Upload: Photos & words are processed entirely in device memory.',
    privacyP2: '✅ Local Processing: Zero network trackers, zero ads, no telemetry.',
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
    dictationPlaceholder: '1. OCR text will appear here.\n2. Parents can edit freely.\n3. One sentence per line.',
    systemDefaultVoice: '(System Default)',
    voiceLocal: '(Local)',
    voiceCloud: '(Cloud)',
    ocrOk: 'OK',
    ocrError: 'Error',
    voiceListLoadError: 'Failed to load voice list. Please try again.',
    noVoiceAvailable: '⚠️ No voice available for this language',

    // [P1 修復] 補齊語系選單的翻譯 Key，與 zh-HK 對稱以通過型別檢查
    langZhHK: 'Cantonese',
    langEnUS: 'English (US)',
    langEnGB: 'English (UK)'
  }
} as const;

export type TranslationKey = keyof typeof translations['zh-HK'];

// 純型別編譯期檢查：若雙語 Key 不對稱，TSC 將強制報錯
type KeysOf<T> = keyof T;
type ZhKeys = KeysOf<typeof translations['zh-HK']>;
type EnKeys = KeysOf<typeof translations['en']>;
type AssertEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type _EnforceTrue<T extends true> = T;
export type _CheckKeys = _EnforceTrue<AssertEqual<ZhKeys, EnKeys>>;

export class I18nService {
  private currentLocale: Locale;
  private listeners: Set<(locale: Locale) => void> = new Set();

  constructor() {
    this.currentLocale = this.safeGetLocale();
    document.documentElement.lang = this.currentLocale;
  }

  private safeGetLocale(): Locale {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    
    if (saved === 'zh-HK' || saved === 'en') return saved;
    return navigator.language.startsWith('zh') ? 'zh-HK' : 'en';
  }

  private safeSetLocale(locale: Locale): void {
    try { 
      localStorage.setItem(STORAGE_KEY, locale); 
    } catch {} 
  }

  public getLocale(): Locale { return this.currentLocale; }

  public setLocale(locale: Locale): void {
    if (this.currentLocale === locale) return;
    this.currentLocale = locale;
    this.safeSetLocale(locale);
    document.documentElement.lang = locale;
    
    this.listeners.forEach(fn => {
      try {
        fn(locale);
      } catch (e) {
        console.warn('[i18n] listener issue:', e);
      }
    });
  }

  public t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dict = translations[this.currentLocale] as Record<TranslationKey, string>;
    const fallbackDict = translations['zh-HK'] as Record<TranslationKey, string>;
    let str: string = dict[key] ?? fallbackDict[key] ?? key;

    if (params) {
      str = str.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }
    
    return str;
  }

  public onChange(listener: (locale: Locale) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const i18n = new I18nService();
