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
    this.speechService = new SpeechService(this.engine);
    this.countdownInterval = null;
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
      if (key) {
        if (el.tagName === 'INPUT' && el.type === 'button') (el as HTMLInputElement).value = i18n.t(key);
        else if (el.tagName === 'TEXTAREA' && key === 'dictationPlaceholder') (el as HTMLTextAreaElement).placeholder = i18n.t(key);
        else el.textContent = i18n.t(key);
      }
    });
  }

  bindEvents() {
    this.el.langZhBtn?.addEventListener('click', () => i18n.setLocale('zh-HK'));
    this.el.langEnBtn?.addEventListener('click', () => i18n.setLocale('en'));
    i18n.onChange(() => this.updateDomTranslations());

    this.el.rateRange.addEventListener('input', () => this.el.rateLabel.textContent = `${this.el.rateRange.value}x`);

    this.el.imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.el.ocrProgressBox.classList.remove('hidden');
      this.el.ocrProgressBar.style.width = '10%';
      this.el.ocrStatusText.textContent = i18n.t('initVoiceStatus');
      try {
        const words = await OcrService.recognizeText(file, (p) => {
          this.el.ocrProgressBar.style.width = `${p}%`;
          this.el.ocrStatusText.textContent = `OCR ${p}%`;
        });
        this.el.dictationText.value = words.join('\n');
        this.el.ocrStatusText.textContent = 'OK';
      } catch (err) {
        this.showToast(err.message, 'error');
        this.el.ocrStatusText.textContent = 'Error';
      } finally {
        setTimeout(() => this.el.ocrProgressBox.classList.add('hidden'), 2000);
        this.el.imageInput.value = '';
      }
    });

    this.el.testVoiceBtn.addEventListener('click', async () => {
      if (this.speechService.isActive) return;
      const lang = this.el.langSelect.value;
      const rate = parseFloat(this.el.rateRange.value);
      const text = lang.startsWith('en') ? 'Testing voice.' : '測試語音發音';
      this.el.testVoiceBtn.disabled = true;
      const unlockBtn = () => { this.el.testVoiceBtn.disabled = false; };
      try {
        await this.testEngine.play(text, { lang, rate }, {
          onEnd: unlockBtn, onInterrupted: unlockBtn, onError: (err) => { this.showToast(err, 'error'); unlockBtn(); }
        });
      } catch (e) { this.showToast(e.message, 'error'); unlockBtn(); }
    });

    this.el.startBtn.addEventListener('click', () => this.handleStart());
    this.el.stopBtn.addEventListener('click', () => this.handleStop());
    this.el.replayBtn.addEventListener('click', () => this.speechService.replayCurrent());
    this.el.skipBtn.addEventListener('click', () => this.speechService.skipCurrent());
    this.el.prevBtn.addEventListener('click', () => this.speechService.prevCurrent());
    
    this.el.pauseBtn.addEventListener('click', () => {
      if (!this.speechService.isActive) return;
      if (this.speechService.isPaused()) {
        if (this.speechService.resume()) {
          this.el.pauseBtn.textContent = i18n.t('pauseBtn');
          this.el.pauseBtn.className = 'px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm';
        }
      } else {
        if (this.speechService.pause()) {
          this.el.pauseBtn.textContent = i18n.t('resumeBtn');
          this.el.pauseBtn.className = 'px-4 py-2 bg-amber-50 text-amber-600 border border-amber-300 rounded-lg text-sm font-bold shadow-sm';
        }
      }
    });

    this.el.closeAnswerBtn.addEventListener('click', () => this.el.answerSheet.classList.add('hidden'));
    this.el.printAnswerBtn.addEventListener('click', () => window.print());
  }

  showToast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `px-4 py-3 rounded-xl shadow-lg text-sm font-bold opacity-0 transition-opacity duration-300 ${type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} text-white`;
    el.textContent = message;
    this.el.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.remove('opacity-0'));
    setTimeout(() => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 300); }, 4000);
  }

  startCountdown(totalSeconds) {
    let remain = totalSeconds;
    this.el.countdownVisual.classList.remove('hidden');
    this.el.countdownText.textContent = i18n.t('writingStatus', { sec: remain });
    this.el.countdownBar.style.width = '100%';
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      remain--;
      if (remain < 0) { clearInterval(this.countdownInterval); this.el.countdownVisual.classList.add('hidden'); return; }
      this.el.countdownText.textContent = i18n.t('writingStatus', { sec: remain });
      this.el.countdownBar.style.width = `${(remain / totalSeconds) * 100}%`;
    }, 1000);
  }

  async handleStart() {
    const items = this.el.dictationText.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return this.showToast('請先輸入默書內容', 'error');

    const config = { lang: this.el.langSelect.value, rate: parseFloat(this.el.rateRange.value), repeats: parseInt(this.el.repeatSelect.value, 10), pauseSec: parseInt(this.el.pauseInput.value, 10) || 8 };
    this.el.answerSheet.classList.add('hidden');
    this.el.answerList.replaceChildren();
    
    this.el.pauseBtn.textContent = i18n.t('pauseBtn');
    this.el.pauseBtn.className = 'px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm';
    this.el.testVoiceBtn.disabled = true;
    
    this.el.startBtn.classList.add('hidden');
    this.el.stopBtn.classList.remove('hidden');
    this.el.playingCard.classList.remove('hidden');

    this.speechService.startQueue(items, config, {
      onEngineInit: () => { this.el.repeatStatus.textContent = i18n.t('initVoiceStatus'); },
      onStepChange: (data) => {
        clearInterval(this.countdownInterval);
        this.el.countdownVisual.classList.add('hidden');
        this.el.progressIndex.textContent = i18n.t('progressText', { current: data.index + 1, total: data.total });
        this.el.repeatStatus.textContent = i18n.t('readingStatus', { current: 1, total: data.totalRepeats });
        this.el.wordDisplay.textContent = data.text;
      },
      onRepeat: (current, total) => { this.el.repeatStatus.textContent = i18n.t('readingStatus', { current, total }); },
      onWritingPause: (seconds) => { this.startCountdown(seconds); },
      onComplete: () => {
        this.handleStop();
        this.showToast(i18n.t('finishedToast'), 'success');
        this.showAnswerSheet(items);
      },
      onError: (errMsg) => { this.handleStop(); this.showToast(errMsg, 'error'); }
    });
  }

  handleStop() {
    this.speechService.stop();
    clearInterval(this.countdownInterval);
    this.el.countdownVisual.classList.add('hidden');
    this.el.startBtn.classList.remove('hidden');
    this.el.stopBtn.classList.add('hidden');
    this.el.playingCard.classList.add('hidden');
    this.el.testVoiceBtn.disabled = false;
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
}
