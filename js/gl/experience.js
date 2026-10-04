/*
  التجربة: خمس وقفات للهيرو (كاميرا حقيقية تدور وتقترب بلا فقدان جودة) ثم رف العطور:
  الزجاجات تنزلق وتميل وسائلها يرتجّ كأنها على صينية، وكل عطر له جوّه الخاص.
  كل شيء هنا بالمشهد الثلاثي الأبعاد؛ الواجهة (DOM) تتصل عبر callbacks.
*/
import * as THREE from 'three';
import { Stage, SCENTS, MOODS } from './core.js';
import { buildBottle, PRODUCT_IDS, setEngraving } from './bottles.js';

const V3 = THREE.Vector3;
const SPACING = 2.75;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/* الوقفات الخمس: كاميرا، هدف، رفع الزجاجة، دوران، رفع الغطاء، وهج، موضع الزجاجة على الشاشة */
const HERO = [
  { cam: [0.4, 1.5, 9.4], tgt: [0, 1.05, 0], lift: 0, yaw: 0.5, cap: 0, boost: 0.15 },
  { cam: [1.0, 1.3, 8.2], tgt: [0, 1.62, 0], lift: 0.6, yaw: 1.5, cap: 0, boost: 0.7 },
  { cam: [0.0, 1.45, 6.9], tgt: [0, 1.58, 0], lift: 0.6, yaw: TAU, cap: 0, boost: 0.45 },
  { cam: [0.3, 2.5, 7.2], tgt: [0, 2.2, 0], lift: 0.6, yaw: TAU + 0.35, cap: 0.8, boost: 1.0 },
  { cam: [0.4, 1.5, 9.4], tgt: [0, 1.05, 0], lift: 0, yaw: TAU + 0.5, cap: 0, boost: 0.15 }
];
const LAST = HERO.length - 1;
const DUR = 2300;

export class Experience {
  constructor(opts) {
    this.o = opts;
    this.mql = window.matchMedia('(max-width: 860px)');
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.step = 0; this.pos = 0; this.anim = null; this.introStart = null;
    this.focus = 0; this.focusTarget = 0; this.lastFocus = -1;
    this.shopT = 0; this.active = true;
    this.bottles = [];
    this.drag = null; this.hover = -2; this.userYaw = 0; this.userVel = 0;
    this.pointer = new THREE.Vector2(); this.ray = new THREE.Raycaster();
    this.lookMix = new THREE.Vector2(); this.lookTgt = new THREE.Vector2();
    this.mood = { w: new Float32Array(6), boost: 0, boostKick: 0 };
    this._tmp = { a: new V3(), b: new V3(), c: new V3(), m: new THREE.Matrix4(), q: new THREE.Quaternion() };
  }

  get mobile() { return this.mql.matches; }

