/*
  نواة المشهد: renderer + بيئة انعكاسات (استوديو) + خلفية إجرائية لكل عطر + جسيمات الجو + الرذاذ + منصة لامعة.
*/
import * as THREE from 'three';
import { BACKDROP_VERT, BACKDROP_FRAG, PART_VERT, PART_FRAG, MIST_VERT, MIST_FRAG, FLOOR_VERT, FLOOR_FRAG } from './shaders.js';

export const SCENTS = ['ember', 'noir', 'rose', 'veil', 'musk', 'dunes'];

/* ألوان وأجواء كل عطر */
export const MOODS = {
  ember: { key: 0xffc58a, rim: 0xffb070, glow: 0xff7a1c, mist: 0xffb067, accent: '#ff8a2a' },
  noir:  { key: 0xffe2b4, rim: 0xffd28a, glow: 0xd9a441, mist: 0xe8c47a, accent: '#e2b25a' },
  rose:  { key: 0xffc8d2, rim: 0xff9db0, glow: 0xff5e86, mist: 0xff9db5, accent: '#ff7d9f' },
  veil:  { key: 0xffdc9a, rim: 0xffcc70, glow: 0xffa21f, mist: 0xffd188, accent: '#ffb23a' },
  musk:  { key: 0xcfe0ff, rim: 0x9ec4ff, glow: 0x4c86ff, mist: 0xa9ccff, accent: '#7fb0ff' },
  dunes: { key: 0xffd7a0, rim: 0xffb867, glow: 0xff9a2e, mist: 0xffd08e, accent: '#ffb54d' }
};

/* إعدادات جسيمات كل جو */
const PART = {
  ember: { box: [10, 6, 5], vel: [0.5, 6.5, 0], speed: 0.065, sway: 0.5, size: 34, flutter: 0.4, twinkle: 0.4, a: [1, .38, .06], b: [1, .72, .25], shape: 4, glow: 1, density: 0.5 },
  noir:  { box: [11, 6, 6], vel: [0.2, 1.4, 0], speed: 0.05, sway: 0.25, size: 17, flutter: 0.3, twinkle: 0.95, a: [1, .78, .36], b: [1, .92, .62], shape: 2, glow: 0.6 },
  rose:  { box: [11, 7, 6], vel: [-0.8, -6.5, 0], speed: 0.05, sway: 0.9, size: 22, flutter: 1.0, twinkle: 0.1, a: [1, .38, .52], b: [1, .7, .72], shape: 1, glow: 0 },
  veil:  { box: [11, 6, 6], vel: [0.9, 0.6, 0], speed: 0.035, sway: 0.35, size: 13, flutter: 0.3, twinkle: 0.6, a: [1, .78, .35], b: [1, .92, .65], shape: 0, glow: 1 },
  musk:  { box: [11, 6, 6], vel: [0.5, 0.4, 0], speed: 0.04, sway: 1.1, size: 15, flutter: 0.9, twinkle: 0.95, a: [.5, .74, 1], b: [.75, .9, 1], shape: 0, glow: 1 },
  dunes: { box: [13, 5, 6], vel: [11, -0.5, 0], speed: 0.1, sway: 0.15, size: 14, flutter: 0.2, twinkle: 0.0, a: [1, .74, .4], b: [1, .88, .62], shape: 3, glow: 0 }
};

