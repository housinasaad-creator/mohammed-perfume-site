/*
  مؤثرات صوتية مولّدة بالكود (WebAudio): رذاذ، زجاج، وشوشة بين الوقفات، إضافة للحقيبة، ختم الطلب.
  افتراضياً مطفأة؛ زر الصوت في الأعلى يشغّلها.
*/
export class Sfx {
  constructor() { this.on = false; this.ctx = null; this.master = null; this.noise = null; this.crackle = null; }
  _init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.7; this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }
  toggle() {
    this.on = !this.on;
    if (this.on) { this._init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); this.startAmbient(); this.add(); } else this.stopAmbient();
    return this.on;
  }
  _src(t0, dur, fType, f0, f1, q, gain, atk = 0.01) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = fType; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + atk); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  }
  _tone(t0, freq, dur, gain, type = 'sine', slide = 1) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0); o.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  spray() { if (!this.on) return; const t = this.ctx.currentTime; this._src(t, 0.55, 'bandpass', 5200, 2400, 0.9, 0.5, 0.02); this._src(t, 0.35, 'highpass', 6500, 7000, 0.5, 0.18, 0.01); this._tone(t, 1900, 0.06, 0.05, 'square', 0.6); }
  whoosh() { if (!this.on) return; const t = this.ctx.currentTime; this._src(t, 1.9, 'bandpass', 220, 1800, 0.6, 0.22, 0.7); this._src(t + 0.9, 1.2, 'bandpass', 1800, 300, 0.7, 0.12, 0.3); }
  clink(k = 1) { if (!this.on) return; const t = this.ctx.currentTime, f = 1900 * k; this._tone(t, f, 0.9, 0.12); this._tone(t, f * 2.76, 0.5, 0.05); this._tone(t, f * 5.4, 0.25, 0.025); }
  tick() { if (!this.on) return; const t = this.ctx.currentTime; this._tone(t, 3200, 0.05, 0.03, 'triangle', 0.7); }
  add() { if (!this.on) return; const t = this.ctx.currentTime; this._tone(t, 880, 0.35, 0.09, 'triangle'); this._tone(t + 0.09, 1318, 0.5, 0.09, 'triangle'); this._tone(t + 0.19, 1760, 0.7, 0.07, 'sine'); }
  seal() { if (!this.on) return; const t = this.ctx.currentTime; this._tone(t, 120, 0.4, 0.4, 'sine', 0.5); this._src(t, 0.25, 'lowpass', 900, 200, 0.7, 0.35, 0.005); this._tone(t + 0.35, 1046, 1.4, 0.07); this._tone(t + 0.5, 1568, 1.6, 0.06); this._tone(t + 0.7, 2093, 1.8, 0.05); }
  error() { if (!this.on) return; const t = this.ctx.currentTime; this._tone(t, 220, 0.25, 0.1, 'sawtooth', 0.8); }
  startAmbient() {
    if (!this.on || !this.ctx || this.crackle) return;
    const c = this.ctx;
    const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 0.4;
    const g = c.createGain(); g.gain.value = 0.05;
    s.connect(f); f.connect(g); g.connect(this.master); s.start();
    this.crackle = { s, g };
    this._crackleTimer = setInterval(() => {
      if (!this.on) return;
      const t = c.currentTime;
      this._src(t, 0.04 + Math.random() * 0.05, 'highpass', 2500 + Math.random() * 3000, 3000, 0.7, 0.05 + Math.random() * 0.06, 0.002);
    }, 260);
  }
  stopAmbient() { if (this.crackle) { try { this.crackle.s.stop(); } catch (e) {} this.crackle = null; } clearInterval(this._crackleTimer); }
}
