/*
  الواجهة: لغتان بدون قلب الاتجاه، نصوص الهيرو، لوحة العطر، رذاذ الكلمات، الإضافة للحقيبة بالطيران، الصوت.
  المشهد الثلاثي الأبعاد في js/gl، والمتجر في js/store.js، والأقسام السفلية في js/sections.js.
*/
import { Experience } from './gl/experience.js';
import { Sfx } from './gl/sfx.js';
import { MOODS, SCENTS } from './gl/core.js';
import { initStore } from './store.js';
import { initSections } from './sections.js';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLAME = '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1c1 5 7 8 7 16a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5C8.5 13 10 13 10 10c0-3 1-6 2-9z" fill="url(#flg)"/><path d="M12 15c.6 2.4 3 3.4 3 6a3 3 0 0 1-6 0c0-2 1.6-3 2-4.5.4-.8.8-1 1-1.5z" fill="#fff3d0" opacity=".9"/></svg>';
window.__flameSVG = FLAME;

const KEY = 'mhd-lang';
let lang = 'en';
try { lang = localStorage.getItem(KEY) || 'en'; } catch (e) {}
if (!window.CONTENT[lang]) lang = 'en';
const T = () => window.CONTENT[lang];
const num = (n) => (lang === 'ar' ? Number(n).toLocaleString('ar-EG', { useGrouping: false }) : String(n));
const money = (v) => '$' + num(v);
const dirAttr = () => (lang === 'ar' ? 'rtl' : 'ltr');

const UI = { size: 50, qty: 1, focus: 0, engrave: '', ready: false, lastStep: 0 };
const sfx = new Sfx();
let exp = null, store = null, sections = null;

/* ---------------------------------------------------------------- لون التمييز يتبع العطر */
function setAccent(i) {
  const m = MOODS[SCENTS[i]]; if (!m) return;
  const root = document.documentElement;
  const c = m.accent; root.style.setProperty('--accent', c);
  const n = parseInt(c.slice(1), 16); root.style.setProperty('--accent-rgb', `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`);
}

/* ---------------------------------------------------------------- نصوص */
function get(path) { let o = T(), p = path.split('.'); for (let i = 0; i < p.length; i++) { if (o == null) return ''; o = o[p[i]]; } return o == null ? '' : o; }
function unitPrice(i) { const base = window.CONTENT.en.products[i].price; const k = window.SIZES.find((z) => z.ml === UI.size).k; return Math.round(base * k); }

function renderStatic() {
  const t = T();
  document.documentElement.lang = t.lang; document.documentElement.dir = 'ltr'; document.title = t.title;
  $$('[data-i]').forEach((el) => { el.textContent = get(el.getAttribute('data-i')); el.setAttribute('dir', dirAttr()); });
  $('#mailIn').placeholder = t.contact.ph; $('#mailIn').setAttribute('dir', dirAttr());
  $('#engrave').placeholder = t.shop.engravePh; $('#engrave').setAttribute('dir', 'ltr');
  // فصول الهيرو
  $('#chapters').innerHTML = t.chapters.map((c, i) => {
    const dd = ` dir="${dirAttr()}"`;
    return `<article class="chap${i === 0 ? ' brand' : ''}"><p class="k"${dd}>${esc(c.k)}</p><h2${dd}>${esc(c.t)}</h2><p class="s"${dd}>${esc(c.s)}</p>${c.cta ? `<a class="go" href="#collection"${dd}>${esc(c.cta)}</a>` : ''}</article>`;
  }).join('');
  $('#dots').innerHTML = t.dots.map((d, i) => `<button type="button" data-i-dot="${i}" aria-label="${esc(d)}"><span dir="${dirAttr()}">${esc(d)}</span></button>`).join('');
  $$('#dots button').forEach((b) => b.addEventListener('click', () => { if (exp) exp.goStep(+b.getAttribute('data-i-dot')); }));
  $('.go', $('#chapters')) && $('.go', $('#chapters')).addEventListener('click', (e) => { e.preventDefault(); scrollToShop(); });
  // رف المصغّرات
  $('#shelfNav').innerHTML = `<button class="sn-arrow" type="button" id="snPrev" aria-label="${esc(t.shop.prev)}">‹</button>` +
    t.products.map((p, i) => `<button type="button" class="sn" data-i="${i}" aria-label="${esc(p.name)}" title="${esc(p.name)}"><img src="assets/bottles/${p.id}-s.webp" alt=""></button>`).join('') +
    `<button class="sn-arrow" type="button" id="snNext" aria-label="${esc(t.shop.next)}">›</button>`;
  $$('#shelfNav .sn').forEach((b) => b.addEventListener('click', () => { exp && exp.setFocus(+b.dataset.i); sfx.clink(1.1); }));
  $('#snPrev').onclick = () => { exp && exp.setFocus(UI.focus - 1); sfx.tick(); };
  $('#snNext').onclick = () => { exp && exp.setFocus(UI.focus + 1); sfx.tick(); };
  $('#soundBtn').setAttribute('aria-label', sfx.on ? t.soundOn : t.soundOff);
  fillPanel(UI.focus, false);
  $('#loaderFlame').innerHTML = FLAME; $('#logoFlame').innerHTML = FLAME; $('#ftrFlame').innerHTML = FLAME;
  if (store) store.rerender();
  if (sections) sections.render();
  updateHero();
  $('#fbImg').src = `assets/bottles/${SCENTS[UI.focus]}.webp`;
}

