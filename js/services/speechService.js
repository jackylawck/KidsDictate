export class SpeechService {
  constructor(engine) {
    this.engine = engine;
    this.isActive = false;
    this._token = 0;
    this.items = [];
    this.config = {};
    this.callbacks = {};
    this.currentIndex = 0;
    this.currentRepeat = 0;
    this.isWaitingForPause = false;
    this.pauseTimer = null;
  }

  async startQueue(items, config, callbacks) {
    this.stop(); 
    const token = ++this._token;
    this.isActive = true;
    this.items = items;
    this.config = config;
    this.callbacks = callbacks;
    this.currentIndex = 0;

    try {
      if (this.callbacks.onEngineInit) this.callbacks.onEngineInit();
      await this.engine.initVoices();
      if (token !== this._token) return;
      
      this._playCurrentStep();
    } catch (err) {
      if (token !== this._token) return;
      this.isActive = false;
      if (this.callbacks.onError) this.callbacks.onError(err.message || '語音引擎初始化失敗');
    }
  }

  stop() {
    this._token++;
    this.isActive = false;
    this.isWaitingForPause = false;
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    this.engine.stop();
  }

  pause() {
    if (!this.isActive) return false;
    return this.engine.pause();
  }

  resume() {
    if (!this.isActive) return false;
    return this.engine.resume();
  }

  isPaused() {
    return this.engine.isPaused();
  }

  replayCurrent() {
    if (!this.isActive) return;
    this._token++; 
    this._playCurrentStep();
  }

  skipCurrent() {
    if (!this.isActive) return;
    this._token++;
    this.currentIndex++;
    this._playCurrentStep();
  }

  prevCurrent() {
    if (!this.isActive) return;
    this._token++;
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this._playCurrentStep();
  }

  _playCurrentStep() {
    if (this.currentIndex >= this.items.length) {
      this.isActive = false;
      if (this.callbacks.onComplete) this.callbacks.onComplete();
      return;
    }

    const token = this._token;
    this.currentRepeat = 1;
    this.isWaitingForPause = false;

    const text = this.items[this.currentIndex];
    
    if (this.callbacks.onStepChange) {
      this.callbacks.onStepChange({
        index: this.currentIndex,
        total: this.items.length,
        text: text,
        totalRepeats: this.config.repeats
      });
    }

    this._playRepeat(token, text);
  }

  _playRepeat(token, text) {
    if (token !== this._token) return;

    if (this.callbacks.onRepeat) {
      this.callbacks.onRepeat(this.currentRepeat, this.config.repeats);
    }

    this.engine.play(text, this.config, {
      onEnd: () => {
        if (token !== this._token) return;

        if (this.currentRepeat < this.config.repeats) {
          this.currentRepeat++;
          this.isWaitingForPause = true;
          this.pauseTimer = setTimeout(() => {
            this.isWaitingForPause = false;
            this._playRepeat(token, text);
          }, 1500); // 每次重複朗讀之間停頓 1.5 秒
        } else {
          this.isWaitingForPause = true;
          if (this.callbacks.onWritingPause) {
            this.callbacks.onWritingPause(this.config.pauseSec);
          }
          
          let remainingGap = this.config.pauseSec * 10; 
          
          const tick = () => {
            if (token !== this._token) return;
            if (!this.isPaused()) {
               remainingGap--;
            }
            if (remainingGap <= 0) {
               this.isWaitingForPause = false;
               this.currentIndex++;
               this._playCurrentStep();
            } else {
               this.pauseTimer = setTimeout(tick, 100);
            }
          };
          tick();
        }
      },
      onInterrupted: () => {},
      onError: (err) => {
        if (token !== this._token) return;
        this.isActive = false;
        if (this.callbacks.onError) this.callbacks.onError(err);
      }
    });
  }
}
