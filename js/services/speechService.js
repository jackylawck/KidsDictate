export class SpeechService {
  constructor(engine) {
    this.engine = engine;
    this.queue = [];
    this.idx = 0;
    this.repeat = 0;
    this.isActive = false;
    this.isQueuePaused = false;
    this.timers = new Set();
    this._queueToken = 0;
    this._pausedTask = null; // 記錄暫停時未完成的計時任務
  }

  schedule(fn, ms) {
    const start = Date.now();
    const t = setTimeout(() => {
      this.timers.delete(t);
      this._pausedTask = null;
      if (this.isActive && !this.isQueuePaused) fn();
    }, ms);
    this.timers.add(t);
    this._pausedTask = { fn, remaining: ms, start, timerId: t };
  }

  clearQueueTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this._pausedTask = null;
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
    this.isQueuePaused = false;

    callbacks.onEngineInit?.();
    await this.engine.initVoices();
    if (token !== this._queueToken || !this.isActive) return;
    this.speakCurrent(token);
  }

  speakCurrent(token) {
    if (token !== this._queueToken || !this.isActive || this.isQueuePaused) return;

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
            this.repeat = 0;
            this.idx++;
            this.speakCurrent(token);
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
    this.isQueuePaused = false;
    this.clearQueueTimers();
    this.queue = [];
    this.engine.stop();
  }

  replayCurrent() {
    if (!this.isActive) return;
    const newToken = ++this._queueToken;
    this.isQueuePaused = false;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.speakCurrent(newToken);
  }

  skipCurrent() {
    if (!this.isActive) return;
    const newToken = ++this._queueToken;
    this.isQueuePaused = false;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.idx++;
    this.speakCurrent(newToken);
  }

  prevCurrent() {
    if (!this.isActive || this.idx === 0) return;
    const newToken = ++this._queueToken;
    this.isQueuePaused = false;
    this.clearQueueTimers();
    this.engine.stop();
    this.repeat = 0;
    this.idx--;
    this.speakCurrent(newToken);
  }

  // 全域暫停：無論在發聲中還是倒數計時中皆可暫停
  pause() {
    if (!this.isActive || this.isQueuePaused) return false;
    this.isQueuePaused = true;

    if (this._pausedTask) {
      clearTimeout(this._pausedTask.timerId);
      this.timers.delete(this._pausedTask.timerId);
      const elapsed = Date.now() - this._pausedTask.start;
      this._pausedTask.remaining = Math.max(500, this._pausedTask.remaining - elapsed);
    }
    this.engine.pause?.();
    return true;
  }

  resume() {
    if (!this.isActive || !this.isQueuePaused) return false;
    this.isQueuePaused = false;

    if (this._pausedTask) {
      const { fn, remaining } = this._pausedTask;
      this.schedule(fn, remaining);
    } else {
      this.engine.resume?.();
    }
    return true;
  }

  isPaused() {
    return this.isQueuePaused;
  }
}