/* ---------------------------------------------------------------- لوحة العطر */
function fillPanel(i, animate) {
  const t = T(), p = t.products[i], d = dirAttr(), s = t.shop;
  const inner = $('#panelIn');
  const apply = () => {
    $('#pTag').textContent = p.tag; $('#pName').textContent = p.name; $('#pDesc').textContent = p.d;
    ['#pTag', '#pName', '#pDesc'].forEach((q) => $(q).setAttribute('dir', d));
    $('#pPyr').innerHTML = [[s.top, p.top], [s.heart, p.heart], [s.base, p.base]].map((r) => `<li><span dir="${d}">${esc(r[0])}</span><b dir="${d}">${esc(r[1])}</b></li>`).join('');
    $('#sizes').innerHTML = window.SIZES.map((z) => `<button type="button" class="size ${z.ml === UI.size ? 'on' : ''}" data-ml="${z.ml}" role="radio" aria-checked="${z.ml === UI.size}">${num(z.ml)} ml<small>${money(Math.round(window.CONTENT.en.products[i].price * z.k))}</small></button>`).join('');
    $$('#sizes .size').forEach((b) => b.addEventListener('click', () => { UI.size = +b.dataset.ml; fillPanel(UI.focus, false); sfx.tick(); }));
    $('#pPrice').textContent = money(unitPrice(i) * UI.qty);
    $('#qVal').textContent = num(UI.qty);
    const btn = $('#addBtn'); btn.classList.remove('added'); $('#addTxt').textContent = s.add;
    $$('#shelfNav .sn').forEach((b, k) => b.classList.toggle('on', k === i));
    inner.classList.remove('swap');
  };
  if (!animate || reduce) { apply(); return; }
  inner.classList.add('swap'); setTimeout(apply, 260);
}
$('#qMinus').addEventListener('click', () => { UI.qty = clamp(UI.qty - 1, 1, 20); $('#qVal').textContent = num(UI.qty); $('#pPrice').textContent = money(unitPrice(UI.focus) * UI.qty); sfx.tick(); });
$('#qPlus').addEventListener('click', () => { UI.qty = clamp(UI.qty + 1, 1, 20); $('#qVal').textContent = num(UI.qty); $('#pPrice').textContent = money(unitPrice(UI.focus) * UI.qty); sfx.tick(); });
let engTimer = 0;
$('#engrave').addEventListener('input', (e) => { UI.engrave = e.target.value; clearTimeout(engTimer); engTimer = setTimeout(() => exp && exp.setEngraving(UI.engrave.trim()), 140); });
$('#sprayBtn').addEventListener('click', () => exp && exp.sprayFocused());

