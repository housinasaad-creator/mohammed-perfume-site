/*
  محرك السكرول: يربط تقدّم الصفحة بإطارات الفيديو (canvas) مع توقفات عند إطارات محددة
  وزوم يتحكم به الموقع نفسه (لا يوجد زوم داخل الفيديو).
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

  // الجدول: [تقدّم السكرول، تقدّم الفيديو، الزوم]  ← الأجزاء المتساوية = توقف عند إطار
  var TL = [
    [0.00, 0.00, 1.00],
    [0.10, 0.00, 1.00],   // توقف 1: الإطار الأول (العنوان)
    [0.30, 0.30, 1.75],   // ارتفاع الزجاجة + زوم أولي
    [0.37, 0.30, 1.75],   // توقف 2: الزجاجة معلّقة
    [0.56, 0.62, 2.55],   // دوران + زوم قوي
    [0.64, 0.62, 2.55],   // توقف 3: لقطة قريبة جداً
    [0.84, 1.00, 1.00],   // هبوط + رجوع للوضع الطبيعي
    [1.00, 1.00, 1.00]    // توقف 4: الإطار الأخير
  ];
  var CH = [[0, 0.14], [0.15, 0.36], [0.38, 0.65], [0.67, 1.01]];
  var STOPS = [0.02, 0.29, 0.60, 0.93];

  var smooth = function (t) { return t * t * (3 - 2 * t); };
  function at(p) {
    for (var i = 0; i < TL.length - 1; i++) {
      var a = TL[i], b = TL[i + 1];
      if (p <= b[0]) {
        var t = b[0] === a[0] ? 1 : smooth((p - a[0]) / (b[0] - a[0]));
        return { v: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t };
      }
    }
    var l = TL[TL.length - 1];
    return { v: l[1], z: l[2] };
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
      var next = 1, active = 0, MAX = 6, doneFlag = false;
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
      setTimeout(function () { if (!doneFlag) { doneFlag = true; resolve(); } }, 9000);
    });
  });

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
    draw(cur.p);
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
    var k = base * s.z;
    var cx = 0.505 * SW, cy = bottleY(s.v) * SH;
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

  // ---------------------------------------------------------------- scroll state
  var cur = { p: 0 }, target = 0, raf = 0, chaps = [], dots = [];
  function readScroll() {
    var top = story.offsetTop, h = story.offsetHeight - window.innerHeight;
    target = Math.max(0, Math.min(1, (window.scrollY - top) / Math.max(1, h)));
  }
  function ui(p) {
    for (var i = 0; i < chaps.length; i++) chaps[i].classList.toggle('on', p >= CH[i][0] && p < CH[i][1]);
    for (var j = 0; j < dots.length; j++) {
      var on = p >= CH[j][0] && p < CH[j][1];
      dots[j].classList.toggle('on', on);
    }
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    if (cue) cue.classList.toggle('hide', p > 0.04);
  }
  function tick() {
    raf = 0;
    var d = target - cur.p;
    cur.p = Math.abs(d) < 0.0005 || reduce ? target : cur.p + d * 0.16;
    draw(cur.p); ui(cur.p);
    if (Math.abs(target - cur.p) > 0.0005) raf = requestAnimationFrame(tick);
  }
  function onScroll() { readScroll(); if (!raf) raf = requestAnimationFrame(tick); }

  // ---------------------------------------------------------------- embers (particles)
  var parts = [], emberOn = true;
  function seedEmbers() {
    var n = mobile ? 22 : 46, W = embers.width, H = embers.height;
    parts = [];
    for (var i = 0; i < n; i++) parts.push(newPart(W, H, true));
  }
  function newPart(W, H, rand) {
    return { x: Math.random() * W, y: rand ? Math.random() * H : H + 10, r: .6 + Math.random() * 2.2, vy: .25 + Math.random() * .9, sw: Math.random() * 6.28, sp: .004 + Math.random() * .012, a: .25 + Math.random() * .6 };
  }
  var lastY = window.scrollY, boost = 0;
  function emberLoop() {
    requestAnimationFrame(emberLoop);
    if (!emberOn || document.hidden || reduce) return;
    var W = embers.width, H = embers.height, sc = Math.min(dpr, 1.5);
    boost *= 0.94;
    ectx.clearRect(0, 0, W, H);
    ectx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i];
      q.y -= (q.vy + boost) * sc; q.sw += q.sp * 60; q.x += Math.sin(q.sw) * .4 * sc;
      if (q.y < -10) parts[i] = q = newPart(W, H, false);
      var g = ectx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 5 * sc);
      g.addColorStop(0, 'rgba(255,190,90,' + q.a + ')'); g.addColorStop(1, 'rgba(255,90,10,0)');
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
      readScroll(); cur.p = target; draw(cur.p); ui(cur.p);
    },
    jump: function (i) {
      var h = story.offsetHeight - window.innerHeight;
      window.scrollTo({ top: story.offsetTop + STOPS[i] * h, behavior: reduce ? 'auto' : 'smooth' });
    },
    resize: resize
  };

  window.addEventListener('scroll', function () {
    var y = window.scrollY; boost = Math.min(3.5, boost + Math.abs(y - lastY) * 0.02); lastY = y; onScroll();
  }, { passive: true });
  window.addEventListener('resize', function () { resize(); onScroll(); });
  mobileMQ.addEventListener && mobileMQ.addEventListener('change', function () { location.reload(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { emberOn = en[0].isIntersecting; }, { threshold: 0 }).observe(stage);
  }
  resize();
  emberLoop();
})();
