/* ===================================================
   Colton's Reading App — Programmatic Sound Effects (Web Audio API)
   No external audio files required.
   =================================================== */

const Sound = {

  _ctx: null,

  /**
   * Lazy-initialize and resume the AudioContext.
   * Handles browser autoplay-policy by calling resume().
   */
  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  /* ---- internal helpers ---- */

  /**
   * Play a single sine-wave tone.
   * @param {number} freq      - Frequency in Hz
   * @param {number} startTime - AudioContext time to begin
   * @param {number} duration  - Length in seconds
   * @param {number} gain      - Peak gain (0-1)
   */
  _tone(freq, startTime, duration, gain) {
    const ctx = this._getCtx();

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, startTime);
    env.gain.linearRampToValueAtTime(gain, startTime + 0.01);          // quick attack
    env.gain.setValueAtTime(gain, startTime + duration * 0.6);         // sustain
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // release

    osc.connect(env).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  },

  /**
   * Generate a very short burst of white noise (for click sounds).
   * @param {number} startTime - AudioContext time to begin
   * @param {number} duration  - Length in seconds
   * @param {number} gain      - Peak gain (0-1)
   */
  _noiseBurst(startTime, duration, gain) {
    const ctx = this._getCtx();

    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    src.connect(env).connect(ctx.destination);
    src.start(startTime);
    src.stop(startTime + duration);
  },

  /* ---- Note frequencies (Hz) ---- */
  _notes: {
    C4: 261.63,
    C5: 523.25,
    E5: 659.25,
    G5: 783.99,
    C6: 1046.50
  },

  /* ============================================================
     Public API
     ============================================================ */

  /**
   * Pleasant ascending two-note chime (C5 -> E5).
   * Bright and satisfying — used on correct answer.
   */
  correct() {
    const ctx = this._getCtx();
    const t = ctx.currentTime;
    this._tone(this._notes.C5, t, 0.15, 0.2);
    this._tone(this._notes.E5, t + 0.15, 0.15, 0.2);
  },

  /**
   * Gentle single low tone (C4).
   * Soft, not harsh or punishing — used on incorrect answer.
   */
  incorrect() {
    const ctx = this._getCtx();
    const t = ctx.currentTime;
    this._tone(this._notes.C4, t, 0.2, 0.15);
  },

  /**
   * Quick ascending three-note arpeggio (C5 -> E5 -> G5).
   * Celebratory — used when levelling up.
   */
  levelUp() {
    const ctx = this._getCtx();
    const t = ctx.currentTime;
    this._tone(this._notes.C5, t, 0.1, 0.2);
    this._tone(this._notes.E5, t + 0.1, 0.1, 0.2);
    this._tone(this._notes.G5, t + 0.2, 0.1, 0.2);
  },

  /**
   * Special sparkle — quick ascending notes with slight overlap
   * (C5 -> E5 -> G5 -> C6). Used on badge unlock.
   */
  badgeUnlock() {
    const ctx = this._getCtx();
    const t = ctx.currentTime;
    const step = 0.08;
    const dur = 0.14;   // longer than step -> notes overlap for shimmer
    const gain = 0.22;

    this._tone(this._notes.C5, t, dur, gain);
    this._tone(this._notes.E5, t + step, dur, gain);
    this._tone(this._notes.G5, t + step * 2, dur, gain);
    this._tone(this._notes.C6, t + step * 3, dur, gain);
  },

  /**
   * Very short subtle click (noise burst).
   * Used for general UI interactions.
   */
  click() {
    const ctx = this._getCtx();
    this._noiseBurst(ctx.currentTime, 0.05, 0.15);
  }
};
