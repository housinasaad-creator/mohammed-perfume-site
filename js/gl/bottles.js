/*
  ست زجاجات عطر ثلاثية الأبعاد (هندسة بالكود): زجاج حقيقي (انكسار)، سائل بسطح مائل يرتجّ،
  أغطية معدنية، ونقش ذهبي MOHAMMED (وبالعربي محمد في الخلف) + اسم الزبون إذا كتب نقشاً.
*/
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { LIQUID_VERT, LIQUID_FRAG } from './shaders.js';

const V3 = THREE.Vector3;

/* ---------------------------------------------------------------- خامات */
export function metal(hex, rough = 0.22, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color: hex, metalness: 1, roughness: rough, envMapIntensity: 1.5 }, extra));
}
function glass(opts = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xffffff, metalness: 0, roughness: opts.rough ?? 0.035, transmission: 1,
    thickness: opts.thick ?? 1.5, ior: opts.ior ?? 1.5,
    attenuationColor: new THREE.Color(opts.att ?? 0xffffff), attenuationDistance: opts.attDist ?? 7,
    clearcoat: 0.45, clearcoatRoughness: 0.03, specularIntensity: 0.85, envMapIntensity: opts.env ?? 1.05,
    dispersion: opts.disp ?? 0.12
  });
  m.userData.isGlass = true;
  return m;
}
function liquidMat(o) {
  return new THREE.ShaderMaterial({
    vertexShader: LIQUID_VERT, fragmentShader: LIQUID_FRAG, side: THREE.DoubleSide,
    uniforms: {
      uTop: { value: new THREE.Color(o.top) }, uBottom: { value: new THREE.Color(o.bottom) }, uGlow: { value: new THREE.Color(o.glow) },
      uPlaneN: { value: new V3(0, 1, 0) }, uSurf: { value: new V3(0, o.level, 0) }, uYmin: { value: o.ymin }, uYmax: { value: o.ymax },
      uTime: { value: 0 }, uBacklight: { value: 0.4 }
    }
  });
}