  async init(progress) {
    const canvas = this.o.canvas;
    this.stage = new Stage(canvas, { mobile: this.mobile || /Android|iPhone|iPad/i.test(navigator.userAgent), preserve: this.o.preserve });
    const S = this.stage;
    let n = 0;
    for (const id of PRODUCT_IDS) {
      const info = await buildBottle(id);
      const holder = new THREE.Group();
      holder.add(info.group);
      const shadow = S.makeShadow(info.radius);
      const hit = new THREE.Mesh(new THREE.BoxGeometry(info.radius * 2.1, info.height, info.radius * 2.1), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
      hit.position.y = info.height / 2; hit.renderOrder = -1; holder.add(hit);
      S.scene.add(holder, shadow);
      const mirror = S.addMirror(info);
      // المرآة تتبع holder أيضاً: نمرّر مصفوفة holder
      mirror.holder = holder;
      const b = {
        id, info, holder, shadow, hit, mirror, norm: clamp(2.2 / info.height, 0.85, 1.2),
        tilt: 0, tiltVel: 0, sx: 0, sz: 0, svx: 0, svz: 0, px: 0, pvx: 0, ax: 0, hover: 0, pop: 0, capLift: 0, spin: 0, idle: Math.random() * 6
      };
      this.bottles.push(b);
      progress && progress(++n / PRODUCT_IDS.length);
    }
    // المرآة يجب أن تنعكس عن مصفوفة العالم لـ info.group (تشمل holder) — core يفعل ذلك مسبقاً.
    this.bindInput(canvas);
    S.onFrame((dt, t) => this.update(dt, t));
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();
    // إيقاف الرسم حين لا يُرى المشهد (تحت قسم المتجر)
    const watch = [this.o.heroEl, this.o.shopEl].filter(Boolean);
    if ('IntersectionObserver' in window) {
      const vis = new Map();
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => vis.set(e.target, e.isIntersecting));
        const on = [...vis.values()].some(Boolean);
        if (on !== this.active) { this.active = on; on ? S.start() : S.stop(); }
      }, { threshold: 0 });
      watch.forEach((el) => io.observe(el));
    }
    S.warm(this.bottles.flatMap((b) => [b.holder, b.shadow, b.mirror.root]));
    S.start();
    return this;
  }

  /* ---------------------------------------------------------------- مدخلات */
  bindInput(canvas) {
    const stepTo = (d) => this.goStep(this.step + d);
    // --- الهيرو: سكرول واحد = وقفة
    let lastWheel = 0, consumed = true, owned = false;
    window.addEventListener('wheel', (e) => {
      const now = performance.now(), fresh = now - lastWheel > 110; lastWheel = now;
      if (fresh) { consumed = false; owned = false; }
      if (e.ctrlKey || e.defaultPrevented) return;
      const adx = Math.abs(e.deltaX), ady = Math.abs(e.deltaY);
      // رف العطور: سحب أفقي بالتراك باد
      if (this.shopT > 0.85 && adx > ady && adx > 2) { this.focusTarget = clamp(Math.round(this.focusTarget + Math.sign(e.deltaX)), 0, this.bottles.length - 1); e.preventDefault(); return; }
      let dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (Math.abs(dy) < 2) return;
      if (window.scrollY > 2 || this.o.locked?.()) { consumed = true; return; }
      const down = dy > 0;
      if (this.busy()) { e.preventDefault(); owned = true; consumed = true; return; }
      if (!owned) {
        if ((down && this.step >= LAST) || (!down && this.step <= 0)) { consumed = true; return; }
        owned = true;
      }
      e.preventDefault();
      if (consumed) return;
      consumed = true; stepTo(down ? 1 : -1);
    }, { passive: false });

    let tY = 0, tX = 0, tTop = false, tDone = false;
    window.addEventListener('touchstart', (e) => { const t = e.touches[0]; tY = t.clientY; tX = t.clientX; tTop = window.scrollY <= 2; tDone = false; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!tTop || e.touches.length > 1 || window.scrollY > 2 || this.o.locked?.()) return;
      const t = e.touches[0], dy = tY - t.clientY, dx = tX - t.clientX;
      if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(dx)) return;
      const down = dy > 0;
      if (this.busy()) { if (e.cancelable) e.preventDefault(); tDone = true; return; }
      if (!tDone && ((down && this.step >= LAST) || (!down && this.step <= 0))) return;
      if (e.cancelable) e.preventDefault();
      if (!tDone && Math.abs(dy) > 26) { tDone = true; stepTo(down ? 1 : -1); }
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || this.o.locked?.()) return;
      const tg = e.target && e.target.tagName;
      if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || tg === 'BUTTON' || tg === 'A') return;
      const k = e.key;
      if (this.shopT > 0.85) {
        if (k === 'ArrowRight') { this.focusTarget = clamp(Math.round(this.focusTarget) + 1, 0, 5); e.preventDefault(); }
        else if (k === 'ArrowLeft') { this.focusTarget = clamp(Math.round(this.focusTarget) - 1, 0, 5); e.preventDefault(); }
        else if (k === 's' || k === 'S') { this.sprayFocused(); }
        return;
      }
      if (window.scrollY > 2) return;
      const down = k === 'ArrowDown' || k === 'PageDown' || k === ' ', up = k === 'ArrowUp' || k === 'PageUp';
      if (!down && !up) return;
      if (!this.busy() && ((down && this.step >= LAST) || (up && this.step <= 0))) return;
      e.preventDefault();
      if (!this.busy()) stepTo(down ? 1 : -1);
    });

    // --- المؤشر: تحويم / سحب / نقر على الزجاجات
    const toNdc = (e) => { const r = canvas.getBoundingClientRect(); this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    const pick = () => {
      this.ray.setFromCamera(this.pointer, this.stage.camera);
      let best = -1, bd = 1e9;
      this.bottles.forEach((b, i) => {
        if (!b.holder.visible) return;
        const h = this.ray.intersectObject(b.hit, false);
        if (h.length && h[0].distance < bd) { bd = h[0].distance; best = i; }
      });
      return best;
    };
    const near = (e) => {
      // هل المؤشر فوق مجسّم شاشة فعلي؟ (الأقسام الشفافة تُمرّر الأحداث للكانفس)
      return true;
    };
    void near;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      if (this.shopT < 0.8) { this.lookTgt.set(((e.clientX / innerWidth) - 0.5) * 2, ((e.clientY / innerHeight) - 0.5) * 2); }
      else this.lookTgt.set(((e.clientX / innerWidth) - 0.5) * 2, ((e.clientY / innerHeight) - 0.5) * 2);
      if (this.drag) return;
      if (!e.target || e.target.id !== 'gl') { if (this.hover !== -1) { this.hover = -1; this.o.onHover && this.o.onHover(null); } return; }
      toNdc(e);
      if (this.shopT < 0.8) { const was = this.hover; this.hover = -1; if (was !== -1) this.o.onHover && this.o.onHover(null); return; }
      const i = pick();
      if (i !== this.hover) {
        this.hover = i;
        if (i >= 0 && i !== Math.round(this.focus)) this.o.sfx && this.o.sfx.tick();
        this.o.onHover && this.o.onHover(i < 0 ? 'drag' : (i === Math.round(this.focus) ? 'rotate' : 'select'));
      }
    }, { passive: true });
    canvas.addEventListener('pointerdown', (e) => {
      if (this.shopT < 0.8) return;
      toNdc(e);
      const i = pick();
      this.drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, i, moved: false, mode: i === Math.round(this.focus) ? 'rotate' : 'pan', t: performance.now(), v: 0, f0: this.focus };
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      const d = this.drag; if (!d) return;
      const dx = e.clientX - d.x; d.x = e.clientX; d.y = e.clientY;
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 7) d.moved = true;
      if (!d.moved) return;
      const now = performance.now(), dtm = Math.max(1, now - d.t); d.t = now;
      if (d.mode === 'rotate') { this.userYaw += dx * 0.011; this.userVel = clamp(lerp(this.userVel, (dx * 0.011) / (dtm / 1000), 0.4), -5, 5); }
      else {
        const unit = Math.min(innerWidth, 1400) * 0.34;      // بكسل لكل زجاجة تقريباً
        this.focus = clamp(this.focus - dx / unit, -0.25, this.bottles.length - 0.75);
        this.focusTarget = this.focus; d.v = lerp(d.v, (-dx / unit) / (dtm / 1000), 0.5);
      }
    });
    const end = (e) => {
      const d = this.drag; if (!d) return; this.drag = null;
      if (!d.moved) {
        // نقر
        if (d.i >= 0) {
          if (d.i !== Math.round(this.focus)) { this.focusTarget = d.i; this.o.sfx && this.o.sfx.clink(1); }
          else this.sprayFocused();
        }
        return;
      }
      if (d.mode === 'pan') {
        const projected = this.focus + clamp(d.v, -9, 9) * 0.11;
        this.focusTarget = clamp(Math.round(projected), 0, this.bottles.length - 1);
      }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  /* ---------------------------------------------------------------- الوقفات */
  busy() { return !!this.anim || document.body.classList.contains('is-loading'); }
  goStep(i, instant) {
    i = clamp(i, 0, LAST);
    if (i === this.step && !this.anim) return;
    const from = this.pos; this.step = i;
    if (instant || this.reduce) { this.anim = null; this.pos = i; this.o.onStep && this.o.onStep(this.step, this.pos); return; }
    const dist = Math.abs(i - from);
    this.anim = { from, to: i, t0: performance.now(), dur: DUR + 700 * Math.max(0, dist - 1) };
    this.o.sfx && this.o.sfx.whoosh();
    this.o.onStep && this.o.onStep(this.step, this.pos);
  }

  /* ---------------------------------------------------------------- تمرير الصفحة */
  onScroll() {
    const vh = window.innerHeight;
    this.shopT = smooth(clamp(window.scrollY / (vh * 0.9), 0, 1));
    this.o.onShopT && this.o.onShopT(this.shopT);
  }

  /* ---------------------------------------------------------------- رذاذ */
  sprayAt(i) {
    const b = this.bottles[i]; if (!b) return;
    const S = this.stage;
    const info = b.info;
    const p = this._tmp.a.set(0, info.nozzleY + 0.22, 0);
    info.group.localToWorld(p);
    const dir = this._tmp.b.set(0.08, 0.42, 0.9).normalize();
    // اتجاه الرذاذ نحو الكاميرا مع ميلان بحسب دوران الزجاجة
    dir.applyAxisAngle(new V3(0, 1, 0), (Math.sin(performance.now() * 0.001) * 0.3));
    S.spray(p, dir, MOODS[SCENTS[i]].mist, 170);
    this.mood.boostKick = 1;
    this.o.sfx && this.o.sfx.spray();
    // موضع الرذاذ على الشاشة للكلمات
    const sp = p.clone().add(new V3(0.5, 0.5, 0.9)).project(S.camera);
    const pt = { x: (sp.x * 0.5 + 0.5) * innerWidth, y: (-sp.y * 0.5 + 0.5) * innerHeight };
    this.o.onSpray && this.o.onSpray(i, pt);
    // انتفاضة صغيرة للزجاجة
    b.pop = 1;
  }
  sprayFocused() { this.sprayAt(clamp(Math.round(this.focus), 0, this.bottles.length - 1)); }

  /* ---------------------------------------------------------------- واجهة عامة */
  intro() { this.introStart = performance.now(); this.mood.boostKick = 1.2; this.o.sfx && this.o.sfx.whoosh(); }
  setFocus(i) { this.focusTarget = clamp(i, 0, this.bottles.length - 1); }
  setEngraving(name) { this.bottles.forEach((b) => setEngraving(b.info, name)); }
  flyPoint(i) {
    // موضع الزجاجة على الشاشة (لحركة الطيران إلى الحقيبة)
    const b = this.bottles[i]; const p = new V3(0, b.info.height * 0.5 * b.holder.scale.y, 0); b.holder.localToWorld(p); p.project(this.stage.camera);
    return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
  }
  focusIndex() { return clamp(Math.round(this.focus), 0, this.bottles.length - 1); }

  /* ---------------------------------------------------------------- كل إطار */
  update(dt, time) {
    const S = this.stage, cam = S.camera, mobile = this.mobile;
    // 1) حركة الوقفات
    if (this.anim) {
      const t = Math.min(1, (performance.now() - this.anim.t0) / this.anim.dur);
      const prevStep = Math.floor(this.pos + 1e-4);
      this.pos = t >= 1 ? this.anim.to : this.anim.from + (this.anim.to - this.anim.from) * ease(t);
      if (t >= 1) {
        this.anim = null;
        if (this.step === 3 && this.shopT < 0.2) this.sprayAt(0);
        this.o.onStep && this.o.onStep(this.step, this.pos, true);
      }
      void prevStep;
    }
    const st = this.shopT;
    // مقدمة: الزجاجة تهبط على المنصة والكاميرا تقترب
    const ik = this.introStart === null ? 0 : ease(clamp((performance.now() - this.introStart) / 2800, 0, 1));
    const iv = (1 - ik) * (1 - st);
    // 2) التركيز على الرف (نابض) — في الهيرو يعود للأولى
    if (st < 0.6 && !this.drag) this.focusTarget = 0;
    if (!this.drag) this.focus += (this.focusTarget - this.focus) * (1 - Math.exp(-dt * 6.5));
    const fi = this.focusIndex();
    if (fi !== this.lastFocus && st > 0.5) { this.lastFocus = fi; this.o.onFocus && this.o.onFocus(fi); }
    if (st <= 0.5 && this.lastFocus !== 0) { this.lastFocus = 0; this.o.onFocus && this.o.onFocus(0); }
    // 3) الوقفة الحالية (استيفاء)
    const seg = clamp(Math.floor(this.pos), 0, LAST - 1), u = clamp(this.pos - seg, 0, 1);
    const A = HERO[seg], B = HERO[seg + 1];
    const mixv = (a, b) => a + (b - a) * u;
    const h = {
      lift: mixv(A.lift, B.lift), yaw: mixv(A.yaw, B.yaw), cap: mixv(A.cap, B.cap), boost: mixv(A.boost, B.boost),
      cam: [mixv(A.cam[0], B.cam[0]), mixv(A.cam[1], B.cam[1]), mixv(A.cam[2], B.cam[2])],
      tgt: [mixv(A.tgt[0], B.tgt[0]), mixv(A.tgt[1], B.tgt[1]), mixv(A.tgt[2], B.tgt[2])]
    };
    // 4) الزجاجات
    const n = this.bottles.length;
    const rotating = this.drag && this.drag.mode === 'rotate' && this.drag.moved;
    if (!rotating) { this.userYaw += this.userVel * dt; this.userVel *= Math.exp(-dt * 3.2); this.userYaw *= Math.exp(-dt * 0.3); } else this.userVel *= Math.exp(-dt * 6);
    const hoverIdx = this.hover;
    this.bottles.forEach((b, i) => {
      const d = i - this.focus;
      const close = clamp(1 - Math.abs(d), 0, 1);
      // الهيرو: زجاجة الجمر فقط؛ الباقي يظهر مع الانتقال للمتجر
      const show = i === 0 ? 1 : smooth(clamp((st - 0.25) / 0.6, 0, 1));
      b.holder.visible = show > 0.01;
      const sc = (i === 0 ? lerp(1, lerp(0.7, 1, close), st) : lerp(0.7, 1, close)) * b.norm * lerp(0.2, 1, show);
      b.holder.scale.setScalar(sc);
      const x = d * SPACING;
      const z = -(1 - close) * 1.1 * st;
      // نقاط الفيزياء: تسارع x
      const vx = (x - b.px) / Math.max(dt, 1e-3); const ax = (vx - b.pvx) / Math.max(dt, 1e-3);
      b.px = x; b.pvx = vx; b.ax = lerp(b.ax, ax, 0.35);
      b.holder.position.set(x, 0, z);
      b.shadow.position.set(x, 0.006, z); b.shadow.scale.setScalar(b.info.radius * 2.6 * sc);
      b.shadow.visible = b.holder.visible;
      // ميلان نابضي
      const tTarget = clamp(-b.ax * 0.0016, -0.1, 0.1);
      b.tiltVel += ((tTarget - b.tilt) * 70 - b.tiltVel * 5) * dt; b.tilt += b.tiltVel * dt;
      // ارتجاج السائل (ميل سطح السائل مع تسارع الرف)
      const sTargetX = clamp(b.ax * 0.0011, -0.55, 0.55);
      b.svx += ((sTargetX - b.sx) * 85 - b.svx * 2.6) * dt; b.sx += b.svx * dt;
      b.svz += ((0 - b.sz) * 85 - b.svz * 2.6) * dt; b.sz += b.svz * dt;
      // تحويم: ارتفاع طفيف + وهج
      b.hover += ((hoverIdx === i && st > 0.8 ? 1 : 0) - b.hover) * (1 - Math.exp(-dt * 8));
      b.pop = Math.max(0, b.pop - dt * 3);
      b.capLift += (((i === 0 ? h.cap * (1 - st) : 0) + (b.pop > 0 ? Math.sin(Math.min(1, (1 - b.pop) * 1.4) * Math.PI) * 0.0 : 0)) - b.capLift) * (1 - Math.exp(-dt * 9));
      const idle = Math.sin(time * 0.55 + b.idle) * 0.28;
      let yaw, lift = 0;
      if (i === 0) {
        yaw = lerp(h.yaw, 0.38 + idle + (this.focusIndex() === 0 ? this.userYaw : 0), st);
        lift = lerp(h.lift, 0, st) + iv * 1.5 * (1 - 0);
      } else {
        yaw = -d * 0.28 + 0.2 + idle * 0.5 + (i === this.focusIndex() ? this.userYaw : 0);
      }
      const bob = Math.sin(time * 1.3 + b.idle) * 0.012 + b.hover * 0.07 + Math.sin(Math.min(1, 1 - b.pop) * Math.PI) * b.pop * 0.12;
      const g = b.info.group;
      g.position.y = lift + bob;
      g.rotation.set(0, yaw, 0);
      b.holder.rotation.z = b.tilt;
      // الغطاء
      b.info.cap.position.y = b.info.capHome + b.capLift * b.info.capLift;
      b.info.cap.rotation.y = b.capLift * 1.6;
      // سائل: مستوى السطح ضمن فضاء الزجاجة
      const lm = b.info.liquid.material;
      if (lm && lm.uniforms) {
        const m = this._tmp.m, q = this._tmp.q;
        g.updateWorldMatrix(true, false);
        m.copy(g.matrixWorld);
        q.setFromRotationMatrix(m).invert();
        const nWorld = this._tmp.c.set(b.sx, 1, b.sz).normalize().applyQuaternion(q);
        lm.uniforms.uPlaneN.value.copy(nWorld);
        lm.uniforms.uTime.value = time;
        lm.uniforms.uBacklight.value = 0.35 + 0.4 * (i === 0 ? st < 0.5 ? h.boost : 0.3 : 0.3) + b.hover * 0.3;
      }
    });
    // 5) الكاميرا
    const shopCam = { cam: [0, 1.7, 11.2], tgt: [0, 1.0, 0] };
    const k = st;
    const cp = [lerp(h.cam[0], shopCam.cam[0], k), lerp(h.cam[1], shopCam.cam[1], k), lerp(h.cam[2], shopCam.cam[2], k) + iv * 3.2];
    const ct = [lerp(h.tgt[0], shopCam.tgt[0], k), lerp(h.tgt[1], shopCam.tgt[1], k), lerp(h.tgt[2], shopCam.tgt[2], k)];
    // موضع الزجاجة على الشاشة
    const hero = mobile ? { x: 0.5, y: 0.37 } : { x: 0.66, y: 0.5 };
    const shop = mobile ? { x: 0.5, y: 0.31 } : { x: 0.31, y: 0.55 };
    const sx = lerp(hero.x, shop.x, k), sy = lerp(hero.y, shop.y, k);
    this.lookMix.lerp(this.lookTgt, 1 - Math.exp(-dt * 3));
    // شاشات عمودية (موبايل): نبعد الكاميرا ليبقى عرض الزجاجة مناسباً
    const pf = Math.max(1, 0.78 / cam.aspect);
    cp[0] = ct[0] + (cp[0] - ct[0]) * pf; cp[1] = ct[1] + (cp[1] - ct[1]) * pf; cp[2] = ct[2] + (cp[2] - ct[2]) * pf;
    cam.position.set(cp[0] + this.lookMix.x * 0.35, cp[1] - this.lookMix.y * 0.18, cp[2]);
    const tgt = this._tmp.a.set(ct[0], ct[1], ct[2]);
    cam.lookAt(tgt);
    const dist = cam.position.distanceTo(tgt), vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), vw = vh * cam.aspect;
    cam.updateMatrixWorld();
    const right = this._tmp.b.setFromMatrixColumn(cam.matrixWorld, 0), up = this._tmp.c.setFromMatrixColumn(cam.matrixWorld, 1);
    const shiftR = (0.5 - sx) * vw, shiftU = -(0.5 - sy) * vh;
    cam.position.addScaledVector(right, shiftR).addScaledVector(up, shiftU);
    cam.lookAt(tgt.addScaledVector(right, shiftR).addScaledVector(up, shiftU));
    // 6) المزاج: أوزان العطور
    const w = this.mood.w; w.fill(0);
    const f = clamp(this.focus, 0, n - 1);
    const lo = Math.floor(f), fr = f - lo;
    w[lo] += 1 - fr; if (lo + 1 < n) w[lo + 1] += fr;
    // في الهيرو دائماً جمر
    for (let i = 0; i < 6; i++) w[i] = i === 0 ? lerp(1, w[0], st) : w[i] * st;
    this.mood.boostKick = Math.max(0, this.mood.boostKick - dt * 0.9);
    const boost = lerp(h.boost, 0.25, st) + this.mood.boostKick * 0.9 + iv * 0.5;
    S.setMood(w, boost);
    // موضع الوهج على الشاشة
    S.mood.focus.set(sx, 1 - sy);
    // إضاءة تحت الزجاجة تتبع الهيرو
    S.under.intensity = 5 + boost * 7;
    S.under.position.set(0, 0.6 + (this.pos > 0.5 ? h.lift * (1 - st) : 0), 0.3);
    S.pool.material.opacity = 0.22 + boost * 0.22;
    S.pool.position.x = this.bottles[0].holder.position.x;
    if (this.o.onMood) this.o.onMood(w);
    this.o.onFrame && this.o.onFrame(dt, time);
  }
}