/* ---------------------------------------------------------------- كلمات النوتات تطفو مع الرذاذ */
function noteWords(i, pt) {
  const t = T(), p = t.products[i], s = t.shop, layer = $('#notesLayer');
  [[s.top, p.top], [s.heart, p.heart], [s.base, p.base]].forEach(([label, name], k) => {
    const el = document.createElement('div'); el.className = 'note';
    el.innerHTML = `<small dir="${dirAttr()}">${esc(label)}</small><b dir="${dirAttr()}">${esc(name)}</b>`;
    const x = clamp(pt.x + (k - 1) * 150 + rand(-30, 30), 90, innerWidth - 90);
    el.style.left = x + 'px'; el.style.top = clamp(pt.y + k * 52 - 60, 100, innerHeight - 120) + 'px';
    el.style.setProperty('--dx', rand(-50, 50) + 'px'); el.style.setProperty('--dur', '4s'); el.style.animationDelay = (0.2 + k * 0.3) + 's';
    layer.appendChild(el); setTimeout(() => el.remove(), 5600);
  });
}

/* ---------------------------------------------------------------- الإضافة للحقيبة (طيران) */
function flyToBag(i, done) {
  const layer = $('#flyLayer'), bag = $('#bag').getBoundingClientRect();
  if (!exp || reduce) { done(); return; }
  const a = exp.flyPoint(i), b = { x: bag.left + bag.width / 2, y: bag.top + bag.height / 2 };
  const c = { x: (a.x + b.x) / 2 + (a.x < b.x ? 80 : -80), y: Math.min(a.y, b.y) - 150 };
  const el = document.createElement('div'); el.className = 'fly'; el.innerHTML = `<img src="assets/bottles/${SCENTS[i]}-s.webp" alt="">`; layer.appendChild(el);
  const frames = [], N = 28;
  for (let k = 0; k <= N; k++) {
    const u = k / N, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x, y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
    frames.push({ transform: `translate(${x}px, ${y}px) scale(${1 - .78 * e}) rotate(${e * 240}deg)`, opacity: u > .92 ? 1 - (u - .92) / .08 : 1, offset: u });
  }
  const dur = 950; const t0 = performance.now();
  const anim = el.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });
  const trail = setInterval(() => {
    const u = clamp((performance.now() - t0) / dur, 0, 1), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x, y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
    const s = document.createElement('i'); s.className = 'trail'; s.style.left = x + 'px'; s.style.top = y + 'px'; layer.appendChild(s); setTimeout(() => s.remove(), 700);
  }, 34);
  anim.onfinish = () => { clearInterval(trail); el.remove(); done(); };
}
$('#addBtn').addEventListener('click', () => {
  const i = UI.focus, btn = $('#addBtn'); if (btn.disabled) return;
  btn.disabled = true; sfx.clink(1.3);
  const p = T().products[i], size = UI.size, qty = UI.qty, eng = UI.engrave.trim();
  flyToBag(i, () => {
    store.add(SCENTS[i], size, qty, eng);
    sfx.add(); btn.disabled = false; btn.classList.add('added'); $('#addTxt').textContent = T().shop.added + ' ✓';
    toast(`${p.name} · ${T().shop.added}`);
    setTimeout(() => { if (btn.classList.contains('added')) { btn.classList.remove('added'); $('#addTxt').textContent = T().shop.add; } }, 2200);
  });
});

/* ---------------------------------------------------------------- toast */
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.setAttribute('dir', dirAttr()); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

/* ---------------------------------------------------------------- الهيرو: عناوين + تقدم */
function updateHero() {
  if (!exp) return;
  const step = exp.step, pos = exp.pos;
  $$('#chapters .chap').forEach((c, i) => c.classList.toggle('on', i === step && Math.abs(pos - i) < 0.25 && exp.shopT < 0.4));
  $$('#dots button').forEach((b, i) => { b.classList.toggle('on', i === step); b.setAttribute('aria-current', i === step ? 'true' : 'false'); });
  $('#progressBar').style.width = (pos / 4 * 100).toFixed(1) + '%';
  $('#cue').classList.toggle('hide', step > 0 || pos > 0.04 || exp.shopT > 0.05);
}