/* ---------------------------------------------------------------- نصوص النقش */
let fontsReady = null;
function loadFonts() {
  if (fontsReady) return fontsReady;
  const list = ['600 90px "Cormorant Garamond"', '500 60px "Cormorant Garamond"', '700 120px "Amiri"', '700 80px "Tajawal"'];
  fontsReady = Promise.all(list.map((f) => (document.fonts && document.fonts.load ? document.fonts.load(f, 'MOHAMMEDمحمد') : Promise.resolve()))).catch(() => {});
  return fontsReady;
}
function fit(g, text, maxW, size, weight, family, spacingK) {
  let sz = size;
  for (let i = 0; i < 24; i++) {
    g.font = weight + ' ' + Math.round(sz) + 'px ' + family;
    g.letterSpacing = Math.round(sz * spacingK) + 'px';
    if (g.measureText(text).width <= maxW) break;
    sz *= 0.93;
  }
  return sz;
}
function drawLabel(cv, o) {
  // o: {kind:'front'|'back'|'side', name, w, h}
  const g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const W = cv.width, H = cv.height;
  if (o.kind === 'back') {
    g.letterSpacing = '0px';
    g.font = '700 ' + Math.round(H * 0.5) + 'px Amiri, "Times New Roman", serif';
    g.fillText('محمد', W / 2, H * 0.46);
    fit(g, 'MAISON DE PARFUM', W * 0.7, H * 0.11, '500', '"Cormorant Garamond", serif', 0.14);
    g.fillText('MAISON DE PARFUM', W / 2, H * 0.84);
    return;
  }
  const hasName = !!o.name;
  const sz = fit(g, 'MOHAMMED', W * (o.narrow ? 0.7 : 0.9), H * (hasName ? 0.36 : 0.44), '600', '"Cormorant Garamond", serif', 0.07);
  g.fillText('MOHAMMED', W / 2 + sz * 0.035, H * (hasName ? 0.34 : 0.46));
  g.letterSpacing = '0px';
  // خط دقيق
  g.fillRect(W * 0.3, H * (hasName ? 0.6 : 0.72), W * 0.4, Math.max(1.5, H * 0.012));
  if (hasName) {
    fit(g, o.name, W * 0.8, H * 0.19, 'italic 500', '"Cormorant Garamond", serif', 0.02);
    g.fillText(o.name, W / 2, H * 0.78);
  } else {
    fit(g, o.sub || 'EAU DE PARFUM', W * 0.62, H * 0.12, '500', '"Cormorant Garamond", serif', 0.12);
    g.fillText(o.sub || 'EAU DE PARFUM', W / 2, H * 0.88);
  }
}
function labelMesh(geo, ink, o) {
  const cv = document.createElement('canvas'); cv.width = o.pw || 1024; cv.height = o.ph || 512;
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; tex.colorSpace = THREE.NoColorSpace;
  const mat = new THREE.MeshStandardMaterial({
    color: ink.color, metalness: ink.metal ?? 0.7, roughness: ink.rough ?? 0.32, emissive: ink.color, emissiveIntensity: ink.emi ?? 0.22, alphaMap: tex, transparent: true,
    depthWrite: false, envMapIntensity: ink.env ?? 1.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 4;
  mesh.userData.draw = () => { drawLabel(cv, o); tex.needsUpdate = true; };
  mesh.userData.opts = o;
  mesh.userData.draw();
  return mesh;
}

/* ---------------------------------------------------------------- مساعدات هندسية */
function lathe(profile, seg = 96) {
  const pts = profile.map((p) => new THREE.Vector2(p[0], p[1]));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
}
// قطاع أسطواني للنقش (يلتف حول الزجاجة الدائرية)
function arcPatch(radius, height, arc, yc) {
  const g = new THREE.CylinderGeometry(radius, radius, height, 48, 1, true, -arc / 2, arc);
  // CylinderGeometry: theta=0 عند +z، نريد المركز عند +z
  g.translate(0, yc, 0);
  return g;
}
function plane(w, h, x, y, z, rotY = 0) {
  const g = new THREE.PlaneGeometry(w, h);
  if (rotY) g.rotateY(rotY);
  g.translate(x, y, z);
  return g;
}

/* ---------------------------------------------------------------- تعريف الزجاجات */
/*
 كل نموذج يرجع {group, parts:{cap, liquid, ...}, height, capLift, nozzle:Vector3(top), labels:[...]}
 الأصل (y=0) عند قاعدة الزجاجة.
*/
const SPECS = {
  /* ---- Ember Oud: مستطيل زجاجي، سائل كهرماني، غطاء ذهبي مربع */
  ember(o) {
    const g = new THREE.Group();
    const w = 1.08, d = 0.66, h = 1.2;
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 8, 0.07), glass({ att: 0xfff4e6, attDist: 5 }));
    body.position.y = h / 2; g.add(body);
    // تجويف السائل
    const lw = w - 0.2, ld = d - 0.2, lh = h - 0.3;
    const liq = new THREE.Mesh(new RoundedBoxGeometry(lw, lh, ld, 6, 0.045).translate(0, 0.2 + lh / 2, 0), liquidMat({ top: 0xe2780f, bottom: 0x7a2605, glow: 0xff9a2e, level: 0.2 + lh * 0.84, ymin: 0.2, ymax: 0.2 + lh }));
    g.add(liq);
    // عنق + طوق + غطاء
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.14, 40), glass({ thick: 0.6 })); neck.position.y = h + 0.05; g.add(neck);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.1, 48), metal(0xf0bd61)); collar.position.y = h + 0.14; g.add(collar);
    const cap = new THREE.Group();
    const capMesh = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.58, 0.62, 5, 0.025), metal(0xf0bd61, 0.17)); capMesh.position.y = 0.3; cap.add(capMesh);
    cap.position.y = h + 0.19; g.add(cap);
    dipTube(g, 0.06, 0.2, h + 0.05);
    const front = labelMesh(plane(0.82, 0.41, 0, 0.62, d / 2 + 0.004), { color: 0xffd98a }, { kind: 'front', name: '', sub: 'EAU DE PARFUM' });
    const back = labelMesh(plane(0.7, 0.35, 0, 0.62, -d / 2 - 0.004, Math.PI), { color: 0xffd98a }, { kind: 'back' });
    g.add(front, back);
    return finish(g, { liquid: liq, cap, height: h + 0.19 + 0.6, nozzleY: h + 0.2, capLift: 0.7, labels: [front, back], radius: 0.7, mid: 0.9 });
  },

  /* ---- Cinnamon Noir: أسطوانة سوداء مطفية بأطواق ذهبية */
  noir(o) {
    const g = new THREE.Group();
    const r = 0.56, h = 1.32;
    const black = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0e, metalness: 0.15, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 1.2 });
    const body = new THREE.Mesh(lathe([[0, 0], [r - 0.06, 0], [r, 0.06], [r, h - 0.1], [r - 0.05, h - 0.03], [r - 0.12, h], [0.18, h], [0.17, h + 0.02], [0, h + 0.02]]), black);
    g.add(body);
    const gold = metal(0xf0bd61, 0.2);
    for (const y of [0.1, h - 0.14]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.006, r + 0.006, 0.05, 80, 1, true), gold); b.position.y = y; g.add(b); }
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.08, 48), gold); collar.position.y = h + 0.06; g.add(collar);
    const cap = new THREE.Group();
    const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.56, 64), new THREE.MeshPhysicalMaterial({ color: 0x08080a, metalness: 0.4, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.4 }));
    capMesh.position.y = 0.28; cap.add(capMesh);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.236, 0.236, 0.035, 64), gold); ring.position.y = 0.06; cap.add(ring);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.03, 64), gold); top.position.y = 0.575; cap.add(top);
    cap.position.y = h + 0.1; g.add(cap);
    const front = labelMesh(arcPatch(r + 0.008, 0.9, 1.0, 0.62), { color: 0xffd98a }, { kind: 'front', pw: 512, ph: 1024, narrow: true });
    // النقش عمودي: ندوّر الخامة بدل الهندسة
    front.material.alphaMap.center.set(0.5, 0.5); front.material.alphaMap.rotation = Math.PI / 2;
    const back = labelMesh(arcPatch(r + 0.008, 0.8, 0.9, 0.62).rotateY(Math.PI), { color: 0xffd98a }, { kind: 'back', pw: 512, ph: 512 });
    g.add(front, back);
    // لا سائل ظاهر: سائل وهمي للارتجاج فقط
    const liq = new THREE.Object3D(); liq.userData.dummy = true; g.add(liq);
    return finish(g, { liquid: liq, cap, height: h + 0.1 + 0.6, nozzleY: h + 0.1, capLift: 0.7, labels: [front, back], radius: 0.62, mid: 0.9 });
  },

  /* ---- Rose Saffron: كرة زجاجية وردية بغطاء ذهبي وردي */
  rose(o) {
    const g = new THREE.Group();
    const R = 0.74, rb = 0.36, cy = Math.sqrt(R * R - rb * rb);
    const a0 = Math.atan2(-cy, rb), a1 = 1.34;
    const pts = [[0, 0], [rb, 0]];
    for (let i = 0; i <= 52; i++) { const a = a0 + (a1 - a0) * (i / 52); pts.push([Math.cos(a) * R, cy + Math.sin(a) * R]); }
    const topY = cy + Math.sin(a1) * R;
    pts.push([0.16, topY + 0.04], [0.15, topY + 0.1], [0, topY + 0.1]);
    const body = new THREE.Mesh(lathe(pts, 112), glass({ color: 0xffeef0, att: 0xffd9de, attDist: 3, thick: 0.28 }));
    g.add(body);
    const Rl = R - 0.1, al0 = -1.0, al1 = 1.0, ly0 = cy + Math.sin(al0) * Rl;
    const lp = [[0, ly0], [Math.cos(al0) * Rl, ly0]];
    for (let i = 0; i <= 44; i++) { const a = al0 + (al1 - al0) * (i / 44); lp.push([Math.cos(a) * Rl, cy + Math.sin(a) * Rl]); }
    lp.push([0, cy + Math.sin(al1) * Rl]);
    const liq = new THREE.Mesh(lathe(lp, 80), liquidMat({ top: 0xe0507a, bottom: 0x8e1a2e, glow: 0xff7f8c, level: cy + 0.12, ymin: ly0, ymax: cy + Rl }));
    g.add(liq);
    const neckY = topY + 0.1;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.09, 48), metal(0xe8a58a, 0.22)); collar.position.y = neckY + 0.04; g.add(collar);
    const cap = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.31, 64, 48), metal(0xe8a58a, 0.16)); ball.position.y = 0.3; cap.add(ball);
    cap.position.y = neckY + 0.08; g.add(cap);
    dipTube(g, 0.05, ly0, neckY);
    const front = labelMesh(arcPatch(R + 0.006, 0.36, 1.15, cy), { color: 0xfff1e6, metal: 0.55, rough: 0.35, env: 1.1 }, { kind: 'front', sub: 'EAU DE PARFUM', pw: 1024, ph: 512 });
    const back = labelMesh(arcPatch(R + 0.006, 0.42, 1.0, cy).rotateY(Math.PI), { color: 0xfff1e6, metal: 0.55, rough: 0.35, env: 1.1 }, { kind: 'back' });
    g.add(front, back);
    return finish(g, { liquid: liq, cap, height: neckY + 0.08 + 0.62, nozzleY: neckY + 0.1, capLift: 0.75, labels: [front, back], radius: 0.8, mid: 0.85 });
  },

  /* ---- Amber Veil: زجاجة مدببة، سائل عسلي، غطاء بني طويل رفيع */
  veil(o) {
    const g = new THREE.Group();
    const rb = 0.56, rt = 0.4, h = 1.45;
    const outer = [[0, 0], [rb * 0.9, 0], [rb, 0.04], [rb - 0.02, 0.16], [rt + 0.01, h - 0.08], [rt - 0.05, h - 0.01], [0.17, h + 0.05], [0.16, h + 0.2], [0, h + 0.2]];
    const body = new THREE.Mesh(lathe(outer, 96), glass({ att: 0xfff2dd, attDist: 5, thick: 0.5 }));
    g.add(body);
    const inner = [[0, 0.2], [rb - 0.13, 0.2], [rb - 0.15, 0.3], [rt - 0.03, h - 0.12], [rt - 0.06, h - 0.1], [0, h - 0.1]];
    const liq = new THREE.Mesh(lathe(inner, 72), liquidMat({ top: 0xf3b238, bottom: 0xa8590c, glow: 0xffc860, level: 0.2 + (h - 0.3) * 0.78, ymin: 0.2, ymax: h - 0.1 }));
    g.add(liq);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.06, 48), metal(0xf0bd61)); collar.position.y = h + 0.23; g.add(collar);
    const cap = new THREE.Group();
    const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.95, 64), new THREE.MeshPhysicalMaterial({ color: 0x1c0e08, metalness: 0.35, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.5 }));
    capMesh.position.y = 0.475; cap.add(capMesh);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.157, 0.157, 0.04, 64), metal(0xf0bd61, 0.18)); ring.position.y = 0.04; cap.add(ring);
    cap.position.y = h + 0.26; g.add(cap);
    dipTube(g, 0.045, 0.24, h + 0.1);
    const front = labelMesh(arcPatch(rb - 0.04, 0.32, 0.78, 0.58), { color: 0x2a1204, metal: 0.2, rough: 0.5, env: 0.6 }, { kind: 'front', sub: 'EAU DE PARFUM' });
    const back = labelMesh(arcPatch(rb - 0.04, 0.36, 0.7, 0.58).rotateY(Math.PI), { color: 0x2a1204, metal: 0.2, rough: 0.5, env: 0.6 }, { kind: 'back' });
    g.add(front, back);
    return finish(g, { liquid: liq, cap, height: h + 0.26 + 0.98, nozzleY: h + 0.27, capLift: 0.9, labels: [front, back], radius: 0.6, mid: 1.05 });
  },

  /* ---- Midnight Musk: سداسية زرقاء بغطاء فضي */
  musk(o) {
    const g = new THREE.Group();
    const r = 0.66, h = 1.1;
    const hexGeo = (rt, rb, hh) => { const c = new THREE.CylinderGeometry(rt, rb, hh, 6, 1); c.rotateY(Math.PI / 6); return c; };
    const body = new THREE.Mesh(hexGeo(r, r, h), glass({ color: 0xb8ccff, att: 0x2a4aa8, attDist: 2.4, thick: 1.8 }));
    body.position.y = h / 2; g.add(body);
    const shoulder = new THREE.Mesh(hexGeo(0.28, r, 0.28), glass({ color: 0xb8ccff, att: 0x2a4aa8, attDist: 2.4, thick: 1.4 }));
    shoulder.position.y = h + 0.14; g.add(shoulder);
    const liqBody = new THREE.Mesh(hexGeo(r - 0.18, r - 0.18, h - 0.3).translate(0, 0.2 + (h - 0.3) / 2, 0), liquidMat({ top: 0x86b6f2, bottom: 0x2e5fb8, glow: 0xa6cfff, level: 0.2 + (h - 0.3) * 0.8, ymin: 0.2, ymax: h - 0.1 }));
    g.add(liqBody);
    const silver = metal(0xdfe6f0, 0.14);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.2, 48), silver); collar.position.y = h + 0.38; g.add(collar);
    const cap = new THREE.Group();
    const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.31, 0.3, 64), silver); capMesh.position.y = 0.16; cap.add(capMesh);
    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.07, 64), metal(0xf2f6ff, 0.1)); capTop.position.y = 0.34; cap.add(capTop);
    cap.position.y = h + 0.46; g.add(cap);
    dipTube(g, 0.05, 0.22, h + 0.35);
    const apothem = r * Math.cos(Math.PI / 6);
    const front = labelMesh(plane(0.74, 0.37, 0, 0.58, apothem + 0.004), { color: 0xeaf1ff, metal: 0.6, rough: 0.3, env: 1.2 }, { kind: 'front', sub: 'EAU DE PARFUM' });
    const back = labelMesh(plane(0.66, 0.33, 0, 0.58, -apothem - 0.004, Math.PI), { color: 0xeaf1ff, metal: 0.6, rough: 0.3, env: 1.2 }, { kind: 'back' });
    g.add(front, back);
    return finish(g, { liquid: liqBody, cap, height: h + 0.46 + 0.4, nozzleY: h + 0.48, capLift: 0.7, labels: [front, back], radius: 0.7, mid: 0.8 });
  },

  /* ---- Golden Dunes: زجاجة عريضة الكتفين بغطاء ذهبي مدوّر */
  dunes(o) {
    const g = new THREE.Group();
    const w = 1.32, d = 0.62, h = 1.0;
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 8, 0.075), glass({ att: 0xfff0d2, attDist: 4.5 }));
    body.position.y = h / 2; g.add(body);
    const lw = w - 0.2, ld = d - 0.2, lh = h - 0.28;
    const liq = new THREE.Mesh(new RoundedBoxGeometry(lw, lh, ld, 6, 0.045).translate(0, 0.19 + lh / 2, 0), liquidMat({ top: 0xe9a42a, bottom: 0x86500c, glow: 0xffc24a, level: 0.19 + lh * 0.78, ymin: 0.19, ymax: 0.19 + lh }));
    g.add(liq);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 48), glass({ thick: 0.6 })); neck.position.y = h + 0.04; g.add(neck);
    const gold = metal(0xeab257, 0.2);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.1, 64), gold); collar.position.y = h + 0.14; g.add(collar);
    const cap = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 40), gold); dome.scale.set(1, 0.62, 1); dome.position.y = 0.18; cap.add(dome);
    const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.1, 64), gold); lip.position.y = 0.04; cap.add(lip);
    cap.position.y = h + 0.18; g.add(cap);
    dipTube(g, 0.06, 0.2, h + 0.04);
    const front = labelMesh(plane(0.9, 0.45, 0, 0.5, d / 2 + 0.004), { color: 0xfff3d4 }, { kind: 'front', sub: 'EAU DE PARFUM' });
    const back = labelMesh(plane(0.78, 0.39, 0, 0.5, -d / 2 - 0.004, Math.PI), { color: 0xfff3d4 }, { kind: 'back' });
    g.add(front, back);
    return finish(g, { liquid: liq, cap, height: h + 0.18 + 0.4, nozzleY: h + 0.2, capLift: 0.7, labels: [front, back], radius: 0.78, mid: 0.7 });
  }
};

