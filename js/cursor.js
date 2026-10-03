/*
  مؤشر الماوس بهوية العلامة: شعلة صغيرة تتبع المؤشر مباشرة + حلقة ذهبية تلحقها بنعومة + شرار ينطفئ خلفها.
  يظهر فقط على الأجهزة التي فيها ماوس (hover + pointer: fine)، وعلى اللمس يبقى المؤشر الطبيعي.
*/
(function () {
  'use strict';
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  var ring = document.createElement('div'); ring.className = 'cur-ring';
  var core = document.createElement('div'); core.className = 'cur-core';
  core.innerHTML = '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1c1 5 7 8 7 16a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5C8.5 13 10 13 10 10c0-3 1-6 2-9z" fill="url(#flg)"/><path d="M12 15c.6 2.4 3 3.4 3 6a3 3 0 0 1-6 0c0-2 1.6-3 2-4.5.4-.8.8-1 1-1.5z" fill="#fff3d0" opacity=".9"/></svg>';
  var fx = document.createElement('canvas'); fx.className = 'cur-fx';
  document.body.appendChild(fx); document.body.appendChild(ring); document.body.appendChild(core);
  var g = fx.getContext('2d');

  var mx = -100, my = -100, rx = -100, ry = -100, seen = false, sparks = [], lastSpawn = 0, W = 0, H = 0, dpr = 1;
  function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; fx.width = W * dpr; fx.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); window.addEventListener('resize', size);

  var HOT = 'a, button, .thumb, .btn, .dots button, [role="tab"], label, summary';
  var TXT = 'input, textarea';
  function setState(el) {
    var hot = !!(el && el.closest && el.closest(HOT)), txt = !!(el && el.closest && el.closest(TXT));
    root.classList.toggle('cur-hot', hot && !txt);
    root.classList.toggle('cur-txt', txt);
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; rx = mx; ry = my; root.classList.add('cur-on'); }
    core.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    setState(e.target);
    var now = performance.now();
    if (!reduce && now - lastSpawn > 38 && sparks.length < 36) {
      lastSpawn = now;
      sparks.push({ x: mx + (Math.random() - .5) * 6, y: my + 4, vx: (Math.random() - .5) * .5, vy: -(.25 + Math.random() * .7), r: 1 + Math.random() * 1.8, life: 1, d: .016 + Math.random() * .018 });
    }
  }, { passive: true });
  document.addEventListener('pointerdown', function () { root.classList.add('cur-down'); });
  document.addEventListener('pointerup', function () { root.classList.remove('cur-down'); });
  document.documentElement.addEventListener('mouseleave', function () { root.classList.remove('cur-on'); seen = false; });
  document.documentElement.addEventListener('mouseenter', function () { if (mx > -50) root.classList.add('cur-on'); });

  function loop() {
    requestAnimationFrame(loop);
    if (!seen && !sparks.length) return;
    rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2);
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.life -= s.d;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      var grd = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      grd.addColorStop(0, 'rgba(255,196,110,' + (s.life * .9) + ')'); grd.addColorStop(1, 'rgba(255,100,20,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(s.x, s.y, s.r * 4, 0, 6.283); g.fill();
    }
  }
  root.classList.add('has-cur');
  requestAnimationFrame(loop);
})();
