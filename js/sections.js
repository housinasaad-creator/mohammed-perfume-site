/*
  الأقسام السفلية: ساعة العطر (12 ساعة على البشرة)، الدورق الذي يمتلئ مع الصنعة، والبطاقات المعلّقة المتأرجحة.
*/
import { MOODS, SCENTS } from './gl/core.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const $ = (s, r) => (r || document).querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const rgbOf = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];

export function initSections(ctx) {
  const T = () => ctx.T();
  const dir = () => (ctx.lang() === 'ar' ? 'rtl' : 'ltr');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================ جرّبه: ساعة العطر */
  const W = { i: 0, t: 0.2, playing: false, last: 0, vis: false, raf: 0 };
  const aura = $('#aura'), curve = $('#curve'), slider = $('#wearT');
  const ag = aura.getContext('2d'), cg = curve.getContext('2d');
  const layers = { top: [], heart: [], base: [] };
  const N = { top: 150, heart: 80, base: 46 };
  for (const k of Object.keys(N)) for (let i = 0; i < N[k]; i++) layers[k].push({ a: Math.random() * 6.283, r: Math.random(), s: (Math.random() * .6 + .4) * (Math.random() < .5 ? -1 : 1), z: Math.random(), ph: Math.random() * 6.283, th: (i + .5) / N[k] });
  const curveVals = (t) => ({
    top: Math.exp(-t / 0.62),
    heart: Math.exp(-Math.pow((t - 2.3) / 1.7, 2)) * .96 + .05 * smooth(3, 8, t) * (1 - smooth(8, 12, t)),
    base: smooth(0.7, 5, t) * (1 - .38 * smooth(7, 12, t)) * .98
  });
  function sizeCanvas(cv, hpx) { const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth || 600, h = hpx || cv.clientHeight || 300; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } return { w: cv.width, h: cv.height, dpr }; }
  function drawAura(time) {
    const { w, h, dpr } = sizeCanvas(aura), g = ag;
    const id = SCENTS[W.i], col = rgbOf(MOODS[id].glow), mist = rgbOf(MOODS[id].mist);
    const v = curveVals(W.t), tot = clamp(Math.max(v.top * .9, v.heart, v.base * .8) + .08, 0, 1.1);
    g.clearRect(0, 0, w, h);
    const bg = g.createRadialGradient(w * .5, h * .62, 0, w * .5, h * .62, w * .7);
    bg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${.2 + tot * .26})`); bg.addColorStop(1, 'rgba(5,3,2,1)');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // معصم مجرّد
    const cx = w * .5, cy = h * .76;
    const sk = g.createLinearGradient(0, cy - h * .12, 0, h);
    sk.addColorStop(0, '#6d4630'); sk.addColorStop(1, '#2a1710');
    g.fillStyle = sk; g.beginPath(); g.ellipse(cx, h * 1.02, w * .58, h * .3, 0, Math.PI, 2 * Math.PI); g.fill();
    const rim = g.createLinearGradient(0, cy - h * .1, 0, cy + h * .05);
    rim.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${.2 + tot * .5})`); rim.addColorStop(1, 'rgba(0,0,0,0)');
    g.strokeStyle = rim; g.lineWidth = 3 * dpr; g.beginPath(); g.ellipse(cx, h * 1.02, w * .58, h * .3, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
    g.globalCompositeOperation = 'lighter';
    // نبضات الانتشار (sillage)
    for (let k = 0; k < 3; k++) {
      const ph = ((time * .00022 * (0.5 + tot) + k / 3) % 1), rr = (.12 + ph * (.28 + tot * .42)) * w;
      g.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${(1 - ph) * (.1 + tot * .2)})`; g.lineWidth = 2 * dpr;
      g.beginPath(); g.ellipse(cx, cy - h * .06, rr, rr * .62, 0, 0, 6.283); g.stroke();
    }
    const spot = (x, y, r, c, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`); gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); };
    // قاعدة: سحب داكنة دافئة منخفضة وبطيئة
    layers.base.forEach((p) => {
      if (p.th > v.base) return; const a = p.a + time * .00005 * p.s; const rad = (.1 + p.r * (.2 + v.base * .26)) * w;
      spot(cx + Math.cos(a) * rad * 1.15, cy - h * .05 - Math.abs(Math.sin(a)) * rad * .5 - p.z * h * .05, (.05 + p.z * .07) * w, [Math.round(col[0] * .62), Math.round(col[1] * .48), Math.round(col[2] * .4)], .09 + v.base * .08);
    });
    // قلب: كتل ناعمة تدور
    layers.heart.forEach((p) => {
      if (p.th > v.heart) return; const a = p.a + time * .00011 * p.s; const rad = (.07 + p.r * (.16 + v.heart * .22)) * w;
      spot(cx + Math.cos(a) * rad, cy - h * .18 + Math.sin(a) * rad * .62, (.026 + p.z * .036) * w, col, .12 + v.heart * .13);
    });
    // افتتاحية: شرارات لامعة سريعة
    layers.top.forEach((p) => {
      if (p.th > v.top) return; const a = p.a + time * .0004 * p.s; const rad = (.04 + p.r * (.12 + v.top * .32)) * w;
      const tw = .5 + .5 * Math.sin(time * .004 * (0.4 + p.z) + p.ph);
      const x = cx + Math.cos(a) * rad, y = cy - h * .16 - Math.abs(Math.sin(a)) * rad * .9 - ((time * .00005 * (1 + p.z)) % 1) * h * .12;
      spot(x, y, (.006 + p.z * .014) * w, [255, 244, 220], .35 + tw * .55);
    });
    g.globalCompositeOperation = 'source-over';
    // بخار القلب
    void mist;
  }
  function drawCurve() {
    const { w, h, dpr } = sizeCanvas(curve, 74), g = cg;
    g.clearRect(0, 0, w, h);
    const id = SCENTS[W.i], col = rgbOf(MOODS[id].glow);
    const defs = [['top', [255, 236, 190]], ['heart', col], ['base', [Math.round(col[0] * .7), Math.round(col[1] * .55), Math.round(col[2] * .45)]]];
    defs.forEach(([k, c]) => {
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) { const t = x / w * 12, y = h - 6 * dpr - curveVals(t)[k] * (h - 14 * dpr); g.lineTo(x, y); }
      g.lineTo(w, h); g.closePath();
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},.42)`); gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      g.fillStyle = gr; g.fill();
      g.beginPath(); for (let x = 0; x <= w; x += 3) { const t = x / w * 12, y = h - 6 * dpr - curveVals(t)[k] * (h - 14 * dpr); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},.9)`; g.lineWidth = 1.6 * dpr; g.stroke();
    });
    const mx = W.t / 12 * w; g.strokeStyle = 'rgba(255,243,214,.55)'; g.lineWidth = 1 * dpr; g.beginPath(); g.moveTo(mx, 0); g.lineTo(mx, h); g.stroke();
  }
  function wearUI() {
    const t = T().wear, d = dir(), v = curveVals(W.t), id = SCENTS[W.i], p = T().products[W.i];
    $('#wearH').textContent = ctx.lang() === 'ar' ? Number(W.t.toFixed(1)).toLocaleString('ar-EG', { minimumFractionDigits: 1 }) : W.t.toFixed(1);
    $('#wearHL').textContent = t.h; $('#wearHL').setAttribute('dir', d);
    const ph = W.t < .4 ? 0 : W.t < 1.5 ? 1 : W.t < 3.8 ? 2 : W.t < 7 ? 3 : 4;
    const pe = $('#wearPhase'); if (pe.dataset.p !== String(ph) + id + ctx.lang()) { pe.dataset.p = String(ph) + id + ctx.lang(); pe.textContent = t.phases[ph]; pe.setAttribute('dir', d); }
    const lg = $('#wearLegend').children;
    [['top', v.top], ['heart', v.heart], ['base', v.base]].forEach(([k, val], i) => { if (lg[i]) lg[i].classList.toggle('on', val > .22); });
    void id; void p;
  }
  function wearLoop(now) {
    W.raf = 0; if (!W.vis) return;
    if (W.playing) {
      const dt = Math.min(.05, (now - W.last) / 1000); W.t += dt * (12 / 16);
      if (W.t >= 12) { W.t = 12; setPlaying(false); }
      slider.value = W.t;
    }
    W.last = now; drawAura(now); drawCurve(); wearUI();
    W.raf = requestAnimationFrame(wearLoop);
  }
  function kickWear() { if (!W.raf && W.vis) { W.last = performance.now(); W.raf = requestAnimationFrame(wearLoop); } }
  function setPlaying(on) { W.playing = on; $('#wearPlay').classList.toggle('on', on); $('#wearPlayTxt').textContent = on ? T().wear.pause : T().wear.play; if (on && W.t >= 12) { W.t = 0; slider.value = 0; } kickWear(); }
  $('#wearPlay').addEventListener('click', () => setPlaying(!W.playing));
  slider.addEventListener('input', () => { W.t = parseFloat(slider.value); if (W.playing) setPlaying(false); kickWear(); });
  new IntersectionObserver((es) => { W.vis = es[0].isIntersecting; if (W.vis) { if (!W.started) { W.started = true; setPlaying(true); } kickWear(); } }, { threshold: .25 }).observe($('#wear'));
  function renderWear() {
    const t = T().wear, d = dir(), P = T().products;
    $('#wearChips').innerHTML = P.map((p, i) => `<button type="button" class="chip ${i === W.i ? 'on' : ''}" data-i="${i}" style="--c:${MOODS[SCENTS[i]].accent}" role="tab"><i></i><span dir="${d}">${esc(p.name)}</span></button>`).join('');
    $('#wearChips').querySelectorAll('.chip').forEach((b) => b.onclick = () => { W.i = +b.dataset.i; ctx.accentTo && ctx.accentTo(W.i); renderWear(); kickWear(); });
    const p = P[W.i], c = MOODS[SCENTS[W.i]], col = rgbOf(c.glow);
    const cols = ['#ffeebe', hex(c.glow), `rgb(${Math.round(col[0] * .7)},${Math.round(col[1] * .55)},${Math.round(col[2] * .45)})`];
    $('#wearLegend').innerHTML = [[p.top, t.top], [p.heart, t.heart], [p.base, t.base]].map(([n, l], i) => `<div class="lg" style="--lc:${cols[i]}"><i></i><b dir="${d}">${esc(n)}</b><span dir="${d}">${esc(l)}</span></div>`).join('');
    $('#wearPlayTxt').textContent = W.playing ? t.pause : t.play;
    wearUI();
  }

  /* ================================================================ الصنعة: دورق */
  const FL = [
    { fill: .16, a: '#fff4c4', b: '#e8c46a' },
    { fill: .42, a: '#ffe08a', b: '#ee9f3a' },
    { fill: .72, a: '#f2a02c', b: '#8d3a0b' },
    { fill: .96, a: '#e0780f', b: '#4e1503' }
  ];
  const liq = $('#flLiq');
  liq.style.transition = 'transform 1.6s cubic-bezier(.2,.7,.15,1)'; liq.setAttribute('y', '20'); liq.setAttribute('height', '340');
  const f1 = $('#fl1'), f2 = $('#fl2');
  [f1, f2].forEach((s) => (s.style.transition = 'stop-color 1.6s ease'));
  function setFlask(i) {
    const f = FL[i]; liq.style.transform = `translateY(${(1 - f.fill) * 262 + 8}px)`; f1.style.stopColor = f.a; f2.style.stopColor = f.b;
    $('#flaskN').textContent = T().craft.steps[i].n;
  }
  liq.style.transform = 'translateY(280px)';
  const bub = $('#flBub');
  bub.innerHTML = Array.from({ length: 12 }, (_, i) => `<circle cx="${70 + (i * 37) % 100}" cy="260" r="${2 + (i % 4)}" fill="rgba(255,255,255,.4)"><animate attributeName="cy" from="262" to="30" dur="${3 + (i % 5) * .8}s" begin="${(i * .4).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="${3 + (i % 5) * .8}s" begin="${(i * .4).toFixed(1)}s" repeatCount="indefinite"/></circle>`).join('');
  function renderCraft() {
    const c = T().craft, d = dir();
    $('#steps').innerHTML = c.steps.map((s, i) => `<li class="step ${i === (S_craft.i) ? 'on' : ''}" data-i="${i}"><small dir="${d}">${esc(s.n)}</small><h3 dir="${d}">${esc(s.t)}</h3><p dir="${d}">${esc(s.d)}</p></li>`).join('');
    watchSteps();
    setFlask(S_craft.i);
  }
  const S_craft = { i: 0, io: null };
  function watchSteps() {
    if (S_craft.io) S_craft.io.disconnect();
    S_craft.io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { S_craft.i = +e.target.dataset.i; document.querySelectorAll('.step').forEach((s) => s.classList.toggle('on', +s.dataset.i === S_craft.i)); setFlask(S_craft.i); } }), { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.step').forEach((s) => S_craft.io.observe(s));
  }

  /* ================================================================ آراء: بطاقات معلّقة */
  const tags = [];
  let tagRaf = 0, tagVis = false;
  function renderVoices() {
    const v = T().voices, d = dir();
    const host = $('#tags'); host.innerHTML = '';
    tags.length = 0;
    v.items.forEach((it, i) => {
      const el = document.createElement('div'); el.className = 'tg';
      el.innerHTML = `<div class="tg-in"><div class="tg-str"></div><div class="tg-card"><p dir="${d}">${esc(it.q)}</p><cite dir="${d}">${esc(it.a)}</cite></div></div>`;
      host.appendChild(el);
      const inner = el.firstElementChild;
      const tg = { el, inner, a: 0, v: (Math.random() - .5) * 1.4, k: 22 + i * 3, c: 1.7 + i * .12, lastX: null };
      el.addEventListener('pointermove', (e) => { if (tg.lastX !== null) { tg.v += clamp((e.clientX - tg.lastX) * 0.018, -1.2, 1.2); } tg.lastX = e.clientX; kickTags(); });
      el.addEventListener('pointerleave', () => { tg.lastX = null; });
      el.addEventListener('click', () => { tg.v += (Math.random() < .5 ? -1 : 1) * 2.4; kickTags(); ctx.sfx && ctx.sfx.tick(); });
      tags.push(tg);
    });
    kickTags();
  }
  function tagLoop(now) {
    tagRaf = 0; if (!tagVis) return;
    const dt = Math.min(.04, (now - (tagLoop.last || now)) / 1000); tagLoop.last = now;
    let moving = false;
    tags.forEach((t, i) => {
      t.v += (-t.a * t.k - t.v * t.c) * dt; t.a += t.v * dt; t.a = clamp(t.a, -.9, .9);
      t.inner.style.transform = `rotate(${t.a}rad)`;
      if (Math.abs(t.a) > .002 || Math.abs(t.v) > .01) moving = true;
    });
    if (moving) tagRaf = requestAnimationFrame(tagLoop); else tagLoop.last = 0;
  }
  function kickTags() { if (!tagRaf && tagVis) tagRaf = requestAnimationFrame(tagLoop); }
  new IntersectionObserver((es) => { tagVis = es[0].isIntersecting; if (tagVis) { tags.forEach((t, i) => { t.v += (i % 2 ? -1 : 1) * (1.1 + i * .25); }); kickTags(); } }, { threshold: .2 }).observe($('#rail'));

  /* ================================================================ ظهور تدريجي */
  let io = null;
  function watchReveal() {
    if (!('IntersectionObserver' in window) || reduce) { document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); return; }
    if (!io) io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.rv:not(.in)').forEach((e) => io.observe(e));
  }

  return {
    render() { renderWear(); renderCraft(); renderVoices(); watchReveal(); },
    setScentForWear(i) { W.i = i; renderWear(); kickWear(); }
  };
}
