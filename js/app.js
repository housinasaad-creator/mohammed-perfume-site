/* واجهة الموقع: لغتان بدون قلب الاتجاه، معرض العطور، بطاقات، تفاعلات خفيفة. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'mhd-lang';
  var lang = 'en';
  try { lang = localStorage.getItem(KEY) || 'en'; } catch (e) {}
  if (!CONTENT[lang]) lang = 'en';

  var state = { cur: 0, bag: 0 };
  var HALOS = { ember: 'rgba(255,140,40,.5)', noir: 'rgba(255,170,90,.32)', rose: 'rgba(255,120,110,.42)', veil: 'rgba(255,190,80,.46)', musk: 'rgba(110,140,230,.4)', dunes: 'rgba(255,200,90,.48)' };

  function get(path) {
    var o = CONTENT[lang], p = path.split('.');
    for (var i = 0; i < p.length; i++) { if (o == null) return ''; o = o[p[i]]; }
    return o == null ? '' : o;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function money(v) { return lang === 'ar' ? '$' + Number(v).toLocaleString('ar-EG', { useGrouping: false }) : '$' + v; }

  // الاتجاه ثابت LTR. العناصر العربية تأخذ dir=rtl داخلياً لسلامة علامات الترقيم، لكنها تُحاذى لليسار.
  function setDir(el) { el.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); }

  // صور الزجاجات (assets/bottles/<id>.webp و <id>-s.webp للمصغّرة). إذا لم تتحمّل صورة نرجع للرسم البرمجي.
  function bottleHTML(p, small) {
    var src = 'assets/bottles/' + p.id + (small ? '-s' : '') + '.webp';
    return '<img class="photo" src="' + src + '" alt="MOHAMMED · ' + esc(p.name) + '" decoding="async" ' + (small ? 'loading="lazy" ' : '') +
      'onerror="this.outerHTML=BOTTLES.svg(\'' + p.id + '\')">';
  }

  function renderStatic() {
    var T = CONTENT[lang];
    document.documentElement.lang = T.lang;
    document.documentElement.dir = 'ltr';
    document.title = T.title;
    $$('[data-i]').forEach(function (el) { el.textContent = get(el.getAttribute('data-i')); setDir(el); });
    $('#mailIn').placeholder = T.contact.ph; setDir($('#mailIn'));

    // الفصول + النقاط
    $('#chapters').innerHTML = T.chapters.map(function (c, i) {
      var dd = ' dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '"';
      return '<article class="chap' + (i === 0 ? ' brand' : '') + '">' +
        '<p class="k"' + dd + '>' + esc(c.k) + '</p><h2' + dd + '>' + esc(c.t) + '</h2><p class="s"' + dd + '>' + esc(c.s) + '</p>' +
        (c.cta && i === T.chapters.length - 1 ? '<a class="go" href="#collection"' + dd + '>' + esc(c.cta) + '</a>' : '') + '</article>';
    }).join('');
    $('#dots').innerHTML = T.dots.map(function (d, i) { return '<button type="button" data-i-dot="' + i + '" aria-label="' + esc(d) + '"><span dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(d) + '</span></button>'; }).join('');
    $$('#dots button').forEach(function (b) { b.addEventListener('click', function () { HERO.jump(+b.getAttribute('data-i-dot')); }); });

    // الملاحظات
    var icons = [ICONS.oud, ICONS.cinnamon, ICONS.blossom];
    $('#notesCards').innerHTML = T.notes.items.map(function (it, i) {
      return '<article class="card rv" style="--i:' + i + '"><span class="num">' + it.n + '</span><div class="ic">' + icons[i] + '</div><h3 dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(it.t) + '</h3><p dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(it.d) + '</p></article>';
    }).join('');

    // الصنعة
    $('#steps').innerHTML = T.craft.steps.map(function (s, i) {
      return '<li class="step rv" style="--i:' + i + '"><span class="dot">' + s.n + '</span><h3 dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(s.t) + '</h3><p dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(s.d) + '</p></li>';
    }).join('');

    // الآراء
    $('#voiceCards').innerHTML = T.voices.items.map(function (v, i) {
      return '<article class="card quote rv" style="--i:' + i + '"><span class="mark">“</span><p dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(v.q) + '</p><cite dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(v.a) + '</cite></article>';
    }).join('');

    // بطاقات المعرض المصغّرة
    $('#thumbs').innerHTML = T.products.map(function (p, i) {
      return '<button type="button" class="thumb' + (i === state.cur ? ' on' : '') + '" role="tab" data-p="' + i + '"><div class="tb">' + bottleHTML(p, true) + '</div><b dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '">' + esc(p.name) + '</b><small>' + money(p.price) + '</small></button>';
    }).join('');
    $$('#thumbs .thumb').forEach(function (b) { b.addEventListener('click', function () { select(+b.getAttribute('data-p'), true); }); });

    $('#loaderFlame').innerHTML = ICONS.flame; $('#logoFlame').innerHTML = ICONS.flame; $('#ftrFlame').innerHTML = ICONS.flame;
    $('#bagCount').textContent = lang === 'ar' ? Number(state.bag).toLocaleString('ar-EG', { useGrouping: false }) : state.bag;
    $('#addTxt').textContent = T.collection.add;
    fillProduct(false);
    watchReveal();
    if (window.HERO) HERO.refresh();
  }

  function fillProduct(animate) {
    var T = CONTENT[lang], p = T.products[state.cur], C = T.collection, dir = lang === 'ar' ? 'rtl' : 'ltr';
    var bottle = $('#showBottle'), info = $('#showInfo');
    function apply() {
      bottle.innerHTML = bottleHTML(p, false);
      $('#halo').style.setProperty('--halo', HALOS[p.id]);
      $('#showBottle').style.setProperty('--halo', HALOS[p.id]);
      $('#pTag').textContent = p.tag; $('#pName').textContent = p.name; $('#pDesc').textContent = p.d;
      [$('#pTag'), $('#pName'), $('#pDesc')].forEach(function (e) { e.setAttribute('dir', dir); });
      $('#pPyr').innerHTML = [[C.top, p.top], [C.heart, p.heart], [C.base, p.base]].map(function (r) { return '<li><span dir="' + dir + '">' + esc(r[0]) + '</span><b dir="' + dir + '">' + esc(r[1]) + '</b></li>'; }).join('');
      $('#pPrice').textContent = money(p.price);
      $('#pSize').textContent = C.size; $('#pSize').setAttribute('dir', dir);
      $$('#thumbs .thumb').forEach(function (b, i) { b.classList.toggle('on', i === state.cur); });
      var btn = $('#addBtn'); btn.classList.remove('added'); $('#addTxt').textContent = C.add;
      bottle.classList.remove('swap'); info.classList.remove('swap');
    }
    if (!animate || reduce) { apply(); return; }
    bottle.classList.add('swap'); info.classList.add('swap');
    setTimeout(apply, 360);
  }
  function select(i, animate) { if (i === state.cur && animate) return; state.cur = i; fillProduct(animate); }

  // ---------------------------------------------------------------- bag / toast
  var toastT = 0;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  $('#addBtn').addEventListener('click', function () {
    var C = CONTENT[lang].collection;
    state.bag++;
    var c = $('#bagCount'); c.textContent = lang === 'ar' ? Number(state.bag).toLocaleString('ar-EG', { useGrouping: false }) : state.bag; c.classList.add('on');
    var bag = $('#bag'); bag.classList.remove('pop'); void bag.offsetWidth; bag.classList.add('pop');
    this.classList.add('added'); $('#addTxt').textContent = C.added + ' ✓';
    toast(CONTENT[lang].products[state.cur].name + ' · ' + C.added);
  });
  $('#mail').addEventListener('submit', function (e) { e.preventDefault(); toast(CONTENT[lang].contact.thanks); this.reset(); });

  // ---------------------------------------------------------------- language
  $('#lang').addEventListener('click', function () {
    lang = lang === 'en' ? 'ar' : 'en';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    renderStatic();
  });

  // ---------------------------------------------------------------- header, reveal, glow
  var hdr = $('#hdr');
  function onScroll() { hdr.classList.toggle('solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var io = null;
  function watchReveal() {
    if (!('IntersectionObserver' in window) || reduce) { $$('.rv').forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    $$('.rv:not(.in)').forEach(function (e) { io.observe(e); });
  }
  // وهج يتبع المؤشر داخل البطاقات
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // ---------------------------------------------------------------- start
  renderStatic();
  // تحميل مسبق للصور الكبيرة كي لا يتأخر التبديل بين العطور
  CONTENT.en.products.forEach(function (p) { var im = new Image(); im.src = 'assets/bottles/' + p.id + '.webp'; });
  var lbar = $('#loaderBar');
  HERO.onProgress(function (f) { lbar.style.width = Math.round(f * 100) + '%'; });
  HERO.ready.then(function () {
    lbar.style.width = '100%';
    HERO.resize(); HERO.refresh();
    setTimeout(function () { $('#loader').classList.add('done'); document.body.classList.remove('is-loading'); }, 350);
  });
})();
