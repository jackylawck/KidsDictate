import { i18n } from '../core/i18n.js';
import { SpeechEngine } from '../services/SpeechEngine.js';
import { SpeechService } from '../services/speechService.js';
import { OcrService } from '../services/ocrService.js';

export class AppController {
  constructor() {
    try {
      this.engine = new SpeechEngine();
      this.testEngine = new SpeechEngine();
    } catch {
      // [P3-5] 保留防禦未來 constructor 加驗證
      this.engine = { play: () => this.showToast('語音功能不可用', 'error'), stop: () => {}, initVoices: async () => {}, isSupported: false, isPaused: () => false };
      this.testEngine = this.engine;
    }
    
    this.engine.onVoicesReady = () => this.populateVoices();

    this.speechService = new SpeechService(this.engine);
    this.countdownInterval = null;
    this.currentWordText = '';
    this.remainingSec = 0;
    this.totalPauseSec = 8;
    
    // 狀態快取與並發鎖
    this._populatingVoices = null; 
    this._unsubI18n = null;        
    this._lastRepeatStatus = '';   // [P2-2] 記住朗讀進度，以便從暫停中恢復
    this._ocrToken = 0;            // [P3-1] 防止連續上傳的進度與結果互蓋
    this._ocrHideTimer = null;     // [P3-2] 防止連續上傳時，舊 timer 提早關閉 UI

    this.initElements();
    this.bindEvents();
    this.updateDomTranslations();
  }

  initElements() {
    this.el = {
      imageInput: document.getElementById('imageInput'),
      ocrProgressBox: document.getElementById('ocrProgressBox'),
      ocrStatusText: document.getElementById('ocrStatusText'),
      ocrProgressBar: document.getElementById('ocrProgressBar'),
      dictationText: document.getElementById('dictationText'),
      langSelect: document.getElementById('langSelect'),
      voiceSelect: document.getElementById('voiceSelect'),
      repeatSelect: document.getElementById('repeatSelect'),
      rateRange: document.getElementById('rateRange'),
      rateLabel: document.getElementById('rateLabel'),
      pauseInput: document.getElementById('pauseInput'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      playingCard: document.getElementById('playingCard'),
      progressIndex: document.getElementById('progressIndex'),
      repeatStatus: document.getElementById('repeatStatus'),
      wordDisplay: document.getElementById('wordDisplay'),
      maskToggle: document.getElementById('maskToggle'),
      testVoiceBtn: document.getElementById('testVoiceBtn'),
      replayBtn: document.getElementById('replayBtn'),
      skipBtn: document.getElementById('skipBtn'),
      prevBtn: document.getElementById('prevBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      countdownVisual: document.getElementById('countdownVisual'),
      countdownText: document.getElementById('countdownText'),
      countdownBar: document.getElementById('countdownBar'),
      toastContainer: document.getElementById('toastContainer'),
      answerSheet: document.getElementById('answerSheet'),
      answerList: document.getElementById('answerList'),
      closeAnswerBtn: document.getElementById('closeAnswerBtn'),
      printAnswerBtn: document.getElementById('printAnswerBtn'),
      langZhBtn: document.getElementById('langZhBtn'),
      langEnBtn: document.getElementById('langEnBtn')
    };
  }

  updateDomTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      if (el.tagName === 'INPUT' && el.type === 'button') {
        el.value = i18n.t(key);
      } else if (el.tagName === 'TEXTAREA' && key === 'dictationPlaceholder') {
        el.placeholder = i18n.t(key);
      } else {
        el.textContent = i18n.t(key);
      }
    });

    if (this.speechService.isActive) {
      this.renderWordDisplay();
      if (this.el.pauseBtn) {
        this.el.pauseBtn.textContent = this.speechService.isPaused() ? i18n.t('resumeBtn') : i18n.t('pauseBtn');
      }
      // [P2-3] 動態文字更新：恢復暫停/朗讀狀態
      if (this.el.repeatStatus) {
        this.el.repeatStatus.textContent = this.speechService.isPaused() ? i18n.t('pausedStatus') : this._lastRepeatStatus;
      }
    }

