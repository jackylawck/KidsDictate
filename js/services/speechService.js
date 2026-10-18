export class SpeechService {
  constructor(engine) {
    this.engine = engine;
    this.queue = [];
    this.idx = 0;
    this.repeat = 0;
    this.isActive = false;
    this.timers = new Set();
    this._queueToken = 0; 
  }

  schedule(fn, ms) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      if (this.isActive) fn();
    }, ms);
    this.timers.add(t);
  }

  clearQueueTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }

  async startQueue(items, config, callbacks) {
    this.stop(); 
    const token = ++this._queueToken; 
    this.queue = items;
    this.config = config;
    this.callbacks = callbacks;
    this.idx = 0;
    this.repeat = 0;
    this.isActive = true;
    
    callbacks.onEngineInit?.(); 
    await this.engine.initVoices();
    if (token !== this._queueToken || !this.isActive) return;
    this.speakCurrent(token);
  }

  speakCurrent(token) {
    if (token !== this._queueToken || !this.isActive) return;

    const text = this.queue[this.idx];
    if (!text) {
      this.isActive = false;
      this.callbacks.onComplete?.();
      return;
    }

    this.callbacks.onStepChange?.({
      index: this.idx, total: this.queue.length, text,
      repeatRound: this.repeat + 1, totalRepeats: this.config.repeats
    });

    this.engine.play(text, this.config, {
      onEnd: () => {
        if (token !== this._queueToken || !this.isActive) return;
        this.repeat++;
        if (this.repeat < this.config.repeats) {
          this.callbacks.onRepeat?.(this.repeat + 1, this.config.repeats);
          this.schedule(() => this.speakCurrent(token), 2000);
        } else {
          this.callbacks.onWritingPause?.(this.config.pauseSec);
          this.schedule(() => {
            this.repeat = 0; this.idx++; this.speakCurrent(token);
          }, this.config.pauseSec * 1000);
        }
      },
      onError: (msg) => {
        if (token !== this._queueToken) return;
        this.isActive = false;
        this.callbacks.onError?.(msg);
      },
      onInterrupted: () => {
        if (token !== this._queueToken) return;
        this.isActive = false;
        this.callbacks.onError?.('語音被系統中斷');
      }
    });
  }

  stop() {
    this._queueToken++; 
    this.isActive = false;
    this.clearQueueTimers();
    this.queue = [];
    this.engine.stop();
  }

  replayCurrent() {
    if (!this.isActive) return;
    const newToken = ++this._queueToken;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.speakCurrent(newToken);
  }

  skipCurrent() {
    if (!this.isActive) return;
    const newToken = ++this._queueToken;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.idx++;
    this.speakCurrent(newToken);
  }

  prevCurrent() {
    if (!this.isActive || this.idx === 0) return;
    const newToken = ++this._queueToken;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.idx--;
    this.speakCurrent(newToken);
  }

  pause() { return (!this.isActive || !this.engine.pause) ? false : this.engine.pause(); }
  resume() { return (!this.isActive || !this.engine.resume) ? false : this.engine.resume(); }
  isPaused() { return this.engine.isPaused?.() ?? false; }
}
