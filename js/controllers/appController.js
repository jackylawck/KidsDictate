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
      this.engine = { play: () => this.showToast('語音功能不可用', 'error'), stop: () => {}, initVoices: async () => {}, isSupported: false, isPaused: () => false };
      this.testEngine = this.engine;
    }
    
    this.engine.onVoicesReady = () => this.populateVoices();

    this.speechService = new SpeechService(this.engine);
    this.countdownInterval = null;
    this.currentWordText = '';
    this.remainingSec = 0;
    this.totalPauseSec = 8;
    
    this._populatingVoices = null; 
    this._unsubI18n = null;        
    this._lastRepeatStatus = '';   
    this._ocrToken = 0;            
    this._ocrHideTimer = null;     

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

    this._updateRateRangeAria();
    if (!this.speechService.isActive) this.populateVoices();
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
    this.el.startBtn?.classList.toggle('hidden', isPlaying);
    this.el.stopBtn?.classList.toggle('hidden', !isPlaying);
    this.el.playingCard?.classList.toggle('hidden', !isPlaying);
    if (this.el.testVoiceBtn) this.el.testVoiceBtn.disabled = isPlaying;
    
    if (isPlaying) {
      this.el.answerSheet?.classList.add('hidden');
      this.el.answerList?.replaceChildren();
      this.resetPauseButtonUI();
    }
  }

  setNavButtonsDisabled(isDisabled) {
    if (this.el.replayBtn) this.el.replayBtn.disabled = isDisabled;
    if (this.el.skipBtn) this.el.skipBtn.disabled = isDisabled;
    if (this.el.prevBtn) this.el.prevBtn.disabled = isDisabled;
  }

  resetPauseButtonUI() {
    if (!this.el.pauseBtn) return;
    this.el.pauseBtn.textContent = i18n.t('pauseBtn');
    this.el.pauseBtn.className = 'px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm';
    if (this._lastRepeatStatus && this.speechService.isActive && !this.speechService.isPaused() && this.el.repeatStatus) {
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

        if (list.length === 0) {
          const noVoiceOpt = document.createElement('option');
          noVoiceOpt.disabled = true;
          noVoiceOpt.textContent = i18n.t('noVoiceAvailable');
          this.el.voiceSelect.appendChild(noVoiceOpt);
        }

        list.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.name;
          const typeStr = v.localService === true ? i18n.t('voiceLocal') : (v.localService === false ? i18n.t('voiceCloud') : '');
          const langTag = v.lang ? `(${v.lang})` : ''; 
          let displayName = `${v.name} ${langTag} ${typeStr}`.trim();
          if (displayName.length > 40) displayName = displayName.substring(0, 37) + '...';
          opt.textContent = displayName;
          this.el.voiceSelect.appendChild(opt);
        });

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

  _updateRateRangeAria() {
    if (!this.el.rateRange) return;
    const val = this.el.rateRange.value;
    const unit = i18n.getLocale() === 'zh-HK' ? ' 倍' : 'x';
    const text = `${val}${unit}`;
    
    this.el.rateRange.setAttribute('aria-valuetext', text);
    if (this.el.rateLabel) this.el.rateLabel.textContent = text;
  }

  bindEvents() {
    this.el.langZhBtn?.addEventListener('click', () => i18n.setLocale('zh-HK'));
    this.el.langEnBtn?.addEventListener('click', () => i18n.setLocale('en'));
    
    this._unsubI18n = i18n.onChange(() => this.updateDomTranslations());

    this.el.langSelect.addEventListener('change', () => this.populateVoices());
    this.populateVoices();

    this._updateRateRangeAria();

    this.el.rateRange.addEventListener('input', () => {
      this._updateRateRangeAria();
    });

    this.el.maskToggle?.addEventListener('change', () => this.renderWordDisplay());

    // 綁定複製 AI 提示詞按鈕
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const promptText = i18n.t('aiPromptText');
        try {
          await navigator.clipboard.writeText(promptText);
          this.showToast(i18n.t('promptCopied'), 'success');
        } catch (err) {
          this.showToast(i18n.t('promptCopyFailed'), 'error');
        }
      });
    }

    this.el.imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
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
        
        const msgMap = {
          INVALID_INPUT: 'ocrErrInvalidInput',
          INVALID_TYPE: 'ocrErrInvalidType',
          TOO_LARGE: 'ocrErrTooLarge',
          NO_OFFSCREEN_CANVAS: 'ocrErrNoCanvas',
          DECODE_FAILED: 'ocrErrDecodeFailed',
          HEIC_UNSUPPORTED: 'ocrErrHeic', 
          NO_CONTEXT: 'ocrErrNoContext',
          ENGINE_INIT_FAILED: 'ocrErrEngineInit',
          ENGINE_NOT_LOADED: 'ocrErrEngineNotLoaded',
          TIMEOUT: 'ocrErrTimeout',
          WORKER_CRASH: 'ocrErrWorkerCrash'
        };
        const key = msgMap[err.code];
        this.showToast(key ? i18n.t(key) : err, 'error');
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
      
      // 動態根據語系設定測試文字，包含普通話
      let text = '測試語音發音，一二三四';
      if (lang.startsWith('en')) text = 'Testing voice setup.';
      if (lang === 'zh-CN') text = '测试语音发音，一二三四';
      
      this.el.testVoiceBtn.disabled = true;
      const unlockBtn = () => { if (this.el.testVoiceBtn) this.el.testVoiceBtn.disabled = false; };
      
      // [核心防禦] iOS Safari 語音解鎖機制：在 click 事件中同步觸發一次極短無聲音訊
      if (window.speechSynthesis) {
        const unlockMsg = new SpeechSynthesisUtterance('一');
        unlockMsg.volume = 0.01; 
        unlockMsg.rate = 10;
        unlockMsg.lang = lang;
        window.speechSynthesis.speak(unlockMsg);
      }

      try {
        await this.testEngine.play(text, { lang, rate, voiceName }, {
          onEnd: unlockBtn, onInterrupted: unlockBtn, onError: (err) => { this.showToast(err, 'error'); unlockBtn(); }
        });
      } catch (e) { 
        this.showToast(e || '測試語音失敗', 'error'); 
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
          if (this.el.repeatStatus) this.el.repeatStatus.textContent = i18n.t('pausedStatus');
        }
      }
    });

    this.el.closeAnswerBtn.addEventListener('click', () => this.el.answerSheet.classList.add('hidden'));
    this.el.printAnswerBtn.addEventListener('click', () => window.print());
  }

  showToast(message, type = 'info') {
    if (!this.el.toastContainer) return;
    
    const text = message instanceof Error ? message.message : message;

    const el = document.createElement('div');
    const bg = type === 'error' ? 'bg-rose-600' : (type === 'success' ? 'bg-emerald-600' : 'bg-slate-800');
    el.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-bold opacity-0 transition-opacity duration-300 ${bg} text-white`;
    el.textContent = text;
    this.el.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.remove('opacity-0'));
    setTimeout(() => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 300); }, 4000);
  }

  startCountdown(totalSeconds) {
    this.totalPauseSec = totalSeconds;
    this.remainingSec = totalSeconds;
    this.el.countdownVisual?.classList.remove('hidden');
    if (this.el.countdownText) this.el.countdownText.textContent = i18n.t('writingStatus', { sec: this.remainingSec });
    if (this.el.countdownBar) this.el.countdownBar.style.width = '100%';
    
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (this.speechService.isPaused()) return; 
      this.remainingSec--;
      if (this.remainingSec < 0) {
        clearInterval(this.countdownInterval);
        this.el.countdownVisual?.classList.add('hidden');
        return;
      }
      if (this.el.countdownText) this.el.countdownText.textContent = i18n.t('writingStatus', { sec: this.remainingSec });
      if (this.el.countdownBar) this.el.countdownBar.style.width = `${(this.remainingSec / this.totalPauseSec) * 100}%`;
    }, 1000);
  }

  handleStart() {
    const items = this.el.dictationText.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return this.showToast(i18n.t('emptyInputError'), 'error');

    const lang = this.el.langSelect.value;
    const voicesForLang = this.engine.getVoiceListForLang?.(lang) ?? [];
    if (voicesForLang.length === 0) {
      return this.showToast(i18n.t('noVoiceAvailable'), 'error');
    }

    const config = {
      lang: lang,
      voiceName: this.el.voiceSelect.value, 
      rate: parseFloat(this.el.rateRange.value),
      repeats: parseInt(this.el.repeatSelect.value, 10),
      pauseSec: parseInt(this.el.pauseInput.value, 10) || 8
    };
    
    this.setPlaybackUI(true);

    if (window.speechSynthesis) {
      const unlockMsg = new SpeechSynthesisUtterance('一');
      unlockMsg.volume = 0.01; 
      unlockMsg.rate = 10;
      unlockMsg.lang = lang;
      window.speechSynthesis.speak(unlockMsg);
    }

    this.speechService.startQueue(items, config, {
      onEngineInit: () => { 
        this._lastRepeatStatus = i18n.t('initVoiceStatus');
        if (this.el.repeatStatus) this.el.repeatStatus.textContent = this._lastRepeatStatus;
        
        this.setNavButtonsDisabled(true);
      },
      onStepChange: (data) => {
        clearInterval(this.countdownInterval);
        this.el.countdownVisual?.classList.add('hidden');
        if (this.el.progressIndex) this.el.progressIndex.textContent = i18n.t('progressText', { current: data.index + 1, total: data.total });
        
        this._lastRepeatStatus = i18n.t('readingStatus', { current: 1, total: data.totalRepeats });
        if (this.el.repeatStatus) this.el.repeatStatus.textContent = this._lastRepeatStatus;
        
        this.currentWordText = data.text;
        this.renderWordDisplay();
        
        this.setNavButtonsDisabled(false);
      },
      onRepeat: (current, total) => { 
        this._lastRepeatStatus = i18n.t('readingStatus', { current, total });
        if (this.el.repeatStatus) this.el.repeatStatus.textContent = this._lastRepeatStatus;
      },
      onWritingPause: (seconds) => { this.startCountdown(seconds); },
      onComplete: () => {
        this.handleStop();
        this.showToast(i18n.t('finishedToast'), 'success');
        this.showAnswerSheet(items);
      },
      onError: (errMsg) => { 
        this.handleStop(); 
        this.showToast(errMsg, 'error'); 
      }
    }).catch(err => {
      this.handleStop();
      this.showToast(err || '啟動語音引擎失敗，請重試', 'error');
    });
  }

  handleStop() {
    this.speechService.stop();
    clearInterval(this.countdownInterval);
    this.el.countdownVisual?.classList.add('hidden');
    this.setPlaybackUI(false);
  }

  showAnswerSheet(items) {
    const list = this.el.answerList;
    if (!list) return;
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
    this.el.answerSheet?.classList.remove('hidden');
  }

  destroy() {
    if (this._unsubI18n) this._unsubI18n();
    this.handleStop(); 
    this.engine.destroy?.();
    this.testEngine.destroy?.();
  }
}
```[The file '' could not be opened]