function dipTube(g, r, y0, y1) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.55, envMapIntensity: 1.4 }));
  t.position.y = (y0 + y1) / 2; g.add(t);
}

function finish(group, info) {
  info.group = group;
  // فوهة البخّاخ (تظهر عند رفع الغطاء)
  const nz = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.16, 20), metal(0xdadce4, 0.25));
  nz.position.y = info.nozzleY + 0.06; group.add(nz);
  const nzTip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.042, 0.05, 20), metal(0x1b1b20, 0.4));
  nzTip.position.y = info.nozzleY + 0.16; group.add(nzTip);
  info.capHome = info.cap.position.y;
  return info;
}

/* واجهة عامة */
export const INFO = new WeakMap();   // group -> info (لا نخزّنها في userData لتجنب مرجع دائري عند clone)
export const PRODUCT_IDS = ['ember', 'noir', 'rose', 'veil', 'musk', 'dunes'];

export async function buildBottle(id) {
  await loadFonts();
  const info = SPECS[id]({});
  info.id = id;
  info.liquidMat = info.liquid.material || null;
  // مفاتيح الفيزياء
  info.slosh = { nx: 0, nz: 0, vx: 0, vz: 0 };
  INFO.set(info.group, info);
  return info;
}

/* تحديث نقش الاسم على كل الزجاجات */
export function setEngraving(info, name) {
  const f = info.labels[0];
  f.userData.opts.name = name || '';
  f.userData.draw();
}
