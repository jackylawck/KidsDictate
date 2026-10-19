export type Locale = 'zh-HK' | 'en';

const STORAGE_KEY = 'kidsdictate_locale';

export const translations = {
  'zh-HK': {
    appTitle: '童心默書 KidsDictate',
    appSubtitle: '本機運算 · 零資料上傳 · 家長安心',
    privacyTitle: '🔒 隱私與安全說明 (家長請看)',
    privacyP1: '✅ 零資料上傳：照片與詞表只在手機記憶體內處理，絕對不上傳伺服器。',
    privacyP2: '✅ 本機運算：無追蹤碼、無廣告、不收集姓名或學校資料。',
    privacyP3: '✅ 開源可查：原始碼完全公開透明，任何人皆可審計。',
    
    // [新增] 誠實聲明與新排版的翻譯
    inputLabel: '📝 輸入默書內容',
    ocrToggle: '📸 圖片掃描 (Beta) 與 💡 AI 輔助',
    ocrDisclaimerTitle: '⚠️ 系統限制誠實聲明：',
    ocrDisclaimerP1: '為堅守「100% 離線運算、零資料上傳」的隱私承諾，本機掃描引擎能力有限。',
    ocrDisclaimerP2: '❌ 無法處理：中英拼音夾雜、手寫筆記塗鴉、複雜插圖背景。',
    ocrDisclaimerP3: '如果課本排版較複雜，請直接使用下方的「AI 輔助」功能。',
    photoBtnSimple: '嘗試掃描簡單純文字版面',

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
    
    langZhHK: '粵語 (廣東話)',
    langZhCN: '普通話 (Mandarin)',
    langEnUS: 'English (US)',
    langEnGB: 'English (UK)',

    silentModeHint: '🔊 若聽不到聲音，請檢查 iPhone 側邊的靜音開關是否已關閉。',
    ocrErrEngineInit: '辨識引擎初始化失敗，請檢查網絡或重試',
    ocrErrEngineNotLoaded: 'OCR 引擎未載入',
    ocrErrTimeout: '圖片處理超時，請重試',
    ocrErrWorkerCrash: '圖片處理失敗，請重試',
    voiceSelectLabel: '聲音選擇',

    aiTipTitle: '💡 圖片排版太複雜，辨識亂碼？',
    aiTipDesc: '建議您使用自己的 AI 工具 (如 ChatGPT, Claude)，一鍵複製下方提示詞並附上照片，即可獲得精準的默書文字！',
    aiPromptText: '你是一位小學默書助手。請辨識我上傳圖片中的默書詞語或句子。過濾掉姓名、日期、注音拼音與無關指示。修正明顯的錯別字。輸出格式必須為純文字，每個詞語或句子獨立成一行。不要包含任何開頭問候或編號。',
    copyPromptBtn: '📋 一鍵複製提示詞 (Copy Prompt)',
    promptCopied: '已複製提示詞！請前往您的 AI 工具貼上',
    promptCopyFailed: '複製失敗，請手動選取複製'
  },
  'en': {
    appTitle: 'KidsDictate',
    appSubtitle: 'Local Processing · Zero Data Upload · 100% Private',
    privacyTitle: '🔒 Privacy & Security Guarantee',
    privacyP1: '✅ Zero Data Upload: Photos & words are processed entirely in device memory.',
    privacyP2: '✅ Local Processing: Zero network trackers, zero ads, no telemetry.',
    privacyP3: '✅ Open Source: 100% open-source and auditable code.',
    
    // [新增] 誠實聲明與新排版的翻譯 (英文版)
    inputLabel: '📝 Enter Dictation Text',
    ocrToggle: '📸 Image Scan (Beta) & 💡 AI Assistant',
    ocrDisclaimerTitle: '⚠️ Honest System Limitations:',
    ocrDisclaimerP1: 'To keep our "100% Offline, Zero Upload" privacy promise, the local scanning engine has limits.',
    ocrDisclaimerP2: '❌ Cannot process: Mixed Pinyin, handwriting, or complex backgrounds.',
    ocrDisclaimerP3: 'If the layout is complex, please use the "AI Assistant" feature below.',
    photoBtnSimple: 'Scan simple text layout',

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

    langZhHK: 'Cantonese',
    langZhCN: 'Mandarin (Putonghua)',
    langEnUS: 'English (US)',
    langEnGB: 'English (UK)',

    silentModeHint: '🔊 If you hear no sound, check the silent switch on the side of your iPhone.',
    ocrErrEngineInit: 'OCR engine init failed. Please check network and retry.',
    ocrErrEngineNotLoaded: 'OCR engine not loaded',
    ocrErrTimeout: 'Image processing timeout. Please retry.',
    ocrErrWorkerCrash: 'Image processing failed. Please retry.',
    voiceSelectLabel: 'Voice',

    aiTipTitle: '💡 Complex Layout? OCR Failed?',
    aiTipDesc: 'We recommend using your own AI tool (e.g., ChatGPT, Claude). Copy the prompt below and attach the photo to get accurate dictation text!',
    aiPromptText: 'You are a primary school dictation assistant. Please extract the dictation vocabulary or sentences from the uploaded image. Ignore names, dates, pinyin, and unrelated instructions. Fix obvious typos. Output strictly as plain text, with each word or sentence on a new line. Do not include greetings or numbering.',
    copyPromptBtn: '📋 Copy Prompt',
    promptCopied: 'Prompt copied! Please paste it into your AI tool.',
    promptCopyFailed: 'Copy failed. Please select and copy manually.'
  }
} as const;

export type TranslationKey = keyof typeof translations['zh-HK'];

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
