/*
  محرك الهيرو: خمس وقفات. كل سكرول واحد (عجلة / لمس / سهم) ينقل المشهد للوقفة التالية:
  الفيديو يمشي نحو إطار محدد بتسارع ثم تباطؤ ناعم ويقف، والعنوان يتبدل، والزوم/الزاوية يتغيران
  (الزوم يتحكم به الموقع نفسه). بعد الوقفة الأخيرة يكمل السكرول الطبيعي للصفحة.
  الجمر يطير سريعاً مع حركة الفيديو ويطفو ببطء حين يقف.
*/
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var story = $('story'), stage = $('stage'), film = $('film'), embers = $('embers');
  var cue = $('cue'), bar = $('progressBar');
  var ctx = film.getContext('2d'), ectx = embers.getContext('2d');
  var mobileMQ = window.matchMedia('(max-width: 980px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cfg = mobileMQ.matches ? FRAMES.mobile : FRAMES.desktop;
  var N = cfg.count, SW = cfg.w, SH = cfg.h;
  var frames = new Array(N), loaded = 0;

  // مركز الزجاجة عمودياً (0..1 من ارتفاع الشريط) كل نصف ثانية من الفيديو (٢١ قيمة)
  var BY = [.55, .55, .46, .36, .34, .36, .32, .34, .32, .49, .56, .56, .51, .34, .34, .36, .41, .46, .46, .56, .56];

  // الوقفات الخمس: v = موضع الفيديو (0..1)، z = الزوم، fy = إزاحة نقطة التركيز عمودياً (كسر من ارتفاع الشريط)
  // fx = إزاحة الزجاجة لليمين (كسر من عرض الشريط) لتفسح مكاناً للعنوان على اليسار (لا تُطبّق على الهاتف)
  var STOPS = [
    { v: 0.00, z: 1.00, fy: 0, fx: 0 },          // 1 اشتعال: لقطة واسعة، الاسم
    { v: 0.21, z: 1.70, fy: 0, fx: 0.03 },       // 2 ارتفاع: الزجاجة معلّقة
    { v: 0.50, z: 2.50, fy: 0, fx: 0.07 },       // 3 دوران: قريبة جداً على الاسم
    { v: 0.65, z: 2.40, fy: -0.15, fx: 0.07 },   // 4 تاج: التركيز على السدادة والطوق الذهبي
    { v: 1.00, z: 1.00, fy: 0, fx: 0 }           // 5 استقرار: لقطة واسعة أخيرة
  ];
  var LAST = STOPS.length - 1;
  // كل وقفة تقع تماماً على إطار حقيقي، فلا يظهر خيال إطارين متداخلين أثناء التوقف
  STOPS.forEach(function (s) { s.v = Math.round(s.v * (N - 1)) / (N - 1); });
  var DUR = 2200;                      // مدة الانتقال بين وقفتين (مللي ثانية)

  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };   // تسارع ثم تباطؤ
  function at(p) {
    var i = Math.max(0, Math.min(LAST - 1, Math.floor(p))), t = Math.max(0, Math.min(1, p - i));
    var a = STOPS[i], b = STOPS[i + 1];
    return { v: a.v + (b.v - a.v) * t, z: a.z + (b.z - a.z) * t, fy: a.fy + (b.fy - a.fy) * t, fx: a.fx + (b.fx - a.fx) * t };
  }
  function bottleY(v) {
    var f = v * (BY.length - 1), i = Math.floor(f), t = f - i, j = Math.min(i + 1, BY.length - 1);
    return BY[i] + (BY[j] - BY[i]) * t;
  }

  // ---------------------------------------------------------------- frames
  function pad(n) { return ('000' + n).slice(-4); }
  function loadFrame(i) {
    return new Promise(function (res) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { frames[i] = im; loaded++; res(); };
      im.onerror = function () { res(); };
      im.src = cfg.prefix + pad(i + 1) + '.webp';
    });
  }
  var loadProgress = function () {};
  var ready = new Promise(function (resolve) {
    // أول إطار فوراً، ثم الباقي بدفعات
    loadFrame(0).then(function () {
      draw(0);
      var next = 1, active = 0, MAX = 8, doneFlag = false;
      function pump() {
        while (active < MAX && next < N) {
          active++;
          loadFrame(next++).then(function () {
            active--; loadProgress(loaded / N);
            if (next >= N && active === 0 && !doneFlag) { doneFlag = true; resolve(); }
            else pump();
          });
        }
      }
      pump();
      setTimeout(function () { if (!doneFlag) { doneFlag = true; resolve(); } }, 12000);
    });
  });

  // فك ضغط إطارات المقطع القادم (والسابق) أثناء وقوف الفيديو، بدفعات صغيرة، حتى لا يتقطع التشغيل بسبب فك الضغط عند أول رسم
  var wc = document.createElement('canvas'); wc.width = SW; wc.height = SH;
  var wx = wc.getContext('2d'), warmId = 0;
  function warmRange(v0, v1) {
    var a = Math.floor(Math.min(v0, v1) * (N - 1)), b = Math.ceil(Math.max(v0, v1) * (N - 1)), id = ++warmId, i = a;
    (function next() {
      if (id !== warmId || i > b || anim) return;
      var im = frames[i++];
      if (im) wx.drawImage(im, 0, 0);
      setTimeout(next, 5);
    })();
  }
  function warmAround() {
    var s = step;
    if (s < LAST) warmRange(STOPS[s].v, STOPS[s + 1].v);
    if (s > 0) setTimeout(function () { if (step === s && !anim) warmRange(STOPS[s - 1].v, STOPS[s].v); }, 700);
  }
  ready.then(function () { setTimeout(warmAround, 300); });

  // ---------------------------------------------------------------- canvas
  var dpr = 1, cw = 0, ch = 0, mobile = mobileMQ.matches;
  function resize() {
    mobile = mobileMQ.matches;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = film.getBoundingClientRect();
    cw = Math.max(2, Math.round(r.width * dpr)); ch = Math.max(2, Math.round(r.height * dpr));
    film.width = cw; film.height = ch;
    embers.width = Math.round(window.innerWidth * Math.min(dpr, 1.5)); embers.height = Math.round(window.innerHeight * Math.min(dpr, 1.5));
    seedEmbers();
    draw(pos);
  }

  function nearest(i) {
    if (frames[i]) return frames[i];
    for (var d = 1; d < N; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function draw(p) {
    var s = at(p), f = s.v * (N - 1), i0 = Math.floor(f), t = f - i0, i1 = Math.min(i0 + 1, N - 1);
    var a = nearest(i0), b = nearest(i1);
    if (!a) return;
    var base = mobile ? (ch / SH) * 0.84 : Math.min(cw / SW, (ch / SH) * 0.96);
    var k = base * (mobile ? 1 + (s.z - 1) * 0.62 : s.z);     // على الهاتف زوم أخف (الإطارات أصغر فتتشوش)
    var cx = (0.505 - (mobile ? 0 : s.fx)) * SW, cy = (bottleY(s.v) + s.fy) * SH;
    var tx = cw / 2 - cx * k, ty = ch / 2 - cy * k;
    var iw = SW * k, ih = SH * k;
    tx = iw <= cw ? (cw - iw) / 2 : Math.min(0, Math.max(cw - iw, tx));
    ty = ih <= ch ? (ch - ih) / 2 : Math.min(0, Math.max(ch - ih, ty));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(k, 0, 0, k, tx, ty);
    ctx.globalAlpha = 1;
    ctx.drawImage(a, 0, 0, SW, SH);
    if (b && b !== a && t > 0.02) { ctx.globalAlpha = t; ctx.drawImage(b, 0, 0, SW, SH); ctx.globalAlpha = 1; }
    feather(tx, ty, iw, ih);
  }

  // تنعيم حواف الشريط لتذوب في خلفية الصفحة (فقط الحواف الظاهرة حين لا يكون الزوم قوياً)
  function feather(tx, ty, iw, ih) {
    var fx = iw * 0.10, fy = ih * 0.18, g;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    function edge(x0, y0, x1, y1, rx, ry, rw, rh) {
      g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
    }
    if (tx > 1) edge(tx, 0, tx + fx, 0, tx, 0, fx, ch);
    if (tx + iw < cw - 1) edge(tx + iw, 0, tx + iw - fx, 0, tx + iw - fx, 0, fx, ch);
    if (ty > 1) edge(0, ty, 0, ty + fy, 0, ty, cw, fy);
    if (ty + ih < ch - 1) edge(0, ty + ih, 0, ty + ih - fy, 0, ty + ih - fy, cw, fy);
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------------------------------------------------------------- stepped playback
  var step = 0, pos = 0, anim = null, raf = 0, chaps = [], dots = [], flow = 0, lastPos = 0, lastT = 0;

  function ui() {
    for (var i = 0; i < chaps.length; i++) chaps[i].classList.toggle('on', i === step && Math.abs(pos - i) < 0.25);
    for (var j = 0; j < dots.length; j++) { dots[j].classList.toggle('on', j === step); dots[j].setAttribute('aria-current', j === step ? 'true' : 'false'); }
    if (bar) bar.style.width = (pos / LAST * 100).toFixed(1) + '%';
    if (cue) cue.classList.toggle('hide', step > 0 || pos > 0.04);
  }
  function frame(now) {
    raf = 0;
    var dt = Math.max(1, now - (lastT || now)); lastT = now;
    if (anim) {
      var t = Math.min(1, (now - anim.t0) / anim.dur);
      pos = t >= 1 ? anim.to : anim.from + (anim.to - anim.from) * ease(t);
      if (t >= 1) { anim = null; setTimeout(warmAround, 120); }
    }
    // سرعة الفيديو الحالية تحرّك الجمر: سريع أثناء التشغيل، يطفو ببطء عند الوقوف
    var vel = Math.abs(pos - lastPos) / dt * 1000; lastPos = pos;
    flow += (Math.min(1.6, vel * 1.1) - flow) * 0.12;
    draw(pos); ui();
    if (anim) raf = requestAnimationFrame(frame); else lastT = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function goTo(i, instant) {
    i = Math.max(0, Math.min(LAST, i));
    if (i === step && !anim) return;
    step = i;
    var dist = Math.abs(i - pos);
    if (instant || reduce) { anim = null; pos = i; draw(pos); ui(); return; }
    anim = { from: pos, to: i, t0: performance.now(), dur: DUR + 650 * Math.max(0, dist - 1) };
    ui(); kick();
  }
  function busy() { return !!anim || document.body.classList.contains('is-loading'); }
  function atTop() { return window.scrollY <= 2; }

  // ---- عجلة الماوس / اللمس الطرفي: سكرول واحد = وقفة واحدة
  // owned = الحركة الحالية بدأت داخل الهيرو فتبقى له حتى تنتهي (حتى لا يكمل زخم التراك باد سكرول الصفحة)
  var lastWheel = 0, consumed = true, owned = false;
  window.addEventListener('wheel', function (e) {
    var now = performance.now(), fresh = now - lastWheel > 110; lastWheel = now;
    if (fresh) { consumed = false; owned = false; }
    if (e.ctrlKey || e.defaultPrevented) return;
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (Math.abs(dy) < 2) return;
    if (!atTop()) { consumed = true; return; }                 // الصفحة نازلة: سكرول عادي
    var down = dy > 0;
    if (busy()) { e.preventDefault(); owned = true; consumed = true; return; }   // الفيديو يمشي: تجاهل
    if (!owned) {
      if ((down && step >= LAST) || (!down && step <= 0)) { consumed = true; return; }   // خارج نطاق الهيرو: سكرول عادي
      owned = true;
    }
    e.preventDefault();
    if (consumed) return;
    consumed = true;
    goTo(step + (down ? 1 : -1));
  }, { passive: false });

  var tY = 0, tX = 0, tTop = false, tDone = false;
  window.addEventListener('touchstart', function (e) { var t = e.touches[0]; tY = t.clientY; tX = t.clientX; tTop = atTop(); tDone = false; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (!tTop || e.touches.length > 1 || !atTop()) return;
    var t = e.touches[0], dy = tY - t.clientY, dx = tX - t.clientX;
    if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(dx)) return;
    var down = dy > 0;
    if (busy()) { if (e.cancelable) e.preventDefault(); tDone = true; return; }
    if (!tDone && ((down && step >= LAST) || (!down && step <= 0))) return;
    if (e.cancelable) e.preventDefault();
    if (!tDone && Math.abs(dy) > 26) { tDone = true; goTo(step + (down ? 1 : -1)); }
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || !atTop()) return;
    var tg = e.target && e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || tg === 'BUTTON' || tg === 'A') return;
    var k = e.key, down = k === 'ArrowDown' || k === 'PageDown' || k === ' ', up = k === 'ArrowUp' || k === 'PageUp';
    if (!down && !up) return;
    if (!busy() && ((down && step >= LAST) || (up && step <= 0))) return;
    e.preventDefault();
    if (!busy()) goTo(step + (down ? 1 : -1));
  });

  // "الرئيسية" ترجع الهيرو للوقفة الأولى
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#top"]');
    if (!a) return;
    goTo(0, window.scrollY > window.innerHeight * 0.6);
  });

  // ---------------------------------------------------------------- embers (particles)
  var parts = [], emberOn = true, eLast = 0;
  function seedEmbers() {
    var n = mobile ? 24 : 50, W = embers.width, H = embers.height;
    parts = [];
    for (var i = 0; i < n; i++) parts.push(newPart(W, H, true));
  }
  function newPart(W, H, rand) {
    return { x: Math.random() * W, y: rand ? Math.random() * H : H + 10, r: .6 + Math.random() * 2.2, vy: .3 + Math.random() * .8, sw: Math.random() * 6.28, sp: .006 + Math.random() * .014, a: .25 + Math.random() * .6 };
  }
  function emberLoop(now) {
    requestAnimationFrame(emberLoop);
    var dt = Math.min(3, (now - (eLast || now)) / 16.67); eLast = now;
    if (!emberOn || document.hidden || reduce) return;
    var W = embers.width, H = embers.height, sc = Math.min(dpr, 1.5);
    var speed = 0.16 + flow * 1.7;                 // 0.16 = طفو بطيء عند الوقوف
    ectx.clearRect(0, 0, W, H);
    ectx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i];
      q.sw += q.sp * dt * (0.5 + flow);
      q.y -= q.vy * speed * sc * dt;
      q.x += Math.sin(q.sw) * (0.18 + flow * 0.3) * sc * dt;
      if (q.y < -10) parts[i] = q = newPart(W, H, false);
      var tw = q.a * (0.78 + 0.22 * Math.sin(q.sw * 2.3));
      var g = ectx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 5 * sc);
      g.addColorStop(0, 'rgba(255,190,90,' + tw + ')'); g.addColorStop(1, 'rgba(255,90,10,0)');
      ectx.fillStyle = g; ectx.beginPath(); ectx.arc(q.x, q.y, q.r * 5 * sc, 0, 6.283); ectx.fill();
    }
  }

  // ---------------------------------------------------------------- public api
  window.HERO = {
    ready: ready,
    onProgress: function (fn) { loadProgress = fn; },
    refresh: function () {
      chaps = Array.prototype.slice.call(document.querySelectorAll('#chapters .chap'));
      dots = Array.prototype.slice.call(document.querySelectorAll('#dots button'));
      draw(pos); ui();
    },
    jump: function (i) {
      if (!atTop()) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      goTo(i);
    },
    state: function () { return { step: step, pos: pos, busy: !!anim, flow: flow }; },
    stops: STOPS,                                                     // للتعديل أثناء الضبط (نفس المصفوفة)
    show: function (p) { pos = p; draw(p); },                         // رسم لحظة محددة بدون حركة (للاختبار)
    resize: resize
  };

  window.addEventListener('resize', function () { resize(); });
  mobileMQ.addEventListener && mobileMQ.addEventListener('change', function () { location.reload(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { emberOn = en[0].isIntersecting; }, { threshold: 0 }).observe(stage);
  }
  resize();
  requestAnimationFrame(emberLoop);
})();