    if (this.el.countdownVisual && !this.el.countdownVisual.classList.contains('hidden')) {
      if (this.el.countdownText) {
        this.el.countdownText.textContent = i18n.t('writingStatus', { sec: this.remainingSec });
      }
    }

    const locale = i18n.getLocale();
    this.el.langZhBtn?.classList.toggle('bg-slate-200', locale === 'zh-HK');
    this.el.langEnBtn?.classList.toggle('bg-slate-200', locale === 'en');
    this.el.langZhBtn?.setAttribute('aria-pressed', String(locale === 'zh-HK'));
    this.el.langEnBtn?.setAttribute('aria-pressed', String(locale === 'en'));

    // [P2-3] 切換語言時，重新填充語音選單，讓「(本機)/(雲端)」也跟著翻譯
    this.populateVoices();
  }

  renderWordDisplay() {
    if (this.el.maskToggle && this.el.maskToggle.checked) {
      this.el.wordDisplay.textContent = i18n.t('maskedText');
      this.el.wordDisplay.className = 'text-base font-bold text-slate-400 py-4 min-h-[64px] flex items-center justify-center select-none';
    } else {
      this.el.wordDisplay.textContent = this.currentWordText;
      this.el.wordDisplay.className = 'text-3xl font-black text-slate-800 tracking-wide py-4 min-h-[64px] flex items-center justify-center';
    }
  }

  setPlaybackUI(isPlaying) {
    this.el.startBtn.classList.toggle('hidden', isPlaying);
    this.el.stopBtn.classList.toggle('hidden', !isPlaying);
    this.el.playingCard.classList.toggle('hidden', !isPlaying);
    this.el.testVoiceBtn.disabled = isPlaying;
    
    if (isPlaying) {
      this.el.answerSheet.classList.add('hidden');
      this.el.answerList.replaceChildren();
      this.resetPauseButtonUI();
    }
  }

  // [P2-2] 解除暫停時，精準恢復原有的朗讀狀態顯示
  resetPauseButtonUI() {
    this.el.pauseBtn.textContent = i18n.t('pauseBtn');
    this.el.pauseBtn.className = 'px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm';
    if (this._lastRepeatStatus && this.speechService.isActive && !this.speechService.isPaused()) {
      this.el.repeatStatus.textContent = this._lastRepeatStatus;
    }
  }

  async populateVoices() {
    if (this._populatingVoices) return this._populatingVoices;
    
    this._populatingVoices = (async () => {
      try {
        await this.engine.initVoices();
        
        const prev = this.el.voiceSelect?.value;
        const lang = this.el.langSelect.value;
        const list = this.engine.getVoiceListForLang ? this.engine.getVoiceListForLang(lang) : [];
        
        this.el.voiceSelect.replaceChildren();
        
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = i18n.t('systemDefaultVoice');
        this.el.voiceSelect.appendChild(defaultOpt);

        list.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.name;
          const typeStr = v.localService === true ? i18n.t('voiceLocal') : (v.localService === false ? i18n.t('voiceCloud') : '');
          let displayName = `${v.name} ${typeStr}`.trim();
          if (displayName.length > 30) displayName = displayName.substring(0, 27) + '...';
          opt.textContent = displayName;
          this.el.voiceSelect.appendChild(opt);
        });

        // [P2-1] 防禦原生 DOM value 覆蓋行為：顯式回退到系統預設
        if (prev && [...this.el.voiceSelect.options].some(o => o.value === prev)) {
          this.el.voiceSelect.value = prev;
        } else {
          this.el.voiceSelect.value = '';
        }
      } catch (err) {
        this.showToast(i18n.t('voiceListLoadError'), 'error');
      } finally {
        this._populatingVoices = null;
      }
    })();
    
    return this._populatingVoices;
  }

  bindEvents() {
    this.el.langZhBtn?.addEventListener('click', () => i18n.setLocale('zh-HK'));
    this.el.langEnBtn?.addEventListener('click', () => i18n.setLocale('en'));
    
    this._unsubI18n = i18n.onChange(() => this.updateDomTranslations());

    this.el.langSelect.addEventListener('change', () => this.populateVoices());
    this.populateVoices();

    this.el.rateRange.addEventListener('input', () => {
      this.el.rateLabel.textContent = `${this.el.rateRange.value}x`;
    });

    this.el.maskToggle?.addEventListener('change', () => this.renderWordDisplay());

    this.el.imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // [P3-1 & P3-2] 防禦 OCR 連續點擊並發覆蓋
      const token = ++this._ocrToken;
      if (this._ocrHideTimer) clearTimeout(this._ocrHideTimer);

      this.el.ocrProgressBox.classList.remove('hidden');
      this.el.ocrProgressBar.style.width = '10%';
      this.el.ocrStatusText.textContent = i18n.t('initVoiceStatus');
      try {
        const words = await OcrService.recognizeText(file, (p) => {
          if (token !== this._ocrToken) return;
          this.el.ocrProgressBar.style.width = `${p}%`;
          this.el.ocrStatusText.textContent = `OCR ${p}%`;
        });
        if (token !== this._ocrToken) return;
        this.el.dictationText.value = words.join('\n');
        this.el.ocrStatusText.textContent = i18n.t('ocrOk');
      } catch (err) {
        if (token !== this._ocrToken) return;
        this.showToast(err.message, 'error');
        this.el.ocrStatusText.textContent = i18n.t('ocrError');
      } finally {
        if (token === this._ocrToken) {
          this._ocrHideTimer = setTimeout(() => this.el.ocrProgressBox.classList.add('hidden'), 2000);
          this.el.imageInput.value = '';
        }
      }
    });

    this.el.testVoiceBtn.addEventListener('click', async () => {
      if (this.speechService.isActive) return;
      const lang = this.el.langSelect.value;
      const rate = parseFloat(this.el.rateRange.value);
      const voiceName = this.el.voiceSelect.value; 
      const text = lang.startsWith('en') ? 'Testing voice setup.' : '測試語音發音，一二三四';
      
      this.el.testVoiceBtn.disabled = true;
      const unlockBtn = () => { this.el.testVoiceBtn.disabled = false; };
      try {
        await this.testEngine.play(text, { lang, rate, voiceName }, {
          onEnd: unlockBtn, onInterrupted: unlockBtn, onError: (err) => { this.showToast(err, 'error'); unlockBtn(); }
        });
      } catch (e) { 
        this.showToast(e.message || '測試語音失敗', 'error'); 
        unlockBtn(); 
      }
    });

    this.el.startBtn.addEventListener('click', () => this.handleStart());
    this.el.stopBtn.addEventListener('click', () => this.handleStop());
    this.el.replayBtn.addEventListener('click', () => { this.resetPauseButtonUI(); this.speechService.replayCurrent(); });
    this.el.skipBtn.addEventListener('click', () => { this.resetPauseButtonUI(); this.speechService.skipCurrent(); });
    this.el.prevBtn.addEventListener('click', () => { this.resetPauseButtonUI(); this.speechService.prevCurrent(); });

    this.el.pauseBtn.addEventListener('click', () => {
      if (!this.speechService.isActive) return;
      if (this.speechService.isPaused()) {
        if (this.speechService.resume()) this.resetPauseButtonUI();
      } else {
        if (this.speechService.pause()) {
          this.el.pauseBtn.textContent = i18n.t('resumeBtn');
          this.el.pauseBtn.className = 'px-4 py-2 bg-amber-50 text-amber-600 border border-amber-300 rounded-lg text-sm font-bold shadow-sm';
          this.el.repeatStatus.textContent = i18n.t('pausedStatus');
        }
      }
    });

    this.el.closeAnswerBtn.addEventListener('click', () => this.el.answerSheet.classList.add('hidden'));
    this.el.printAnswerBtn.addEventListener('click', () => window.print());
  }

  showToast(message, type = 'info') {
    const el = document.createElement('div');
    const bg = type === 'error' ? 'bg-rose-600' : (type === 'success' ? 'bg-emerald-600' : 'bg-slate-800');
    el.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-bold opacity-0 transition-opacity duration-300 ${bg} text-white`;
    el.textContent = message;
    this.el.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.remove('opacity-0'));
    setTimeout(() => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 300); }, 4000);
  }

  startCountdown(totalSeconds) {
    this.totalPauseSec = totalSeconds;
    this.remainingSec = totalSeconds;
    this.el.countdownVisual.classList.remove('hidden');
    this.el.countdownText.textContent = i18n.t('writingStatus', { sec: this.remainingSec });
    this.el.countdownBar.style.width = '100%';
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (this.speechService.isPaused()) return; 
      this.remainingSec--;
      if (this.remainingSec < 0) {
        clearInterval(this.countdownInterval);
        this.el.countdownVisual.classList.add('hidden');
        return;
      }
      this.el.countdownText.textContent = i18n.t('writingStatus', { sec: this.remainingSec });
      this.el.countdownBar.style.width = `${(this.remainingSec / this.totalPauseSec) * 100}%`;
    }, 1000);
  }

  handleStart() {
    const items = this.el.dictationText.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return this.showToast(i18n.t('emptyInputError'), 'error');

    const config = {
      lang: this.el.langSelect.value,
      voiceName: this.el.voiceSelect.value, 
      rate: parseFloat(this.el.rateRange.value),
      repeats: parseInt(this.el.repeatSelect.value, 10),
      pauseSec: parseInt(this.el.pauseInput.value, 10) || 8
    };
    
    this.setPlaybackUI(true);

    this.speechService.startQueue(items, config, {
      onEngineInit: () => { 
        this._lastRepeatStatus = i18n.t('initVoiceStatus');
        this.el.repeatStatus.textContent = this._lastRepeatStatus;
      },
      onStepChange: (data) => {
        clearInterval(this.countdownInterval);
        this.el.countdownVisual.classList.add('hidden');
        this.el.progressIndex.textContent = i18n.t('progressText', { current: data.index + 1, total: data.total });
        
        this._lastRepeatStatus = i18n.t('readingStatus', { current: 1, total: data.totalRepeats });
        this.el.repeatStatus.textContent = this._lastRepeatStatus;
        
        this.currentWordText = data.text;
        this.renderWordDisplay();
      },
      onRepeat: (current, total) => { 
        this._lastRepeatStatus = i18n.t('readingStatus', { current, total });
        this.el.repeatStatus.textContent = this._lastRepeatStatus;
      },
      onWritingPause: (seconds) => { this.startCountdown(seconds); },
      onComplete: () => {
        this.handleStop();
        this.showToast(i18n.t('finishedToast'), 'success');
        this.showAnswerSheet(items);
      },
      onError: (errMsg) => { this.handleStop(); this.showToast(errMsg, 'error'); }
    }).catch(err => {
      this.handleStop();
      this.showToast(err.message || '啟動語音引擎失敗，請重試', 'error');
    });
  }

  handleStop() {
    // 避免重複執行（例如 onError 和 catch 雙重觸發）
    if (!this.speechService.isActive) return;
    this.speechService.stop();
    clearInterval(this.countdownInterval);
    this.el.countdownVisual.classList.add('hidden');
    this.setPlaybackUI(false);
  }

  showAnswerSheet(items) {
    const list = this.el.answerList;
    list.replaceChildren();
    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'flex border-b border-slate-100 py-3';
      const num = document.createElement('span');
      num.className = 'w-8 text-slate-400 font-bold';
      num.textContent = `${i + 1}.`;
      const word = document.createElement('span');
      word.className = 'text-xl font-black text-slate-800 tracking-wide';
      word.textContent = item;
      row.append(num, word);
      list.appendChild(row);
    });
    this.el.answerSheet.classList.remove('hidden');
  }

  destroy() {
    if (this._unsubI18n) this._unsubI18n();
    this.handleStop();
    // 單頁應用暫無 router，若未來擴充 SPA，需手動 removeEventListener 解除 DOM 事件綁定
  }
}
