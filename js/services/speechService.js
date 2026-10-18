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
    this._resumeAfterPause = null; // 記錄 await 期間被暫停後，恢復時該執行的任務
  }

  schedule(fn, ms) {
    const start = performance.now(); // 使用不受系統時間調整影響的計時器
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
    this._resumeAfterPause = null; // 清理計時器時一併清理暫掛任務
  }

  // [P3-1 修正] 重新命名以精確反映職責：導航準備
  _prepareForNavigation() {
    // 跳過/重播/上一題在暫停狀態下會隱式恢復佇列，
    // UI 層的 resetPauseButtonUI() 會同步更新暫停按鈕文字。
    this.isQueuePaused = false;
    this.clearQueueTimers();
    
    // [P3-2 註釋] 此處 engine.stop() 與後續 speakCurrent() 的 engine.play() 內部的 stop() 冗餘，
    // 但保留以確保 _prepareForNavigation 獨立完整，不依賴調用方的後續行為。
    this.engine.stop();
    this.repeat = 0;
  }

  // 統一處理錯誤與中斷時的清理
  _abortQueue(token) {
    if (token !== this._queueToken) return false;
    this.isActive = false;
    this.isQueuePaused = false;
    this.clearQueueTimers();
    
    // [P3-3 註釋] 不調用 engine.stop()：
    // onError/onInterrupted 由 engine.play 的回調觸發，此時 SpeechEngine 內部已 cleanup()
    // （currentUtterance=null、stopHeartbeat 等），再調 stop() 只是多一次 _token 遞增，語義上不必。
    return true;
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
    this._resumeAfterPause = null;

    callbacks.onEngineInit?.();
    await this.engine.initVoices();
    if (token !== this._queueToken || !this.isActive) return;

    // 防禦 await 期間被使用者按下暫停：記下任務，而不是直接讓佇列永久卡死
    if (this.isQueuePaused) {
      this._resumeAfterPause = () => this.speakCurrent(token);
      return;
    }

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

    if (this.repeat === 0) {
      this.callbacks.onStepChange?.({
        index: this.idx,
        total: this.queue.length,
        text,
        totalRepeats: this.config.repeats
      });
    }

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
        if (!this._abortQueue(token)) return;
        this.callbacks.onError?.(msg);
      },
      onInterrupted: () => {
        if (!this._abortQueue(token)) return;
        // 傳遞 Error 物件，保留 code 供外層判斷
        this.callbacks.onError?.(Object.assign(new Error('語音被系統中斷'), { code: 'SYS_INTERRUPTED' }));
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
    this._prepareForNavigation();
    this.speakCurrent(newToken);
  }

  skipCurrent() {
    if (!this.isActive) return;
    const newToken = ++this._queueToken;
    this._prepareForNavigation();
    this.idx++;
    this.speakCurrent(newToken);
  }

  prevCurrent() {
    if (!this.isActive || this.idx === 0) return;
    const newToken = ++this._queueToken;
    this._prepareForNavigation();
    this.idx--;
    this.speakCurrent(newToken);
  }

  pause() {
    if (!this.isActive || this.isQueuePaused) return false;
    this.isQueuePaused = true;

    if (this._pausedTask) {
      clearTimeout(this._pausedTask.timerId);
      this.timers.delete(this._pausedTask.timerId);
      const elapsed = performance.now() - this._pausedTask.start;

      // Math.max(500, ...) 是刻意的防抖設計。
      // 避免剩餘時間極短 (如 5ms) 時按下暫停，恢復後瞬間觸發，讓使用者反應不及。
      // 代價是快速反覆暫停/恢復時，剩餘時間會逐漸減少並停留在 500ms 下限。
      this._pausedTask.remaining = Math.max(500, this._pausedTask.remaining - elapsed);
      // 注意：這裡不更新 _pausedTask.start，因為 resume 時 schedule() 會創建新物件並刷新 start。
    }

    // 引擎可能已經在播放中暫停，或者根本沒在播（計時器狀態），這不影響佇列的暫停
    this.engine.pause?.();
    return true;
  }

  resume() {
    if (!this.isActive || !this.isQueuePaused) return false;
    this.isQueuePaused = false;

    if (this._pausedTask) {
      // 邏輯上 _pausedTask 與 _resumeAfterPause 互斥（前者來自 schedule，
      // 後者來自 startQueue await 窗口），但顯式清理以防未來改動引入共存。
      this._resumeAfterPause = null;
      const { fn, remaining } = this._pausedTask;
      this.schedule(fn, remaining);
    } else if (this._resumeAfterPause) {
      // 如果是在 await initVoices 期間被暫停，恢復時執行之前掛起的任務
      const fn = this._resumeAfterPause;
      this._resumeAfterPause = null;
      fn();
    } else {
      // 計時器狀態下恢復：引擎本來就沒在播，resume 回傳 false 是正常的
      this.engine.resume?.();
    }
    return true;
  }

  isPaused() {
    return this.isQueuePaused;
  }
}
