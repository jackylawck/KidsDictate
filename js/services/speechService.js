export class SpeechEngine {
  constructor(synth = window.speechSynthesis, Utterance = window.SpeechSynthesisUtterance) {
    this.synth = synth;
    this.Utterance = Utterance;
    this.isSupported = !!(synth && Utterance);
    this.voices = [];
    this.isVoicesReady = false;
    this.currentUtterance = null;
    this.heartbeatTimer = null;
    this.watchdog = null;
    this._voicesPromise = null;
    this._token = 0; 
    this._pauseRequested = false;
    this._lateListener = null; 
    this._destroyed = false;   
  }

  initVoices() {
    if (!this.isSupported || this._destroyed) return Promise.resolve([]);
    if (this._voicesPromise) return this._voicesPromise;

    this._voicesPromise = new Promise((resolve) => {
      const tryResolve = () => {
        if (this._destroyed) return false; 
        
        const list = this.synth.getVoices();
        if (list.length === 0) return false; 
        
        this.voices = list;
        this.isVoicesReady = true;
        this.synth.removeEventListener('voiceschanged', tryResolve);
        resolve(this.voices);
        
        if (typeof this.onVoicesReady === 'function') {
          this.onVoicesReady();
        }
        return true;
      };

      if (tryResolve()) return;
      this.synth.addEventListener('voiceschanged', tryResolve);

      setTimeout(() => {
        if (this._destroyed) return; 
        if (this.isVoicesReady) return;
        
        this.synth.removeEventListener('voiceschanged', tryResolve);
        this.isVoicesReady = true; 
        this.voices = [];
        resolve([]);

        const late = () => {
          if (this._destroyed) return; 
          const list = this.synth.getVoices();
          if (list.length === 0) return;
          
          this.voices = list;
          this.isVoicesReady = true;
          this.synth.removeEventListener('voiceschanged', late);
          this._lateListener = null; 
          
          if (typeof this.onVoicesReady === 'function') {
            this.onVoicesReady();
          }
        };
        
        this._lateListener = late; 
        this.synth.addEventListener('voiceschanged', late);
      }, 3000);
    });
    return this._voicesPromise;
  }

  getVoiceListForLang(langCode) {
    const target = langCode.toLowerCase();
    const norm = v => (v.lang || '').toLowerCase().replace('_', '-');
    const base = target.split('-')[0];

    if ((base === 'zh' && target.includes('hk')) || target.includes('yue')) {
      return this.voices.filter(x => /yue|cantonese|hong kong|粵語|廣東話|香港/.test(((x.name || '') + ' ' + (x.lang || '')).toLowerCase()));
    }
    
    // [新增] 嚴格篩選普通話，排除粵語干擾
    if (base === 'zh' && (target.includes('cn') || target.includes('tw') || target.includes('cmn') || target.includes('mandarin'))) {
      return this.voices.filter(x => {
        const s = ((x.name || '') + ' ' + (x.lang || '')).toLowerCase();
        if (/yue|cantonese|hong kong|粵語|廣東話|香港/.test(s)) return false;
        return /zh-cn|zh-tw|cmn|mandarin|普通話|国语|國語|chinese/.test(s);
      });
    }

    if (base === 'en') {
      return this.voices.filter(x => norm(x).startsWith('en-'));
    }
    return this.voices.filter(x => norm(x) === target);
  }

  getVoiceForLang(langCode) {
    const target = langCode.toLowerCase();
    const norm = v => (v.lang || '').toLowerCase().replace('_', '-');
    let v = this.voices.find(x => norm(x) === target);
    if (v) return v;

    const base = target.split('-')[0];
    if ((base === 'zh' && target.includes('hk')) || target.includes('yue')) {
      return this.voices.find(x => /yue|cantonese|hong kong|粵語|廣東話|香港/.test(((x.name || '') + ' ' + (x.lang || '')).toLowerCase())) || null;
    }

    // [新增] 同步普通話的預設語音抓取邏輯
    if (base === 'zh' && (target.includes('cn') || target.includes('tw') || target.includes('cmn') || target.includes('mandarin'))) {
      return this.voices.find(x => {
        const s = ((x.name || '') + ' ' + (x.lang || '')).toLowerCase();
        if (/yue|cantonese|hong kong|粵語|廣東話|香港/.test(s)) return false;
        return /zh-cn|zh-tw|cmn|mandarin|普通話|国语|國語|chinese/.test(s);
      }) || null;
    }

    if (base === 'en') {
      return this.voices.find(x => norm(x).startsWith('en-')) || null;
    }
    return null;
  }

  async play(text, config, callbacks) {
    if (!this.isSupported || this._destroyed) { 
      callbacks.onError?.('此瀏覽器不支援語音合成，或引擎已卸載'); 
      return; 
    }

    this.stop(); 
    const currentToken = this._token;

    if (!this.isVoicesReady) {
      await this.initVoices();
      if (currentToken !== this._token) { callbacks.onInterrupted?.(); return; }
    }

    if (!this.isVoicesReady || this.voices.length === 0) {
      callbacks.onError?.('此裝置沒有任何語音包'); return;
    }

    let voice = null;
    if (config.voiceName) {
      const validVoices = this.getVoiceListForLang(config.lang);
      voice = validVoices.find(v => v.name === config.voiceName);
    }
    if (!voice) {
      voice = this.getVoiceForLang(config.lang);
    }

    if (!voice) { callbacks.onError?.(`找不到語言 ${config.lang} 的語音包`); return; }

    const utterance = new this.Utterance(text);
    this.currentUtterance = utterance;
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = config.rate || 0.85;

    this._pauseRequested = false;
    this.startHeartbeat();

    const cleanup = () => {
      this.currentUtterance = null;
      this._pauseRequested = false;
      this.stopHeartbeat();
      clearTimeout(this.watchdog);
    };

    utterance.onend = () => { if (this.currentUtterance === utterance) { cleanup(); callbacks.onEnd?.(); } };
    utterance.onerror = (e) => {
      if (this.currentUtterance !== utterance) return;
      cleanup();
      if (e.error === 'interrupted' || e.error === 'canceled') { callbacks.onInterrupted?.(); return; }
      callbacks.onError?.(`語音發生錯誤: ${e.error}`);
    };

    const timeoutMs = Math.max(15000, (text.length * 500) / utterance.rate);
    this.watchdog = setTimeout(() => {
      if (this.currentUtterance === utterance && !this.synth.speaking && !this.synth.paused && !this.synth.pending) {
        cleanup();
        this.synth.cancel();
        callbacks.onError?.('語音引擎超時無回應');
      }
    }, timeoutMs);

    setTimeout(() => {
      if (currentToken !== this._token) return;
      this.synth.speak(utterance);
      if (this._pauseRequested) {
        this.synth.pause();
        this._pauseRequested = false;
        this.stopHeartbeat();
      }
    }, 100);
  }

  stop() {
    this._token++; 
    this._pauseRequested = false;
    if (this.currentUtterance) {
      this.currentUtterance = null;
      this.synth.cancel();
    }
    this.stopHeartbeat();
    clearTimeout(this.watchdog);
  }

  pause() {
    if (!this.currentUtterance) return false;
    if (!this.synth.speaking) {
      this._pauseRequested = true;
      this.stopHeartbeat();
      return true;
    }
    this.synth.pause();
    this.stopHeartbeat();
    return true;
  }

  resume() {
    if (!this.currentUtterance) return false;
    if (!this.synth.speaking && !this._pauseRequested) return false; 
    
    this.synth.resume();
    this._pauseRequested = false;
    this.startHeartbeat();
    return true;
  }

  isPaused() {
    return this._pauseRequested === true || (this.synth?.paused === true && this.synth?.speaking === true);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.currentUtterance && this.synth.paused) this.synth.resume();
    }, 10000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  destroy() {
    this._destroyed = true;
    this.stop();
    if (this._lateListener) {
      this.synth.removeEventListener('voiceschanged', this._lateListener);
      this._lateListener = null;
    }
    this._voicesPromise = null;
    this.voices = [];
    this.onVoicesReady = null;
  }
}