function scrollToShop() { sfx.whoosh(); document.getElementById('collection').scrollIntoView({ behavior: 'smooth' }); }

/* ---------------------------------------------------------------- لغة + صوت + رأس الصفحة */
$('#lang').addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  try { localStorage.setItem(KEY, lang); } catch (e) {}
  renderStatic();
});
function toggleSound() {
  const on = sfx.toggle();
  $('#soundBtn').setAttribute('aria-pressed', on ? 'true' : 'false'); $('#soundBtn').setAttribute('aria-label', on ? T().soundOn : T().soundOff);
  $('#soundTip').classList.add('hide');
}
$('#soundBtn').addEventListener('click', toggleSound);
$('#soundTip').addEventListener('click', toggleSound);
const hdr = $('#hdr');
window.addEventListener('scroll', () => hdr.classList.toggle('solid', window.scrollY > 40), { passive: true });
$$('#nav a, .logo').forEach((a) => a.addEventListener('click', (e) => {
  const h = a.getAttribute('href');
  if (h === '#top') { e.preventDefault(); exp && exp.goStep(0, window.scrollY > innerHeight * 0.6); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}));
$('#mail').addEventListener('submit', (e) => { e.preventDefault(); toast(T().contact.thanks); e.target.reset(); });

/* ---------------------------------------------------------------- تشغيل */
async function start() {
  renderStatic();
  sections = initSections({ T, lang: () => lang, sfx, accentTo: (i) => setAccent(i) });
  store = initStore({ T, lang: () => lang, CONTENT: window.CONTENT, money, num, sfx });
  renderStatic();
  const lbar = $('#loaderBar');
  const showUI = () => { lbar.style.width = '100%'; setTimeout(() => { $('#loader').classList.add('done'); document.body.classList.remove('is-loading'); }, 350); };
  try {
    exp = new Experience({
      canvas: $('#gl'), heroEl: $('#hero'), shopEl: $('#collection'),
      locked: () => document.body.classList.contains('modal-open') || $('#cart').classList.contains('on'),
      sfx,
      onStep: () => updateHero(),
      onFrame: () => updateHero(),
      onFocus: (i) => { if (i === UI.focus && UI.ready) return; const animate = UI.ready; if (animate) sfx.clink(0.9 + (i % 4) * 0.12); UI.focus = i; UI.ready = true; setAccent(i); fillPanel(i, animate); $('#fbImg').src = `assets/bottles/${SCENTS[i]}.webp`; sections && sections.setScentForWear && !window.__wearTouched && sections.setScentForWear(i); },
      onSpray: (i, pt) => noteWords(i, pt),
      onHover: (kind) => window.dispatchEvent(new CustomEvent('mhd-cursor', { detail: kind ? T().shop.cur[kind] || null : null })),
      onShopT: (st) => document.documentElement.style.setProperty('--st', st.toFixed(3))
    });
    await exp.init((f) => { lbar.style.width = Math.round(f * 100) + '%'; });
    window.__mhd = { exp, store, UI, sfx };
    setAccent(0);
    showUI();
    setTimeout(() => exp.intro(), 500);
  } catch (err) {
    console.warn('WebGL unavailable, using the static fallback', err);
    document.documentElement.classList.add('no-gl');
    exp = null; showUI();
    // بدون 3D: الوقفات نصية فقط
    let step = 0; const show = () => { $$('#chapters .chap').forEach((c, i) => c.classList.toggle('on', i === step)); $$('#dots button').forEach((b, i) => b.classList.toggle('on', i === step)); };
    show(); $$('#dots button').forEach((b) => b.addEventListener('click', () => { step = +b.getAttribute('data-i-dot'); show(); }));
    $$('#shelfNav .sn').forEach((b) => b.addEventListener('click', () => { UI.focus = +b.dataset.i; setAccent(UI.focus); fillPanel(UI.focus, true); $('#fbImg').src = `assets/bottles/${SCENTS[UI.focus]}.webp`; }));
  }
}
document.fonts && document.fonts.ready ? document.fonts.ready.then(start) : start();