export class Stage {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.mobile = !!opts.mobile;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x050403, 1);
    this.quality = { dpr: Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2), bg: this.mobile ? 0.38 : 0.55, trans: this.mobile ? 0.6 : 0.85, parts: 1, level: 0 };
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 120);
    this.scene.add(this.camera);
    this.clock = new THREE.Clock();
    this.time = 0;
    this.hooks = [];
    this.running = false;
    this.mood = { w: new Float32Array(6), boost: 0, focus: new THREE.Vector2(0.5, 0.45) };
    this.mood.w[0] = 1;

    this.buildEnv();
    this.buildBackdrop();
    this.buildLights();
    this.buildPlinth();
    this.buildParticles();
    this.buildMist();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /* ---------------------------------------------------------------- بيئة الانعكاسات */
  buildEnv() {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ color: 0x1b110b, side: THREE.BackSide })));
    const box = (w, h, pos, color, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); s.add(m);
    };
    box(7, 15, [-15, 5, 12], 0xffd9ae, 4.0);   // صندوق ضوء مفتاحي دافئ (شريط)
    box(3.2, 22, [15, 3, 5], 0xe6eeff, 4.6);       // شريط حافة بارد
    box(2.4, 22, [-10, 3, -13], 0xffc690, 9);     // شريط خلفي
    box(16, 7, [0, 17, 3], 0xffffff, 2.6);        // سقف
    box(26, 7, [0, 1, -22], 0xff7a28, 3.2);       // وهج نار خلفي (واسع وخافت)
    box(18, 9, [2, 4, 22], 0xffe3c4, 1.15);        // ضوء تعبئة أمامي (خلف الكاميرا)
    box(12, 9, [19, 5, 15], 0xffd9b0, 1.5);       // ضوء أمامي يميني
    box(5, 14, [-19, 2, 0], 0xffe0bd, 3.4);       // شريط جانبي أيسر
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pm.fromScene(s, 0.03);
    pm.dispose();
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 1.0;
  }

  /* ---------------------------------------------------------------- خلفية الجو */
  buildBackdrop() {
    const w = 512, h = 288;
    this.bgRT = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERT, fragmentShader: BACKDROP_FRAG, depthTest: false, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1.78 }, uWA: { value: new THREE.Vector3(1, 0, 0) }, uWB: { value: new THREE.Vector3() }, uBoost: { value: 0 }, uFocus: { value: new THREE.Vector2(.5, .45) } }
    });
    this.bgScene = new THREE.Scene();
    this.bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMat));
    this.bgCam = new THREE.Camera();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.bgRT.texture, depthTest: false, depthWrite: false }));
    this.quad.renderOrder = -100;
    this.quad.frustumCulled = false;
    this.quad.position.z = -60;
    this.camera.add(this.quad);
  }

  /* ---------------------------------------------------------------- إضاءة */
  buildLights() {
    this.key = new THREE.DirectionalLight(0xffc58a, 2.4); this.key.position.set(-5, 6, 7);
    this.rim = new THREE.DirectionalLight(0xffb070, 3.2); this.rim.position.set(6, 3.5, -5);
    this.under = new THREE.PointLight(0xff7a1c, 6, 7, 1.7); this.under.position.set(0, 0.7, 0.2);
    this.scene.add(this.key, this.rim, this.under);
    this.scene.add(new THREE.AmbientLight(0x1a0e08, 0.7));
  }

  /* ---------------------------------------------------------------- منصة لامعة */
  buildPlinth() {
    // أرضية عاتمة كبيرة تحت كل شيء + منصة لامعة نصف شفافة تُظهر انعكاس الزجاجات
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 43).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x010101 }));
    ground.position.set(0, -3.2, 18.6); this.scene.add(ground);
    this.plinthMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: 'varying float vZ; void main(){ vec4 w = modelMatrix*vec4(position,1.); vZ = w.z; gl_Position = projectionMatrix*viewMatrix*w; }',
      fragmentShader: 'varying float vZ; void main(){ float a = .8 + .2*smoothstep(.2, 2.8, vZ); gl_FragColor = vec4(.018,.014,.011,a); }'
    });
    this.plinth = new THREE.Mesh(new THREE.PlaneGeometry(80, 5.6).rotateX(-Math.PI / 2), this.plinthMat);
    this.plinth.position.set(0, 0, 0); this.plinth.renderOrder = 1;
    this.scene.add(this.plinth);
    this.floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { uBg: { value: this.bgRT.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uHorizon: { value: 0.5 }, uStrength: { value: 0.62 }, uTint: { value: new THREE.Color(1, 1, 1) } }
    });
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(80, 5.6).rotateX(-Math.PI / 2), this.floorMat);
    refl.position.y = 0.003; refl.renderOrder = 2; this.scene.add(refl);
    this.mirrors = [];
    const g = null; void g;
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g1 = cv.getContext('2d'); const gr = g1.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.25, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g1.fillStyle = gr; g1.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    this.pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, color: 0xff8a2a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4 }));
    this.pool.rotation.x = -Math.PI / 2; this.pool.position.y = 0.004; this.pool.scale.set(5.5, 3.6, 1); this.pool.renderOrder = 3;
    this.scene.add(this.pool);
    // ظل تلامس
    const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 128;
    const g2 = cv2.getContext('2d'); const gr2 = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr2.addColorStop(0, 'rgba(0,0,0,.9)'); gr2.addColorStop(.6, 'rgba(0,0,0,.4)'); gr2.addColorStop(1, 'rgba(0,0,0,0)');
    g2.fillStyle = gr2; g2.fillRect(0, 0, 128, 128);
    this.shadowTex = new THREE.CanvasTexture(cv2);
  }
  /* انعكاس الزجاجة على المنصة: نسخة مقلوبة بخامات رخيصة */
  addMirror(info) {
    const clone = info.group.clone(true);
    const cheap = new THREE.MeshStandardMaterial({ color: 0xfff3e0, transparent: true, opacity: 0.18, roughness: 0.1, metalness: 0, envMapIntensity: 1.2, depthWrite: false });
    const pairs = [];
    const walk = (a, b) => {
      if (b.material && b.material.userData && b.material.userData.isGlass) b.material = cheap;
      if (a === info.cap) pairs.push([a, b]);
      for (let i = 0; i < a.children.length; i++) walk(a.children[i], b.children[i]);
    };
    walk(info.group, clone);
    clone.position.set(0, 0, 0); clone.rotation.set(0, 0, 0); clone.scale.set(1, 1, 1); clone.matrixAutoUpdate = false;
    const root = new THREE.Group(); root.matrixAutoUpdate = false; root.add(clone);
    this.scene.add(root);
    const m = { info, root, clone, pairs, S: new THREE.Matrix4().makeScale(1, -1, 1) };
    this.mirrors.push(m);
    return m;
  }
  syncMirrors() {
    for (const m of this.mirrors) {
      let vis = true; for (let o = m.info.group; o; o = o.parent) if (!o.visible) { vis = false; break; }
      m.root.visible = vis;
      if (!vis) continue;
      m.info.group.updateWorldMatrix(true, false);
      m.root.matrix.copy(m.S).multiply(m.info.group.matrixWorld);
      m.root.matrixWorldNeedsUpdate = true;
      m.clone.matrix.identity(); m.clone.matrixWorldNeedsUpdate = true;
      for (const [a, b] of m.pairs) { b.position.copy(a.position); b.rotation.copy(a.rotation); b.updateMatrix(); }
    }
  }
  makeShadow(r) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false, opacity: 0.8 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.scale.set(r * 2.6, r * 2.6, 1); m.renderOrder = 1;
    return m;
  }

  /* ---------------------------------------------------------------- جسيمات الجو (طبقة لكل عطر) */
  buildParticles() {
    this.layers = {};
    const N = this.mobile ? 260 : 520;
    const seed = new Float32Array(N * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    for (const id of SCENTS) {
      const p = PART[id];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const s2 = new Float32Array(seed.length); for (let i = 0; i < s2.length; i++) s2[i] = Math.random();
      geo.setAttribute('aSeed', new THREE.BufferAttribute(s2, 4));
      const mat = new THREE.ShaderMaterial({
        vertexShader: PART_VERT, fragmentShader: PART_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 }, uPx: { value: 1 }, uBox: { value: new THREE.Vector3(...p.box) }, uVel: { value: new THREE.Vector3(...p.vel) },
          uSpeed: { value: p.speed }, uSway: { value: p.sway }, uSize: { value: p.size }, uFlutter: { value: p.flutter }, uTwinkle: { value: p.twinkle },
          uStreak: { value: p.shape === 3 ? 1 : 0 }, uCount: { value: 0 }, uCenter: { value: new THREE.Vector3(0, 2.2, -1) },
          uColA: { value: new THREE.Vector3(...p.a) }, uColB: { value: new THREE.Vector3(...p.b) }, uShape: { value: p.shape }, uGlowAmt: { value: p.glow }
        }
      });
      const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 10; pts.visible = false;
      this.scene.add(pts); this.layers[id] = pts;
    }
  }

  /* ---------------------------------------------------------------- رذاذ البخّاخ */
  buildMist() {
    const N = this.mobile ? 220 : 420;
    this.mist = { n: N, pos: new Float32Array(N * 3), vel: new Float32Array(N * 3), life: new Float32Array(N), max: new Float32Array(N), size: new Float32Array(N), alpha: new Float32Array(N), tint: new Float32Array(N), base: new Float32Array(N), next: 0 };
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.mist.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.mist.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.mist.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aTint', new THREE.BufferAttribute(this.mist.tint, 1));
    this.mistMat = new THREE.ShaderMaterial({ vertexShader: MIST_VERT, fragmentShader: MIST_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uPx: { value: 1 }, uColor: { value: new THREE.Color(0xffb067) } } });
    this.mistPts = new THREE.Points(geo, this.mistMat); this.mistPts.frustumCulled = false; this.mistPts.renderOrder = 12;
    this.scene.add(this.mistPts);
    this.mist.pos.fill(9999);
  }
  /* يطلق رذاذاً من نقطة بعالم الثلاثي الأبعاد */
  spray(origin, dir, color, count = 220) {
    const m = this.mist; this.mistMat.uniforms.uColor.value.set(color);
    for (let k = 0; k < count; k++) {
      const i = m.next; m.next = (m.next + 1) % m.n;
      const sp = 1.6 + Math.random() * 3.4;
      const cone = 0.34 + Math.random() * 0.2;
      m.pos[i * 3] = origin.x + (Math.random() - .5) * .05; m.pos[i * 3 + 1] = origin.y + Math.random() * .05; m.pos[i * 3 + 2] = origin.z + (Math.random() - .5) * .05;
      m.vel[i * 3] = (dir.x + (Math.random() - .5) * cone) * sp;
      m.vel[i * 3 + 1] = (dir.y + (Math.random() - .5) * cone * .8) * sp + .3;
      m.vel[i * 3 + 2] = (dir.z + (Math.random() - .5) * cone) * sp;
      m.life[i] = 0; m.max[i] = 1.8 + Math.random() * 2.6; m.base[i] = 0.5 + Math.random() * 1.1; m.tint[i] = Math.random();
      m.alpha[i] = 0;
    }
  }
  updateMist(dt) {
    const m = this.mist; const t = this.time;
    for (let i = 0; i < m.n; i++) {
      if (m.max[i] === 0 || m.life[i] >= m.max[i]) { m.alpha[i] = 0; m.pos[i * 3 + 1] = 9999; continue; }
      m.life[i] += dt; const u = m.life[i] / m.max[i];
      const drag = Math.exp(-dt * 2.1);
      m.vel[i * 3] *= drag; m.vel[i * 3 + 1] = m.vel[i * 3 + 1] * drag + dt * .22; m.vel[i * 3 + 2] *= drag;
      m.vel[i * 3] += Math.sin(t * 1.3 + i) * dt * .5; m.vel[i * 3 + 2] += Math.cos(t * 1.1 + i * 1.7) * dt * .4;
      m.pos[i * 3] += m.vel[i * 3] * dt; m.pos[i * 3 + 1] += m.vel[i * 3 + 1] * dt; m.pos[i * 3 + 2] += m.vel[i * 3 + 2] * dt;
      m.size[i] = (m.base[i] * (26 + u * 105));
      m.alpha[i] = Math.min(1, u * 8) * Math.pow(1 - u, 1.4) * .5;
    }
    const g = this.mistPts.geometry;
    g.attributes.position.needsUpdate = true; g.attributes.aSize.needsUpdate = true; g.attributes.aAlpha.needsUpdate = true;
  }

  /* ---------------------------------------------------------------- حجم/جودة */
  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.w = w; this.h = h;
    this.renderer.setPixelRatio(this.quality.dpr);
    this.renderer.setSize(w, h, false);
    this.renderer.transmissionResolutionScale = this.quality.trans;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    const dist = 60, vh = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * dist;
    this.quad.scale.set(vh * this.camera.aspect * 1.02, vh * 1.02, 1);
    this.bgRT.setSize(Math.max(2, Math.round(w * this.quality.bg)), Math.max(2, Math.round(h * this.quality.bg)));
    this.bgMat.uniforms.uAspect.value = w / h;
    const px = this.quality.dpr * (h / 900) * 1.0;
    for (const id of SCENTS) this.layers[id].material.uniforms.uPx.value = px;
    this.mistMat.uniforms.uPx.value = px;
    this.floorMat.uniforms.uRes.value.set(Math.round(w * this.quality.dpr), Math.round(h * this.quality.dpr));
  }
  setQuality(patch) { Object.assign(this.quality, patch); this.resize(); }

  /* ---------------------------------------------------------------- مزاج (أوزان العطور) */
  setMood(weights, boost) {
    const w = this.mood.w;
    for (let i = 0; i < 6; i++) w[i] = weights[i] || 0;
    if (boost !== undefined) this.mood.boost = boost;
  }

  /* تجميع كل الشيدرات وتحميل كل الأشياء مسبقاً كي لا يحدث تقطيع أول مرة يظهر فيها جو/زجاجة جديدة */
  warm(hiddenObjects = []) {
    const prev = [];
    for (const id of SCENTS) { prev.push([this.layers[id], this.layers[id].visible]); this.layers[id].visible = true; this.layers[id].material.uniforms.uCount.value = 0.01; }
    for (const o of hiddenObjects) { prev.push([o, o.visible]); o.visible = true; }
    try { this.renderer.compile(this.scene, this.camera); } catch (e) { /* ignore */ }
    this.renderer.render(this.scene, this.camera);
    for (const [o, v] of prev) o.visible = v;
  }

  /* ---------------------------------------------------------------- الحلقة */
  onFrame(fn) { this.hooks.push(fn); }
  start() {
    if (this.running) return; this.running = true; this.clock.getDelta();
    this.renderer.setAnimationLoop(() => this.tick());
  }
  stop() { this.running = false; this.renderer.setAnimationLoop(null); }
  tick() {
    const dt = Math.min(0.05, this.clock.getDelta()); this.time += dt;
    // حوكمة الجودة: إذا كان الإطار بطيئاً باستمرار نخفّف
    this._ema = (this._ema || 16) * 0.96 + dt * 1000 * 0.04;
    this._slow = this._ema > 24 ? (this._slow || 0) + dt : Math.max(0, (this._slow || 0) - dt * 2);
    if (this._slow > 2.2 && this.quality.level < 3) {
      this.quality.level++; this._slow = 0; this._ema = 16;
      const L = this.quality.level;
      this.setQuality({ dpr: Math.max(1, this.quality.dpr - (L === 1 ? .35 : .25)), bg: L >= 2 ? 0.3 : this.quality.bg, trans: Math.max(.45, this.quality.trans - .2) });
    }
    for (const fn of this.hooks) fn(dt, this.time);
    // مزاج
    const w = this.mood.w;
    const u = this.bgMat.uniforms;
    u.uTime.value = this.time; u.uWA.value.set(w[0], w[1], w[2]); u.uWB.value.set(w[3], w[4], w[5]); u.uBoost.value = this.mood.boost; u.uFocus.value.copy(this.mood.focus);
    for (let i = 0; i < 6; i++) {
      const L = this.layers[SCENTS[i]];
      L.visible = w[i] > 0.01; L.material.uniforms.uCount.value = w[i] * (PART[SCENTS[i]].density || 1); L.material.uniforms.uTime.value = this.time;
    }
    // ألوان الإضاءة تتبع المزاج
    const tmpK = new THREE.Color(0, 0, 0), tmpR = new THREE.Color(0, 0, 0), tmpG = new THREE.Color(0, 0, 0), c = new THREE.Color();
    for (let i = 0; i < 6; i++) { const m = MOODS[SCENTS[i]]; tmpK.add(c.set(m.key).multiplyScalar(w[i])); tmpR.add(c.set(m.rim).multiplyScalar(w[i])); tmpG.add(c.set(m.glow).multiplyScalar(w[i])); }
    this.key.color.copy(tmpK); this.rim.color.copy(tmpR); this.under.color.copy(tmpG); this.pool.material.color.copy(tmpG);
    this.updateMist(dt);
    this.syncMirrors();
    // خط أفق المنصة على الشاشة (حافتها البعيدة)
    this._hp = this._hp || new THREE.Vector3(); this._hp.set(0, 0, -2.8).project(this.camera);
    this.floorMat.uniforms.uHorizon.value = this._hp.y * 0.5 + 0.5;
    this.floorMat.uniforms.uTint.value.copy(tmpG).lerp(new THREE.Color(1, .95, .9), 0.18);
    // 1) الخلفية في هدف صغير
    const r = this.renderer;
    r.setRenderTarget(this.bgRT); r.render(this.bgScene, this.bgCam); r.setRenderTarget(null);
    // 2) المشهد
    r.render(this.scene, this.camera);
  }
}
