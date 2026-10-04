/*
  كل الشيدرات (GLSL) هنا:
   - backdrop: جو كامل لكل عطر (نار، دخان أسود بذهب، ورد وبوكيه، أشعة عسل، ليل أزرق بنجوم، كثبان)
   - liquid: السائل داخل الزجاجة مع سطح مائل (ارتجاج) يقصّه مستوٍ ويُغلق من الداخل
   - particles: جمر / شرر / بتلات / غبار / يراعات / رمل (كلها تُحسب على كرت الشاشة)
   - mist: رذاذ البخّاخ
*/

export const COMMON = /* glsl */`
float hash11(float p){ p = fract(p*.1031); p *= p+33.33; p *= p+p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  float a=hash21(i), b=hash21(i+vec2(1.,0.)), c=hash21(i+vec2(0.,1.)), d=hash21(i+vec2(1.,1.));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<5;i++){ v+=a*vnoise(p); p=m*p; a*=.5; } return v; }
float fbm3(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<3;i++){ v+=a*vnoise(p); p=m*p; a*=.5; } return v; }
`;

export const BACKDROP_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

export const BACKDROP_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform vec3 uWA;      // وزن: ember, noir, rose
uniform vec3 uWB;      // وزن: veil, musk, dunes
uniform float uBoost;  // وهج إضافي (إشعال/رذاذ)
uniform vec2 uFocus;   // موضع الزجاجة على الشاشة (0..1)
${COMMON}

vec3 fireRamp(float f){
  vec3 c = vec3(0.);
  c = mix(c, vec3(.42,.035,.0), smoothstep(.0,.35,f));
  c = mix(c, vec3(.98,.34,.02), smoothstep(.3,.7,f));
  c = mix(c, vec3(1.,.74,.22), smoothstep(.65,1.,f));
  c = mix(c, vec3(1.,.93,.66), smoothstep(1.,1.5,f));
  return c;
}
float flame(vec2 p, vec2 base, float w, float h, float t, float seed){
  vec2 q = (p-base)/vec2(w,h);
  float h01 = clamp(q.y,0.,1.);
  float n1 = fbm3(vec2(q.x*1.6+seed, q.y*1.4 - t*.85));
  float n2 = fbm3(vec2(q.x*3.4-seed, q.y*2.6 - t*1.7));
  float width = pow(1.-h01, .85)*1.05;
  float d = abs(q.x + (n1-.5)*1.15*h01);
  float f = smoothstep(width, width*.12, d);
  f *= smoothstep(1.02,.1,q.y) * smoothstep(-.12,.08,q.y);
  f *= .45 + n2*1.05;
  return f;
}

vec3 sEmber(vec2 p, float t){
  vec3 col = mix(vec3(.018,.01,.008), vec3(.1,.03,.012), smoothstep(1.2,-.9,p.y));
  float g = exp(-length(p*vec2(.65,1.1)-vec2(0.,-.75))*1.55);
  col += vec3(.55,.16,.03)*g*.85;
  float f = 0.;
  f += flame(p, vec2(-.78*uAspect*.52,-.62), .5, 1.25, t, 1.3);
  f += flame(p, vec2(-.38*uAspect*.5,-.66), .36, 1.0, t*1.1+3., 7.1)*.85;
  f += flame(p, vec2(.8*uAspect*.5,-.62), .52, 1.2, t*.93+9., 4.4);
  f += flame(p, vec2(.4*uAspect*.5,-.66), .36, .95, t*1.07+5., 11.2)*.85;
  f *= 1.0 + .3*uBoost;
  col += fireRamp(min(f,1.28))*1.0;
  // دخان خفيف
  float sm = fbm(p*1.5+vec2(t*.04,-t*.07));
  col += vec3(.1,.05,.03)*smoothstep(.45,.85,sm)*.35*smoothstep(-.8,.7,p.y);
  return col;
}

vec3 sNoir(vec2 p, float t){
  vec2 s = p*1.15;
  float n = fbm(s*1.25 + vec2(t*.045,-t*.06) + fbm(s*2.1 - t*.05)*.9);
  float smoke = smoothstep(.32,.9,n);
  vec3 col = vec3(.008,.008,.011) + vec3(.045,.042,.04)*smoke;
  float e = fwidth(n)*38.;
  col += vec3(.95,.7,.28)*smoothstep(.15,1.,e)*smoothstep(.3,.7,n)*.26;
  // مخروط ضوء علوي
  float cone = smoothstep(.75,.0,abs(p.x-.1)-(p.y+1.)*.0 ) * smoothstep(-1.1,.9,p.y);
  col += vec3(.2,.16,.1)*cone*.22;
  // رقائق ذهب
  vec2 gp = p*vec2(14.,9.)+vec2(0.,-t*.12);
  vec2 id = floor(gp); float hh = hash21(id);
  float fl = step(.965,hh)*smoothstep(.5,.0,length(fract(gp)-.5+ (hash22(id)-.5)*.4));
  col += vec3(1.,.8,.4)*fl*(.5+.5*sin(t*2.+hh*40.))*.9;
  return col;
}

vec3 sRose(vec2 p, float t){
  vec3 col = mix(vec3(.2,.025,.06), vec3(.06,.008,.03), smoothstep(-.8,1.,p.y));
  col += vec3(.45,.07,.14)*exp(-length(p-vec2(.0,-.1))*1.1)*.7;
  // بوكيه
  for(int L=0; L<3; L++){
    float fl = float(L);
    float sc = 3.2 + fl*2.6;
    vec2 gp = p*sc + vec2(fl*7.3, -t*(.05+fl*.03)*sc*.35);
    vec2 id = floor(gp); vec2 f = fract(gp)-.5;
    vec2 j = (hash22(id+fl*13.)-.5)*.5;
    float rad = .16 + hash21(id+3.7)*.2;
    float d = length(f-j);
    float on = step(.45, hash21(id+fl*5.));
    float disc = smoothstep(rad, rad*.55, d) * .5 + smoothstep(rad, rad*.9, d)*smoothstep(rad*.7, rad, d)*.5;
    vec3 bc = mix(vec3(1.,.42,.5), vec3(1.,.75,.55), hash21(id+9.));
    col += bc*disc*on*(.22-.05*fl);
  }
  return col;
}

vec3 sVeil(vec2 p, float t){
  vec3 col = mix(vec3(.2,.1,.02), vec3(.045,.02,.008), smoothstep(-.9,1.,p.y));
  vec2 o = vec2(-.55*uAspect*.6, 1.25);
  vec2 d = p-o; float ang = atan(d.y,d.x);
  float r1 = vnoise(vec2(ang*11.+t*.06, t*.12));
  float r2 = vnoise(vec2(ang*23.-t*.08, 3.7));
  float rays = pow(clamp(r1*.7+r2*.5,0.,1.), 2.4);
  float fall = exp(-length(d)*.62);
  col += vec3(1.,.66,.24)*rays*fall*1.35;
  col += vec3(.95,.5,.12)*exp(-length(p-vec2(.15,-.35))*1.25)*.38;
  return col;
}

vec3 sMusk(vec2 p, float t){
  vec3 col = mix(vec3(.01,.045,.12), vec3(.003,.008,.03), smoothstep(-.8,1.1,p.y));
  col += vec3(.03,.1,.17)*exp(-abs(p.y+.55)*2.6)*.85;
  vec2 mp = vec2(.62*uAspect*.5,.5);
  float md = length(p-mp);
  col += vec3(.45,.62,1.)*exp(-md*2.6)*.5;
  col += vec3(.9,.95,1.)*smoothstep(.11,.095,md)*.85;
  vec2 gp = p*vec2(46.,46.);
  vec2 id = floor(gp); float hh = hash21(id);
  float star = step(.972,hh)*smoothstep(.45,.0,length(fract(gp)-.5-(hash22(id)-.5)*.5));
  col += vec3(.75,.85,1.)*star*(.4+.6*sin(t*(1.+hh*3.)+hh*60.))*smoothstep(-.6,.3,p.y)*1.1;
  float fg = fbm(vec2(p.x*1.2+t*.03, p.y*3.4));
  col += vec3(.04,.16,.24)*smoothstep(.4,.9,fg)*exp(-abs(p.y+.45)*2.)*.7;
  return col;
}

vec3 sDunes(vec2 p, float t){
  float h = smoothstep(-.7,.55,p.y);
  vec3 sky = mix(vec3(1.,.5,.15), vec3(.62,.2,.12), smoothstep(-.35,.15,p.y));
  sky = mix(sky, vec3(.08,.035,.06), smoothstep(.0,1.15,p.y));
  vec3 col = sky*.8;
  vec2 sp = vec2(.35*uAspect*.5,-.18);
  float sd = length(p-sp);
  col += vec3(1.,.62,.2)*exp(-sd*2.1)*.65 + vec3(1.,.9,.6)*smoothstep(.12,.1,sd);
  // كثبان
  float r1 = -.38 + sin(p.x*1.15+.7)*.13 + sin(p.x*2.7+1.3)*.045;
  float r2 = -.58 + sin(p.x*1.0-1.1)*.12 + sin(p.x*2.2+.4)*.05;
  float m1 = smoothstep(.012,-.012,p.y-r1);
  float m2 = smoothstep(.012,-.012,p.y-r2);
  float lit1 = smoothstep(.0,.2, sin(p.x*1.15+.7+1.4)*.5+.5);
  vec3 far = mix(vec3(.38,.12,.05), vec3(.78,.32,.1), lit1*.8);
  col = mix(col, far, m1);
  float edge = smoothstep(.03,.0,abs(p.y-r1))*m1*.0 + smoothstep(.02,.0,abs(p.y-r1))*.5;
  col += vec3(1.,.6,.2)*edge*.5*lit1;
  vec3 near = mix(vec3(.12,.04,.02), vec3(.4,.15,.06), smoothstep(.0,.25, sin(p.x*1.0-1.1+1.4)*.5+.5));
  col = mix(col, near, m2);
  col += vec3(.9,.5,.2)*smoothstep(.02,.0,abs(p.y-r2))*.35;
  col *= .85 + .3*fbm3(p*3.+t*.02);
  return col;
}

void main(){
  vec2 p = (vUv-.5)*vec2(uAspect,1.)*2.;
  float t = uTime;
  vec3 col = vec3(0.);
  if (uWA.x > .001) col += sEmber(p,t)*uWA.x;
  if (uWA.y > .001) col += sNoir(p,t)*uWA.y;
  if (uWA.z > .001) col += sRose(p,t)*uWA.z;
  if (uWB.x > .001) col += sVeil(p,t)*uWB.x;
  if (uWB.y > .001) col += sMusk(p,t)*uWB.y;
  if (uWB.z > .001) col += sDunes(p,t)*uWB.z;
  // وهج خلف الزجاجة يزيد مع uBoost
  vec2 fp = (uFocus-.5)*vec2(uAspect,1.)*2.;
  col += vec3(.9,.45,.14)*exp(-length(p-fp)*1.8)*uBoost*.45;
  // تعتيم الأطراف
  vec2 q = vUv-.5; q.x *= uAspect*.7;
  col *= 1.-.62*smoothstep(.15,.95,length(q)*1.35);
  col += (hash21(vUv*1733.+uTime)-.5)/190.;
  gl_FragColor = vec4(max(col,0.),1.);
}
`;

/* ---------------------------------------------------------------- السائل */
export const LIQUID_VERT = /* glsl */`
varying vec3 vObj;
varying vec3 vN;
varying vec3 vWorldN;
varying vec3 vView;
void main(){
  vObj = position;
  vN = normal;
  vec4 wp = modelMatrix*vec4(position,1.);
  vWorldN = normalize(mat3(modelMatrix)*normal);
  vView = normalize(cameraPosition-wp.xyz);
  gl_Position = projectionMatrix*viewMatrix*wp;
}
`;

export const LIQUID_FRAG = /* glsl */`
precision highp float;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vWorldN;
varying vec3 vView;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform vec3 uPlaneN;   // اتجاه "الأعلى" في فضاء الزجاجة
uniform vec3 uSurf;     // نقطة على سطح السائل (فضاء الزجاجة)
uniform float uYmin;
uniform float uYmax;
uniform float uTime;
uniform float uBacklight;
${COMMON}
void main(){
  float s = dot(vObj - uSurf, uPlaneN);
  if (s > 0.) discard;
  float depth = clamp(-s*1.1, 0., 1.);
  float gy = clamp((vObj.y-uYmin)/(uYmax-uYmin), 0., 1.);
  vec3 N = normalize(vWorldN);
  float fres = pow(1.-abs(dot(N,normalize(vView))), 2.2);
  vec3 col;
  if (gl_FrontFacing) {
    col = mix(uBottom, uTop, smoothstep(.0,1.,pow(gy,.8)));
    // امتصاص: أغمق في العمق وفي القاع
    col *= .5 + .5*(1.-depth*.6);
    col *= .7 + .5*smoothstep(.0,.9,gy);
    float core = pow(clamp(dot(N,normalize(vView)),0.,1.), 1.5);
    col *= .72 + .38*(1.-core);
    col += uGlow*(fres*.7 + uBacklight*.3*(1.-fres)*smoothstep(.2,1.,gy));
    float sw = fbm3(vObj.xy*5.+vec2(0.,uTime*.05));
    col *= .92 + .16*sw;
  } else {
    // سطح السائل (الوجه الداخلي المكشوف بعد القص)
    vec3 surf = mix(uTop*1.25, uGlow, .35);
    float sh = fbm3(vObj.xz*4.+uTime*.18);
    col = surf*(.85+.35*sh) + uGlow*.25;
  }
  gl_FragColor = vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---------------------------------------------------------------- جسيمات الجو */
export const PART_VERT = /* glsl */`
attribute vec4 aSeed;
uniform float uTime;
uniform float uPx;       // معامل حجم النقطة (حسب دقة الشاشة)
uniform vec3 uBox;       // حجم صندوق التوزيع
uniform vec3 uVel;       // اتجاه/مدى الحركة خلال دورة الحياة
uniform float uSpeed;
uniform float uSway;
uniform float uSize;
uniform float uFlutter;
uniform float uTwinkle;
uniform float uStreak;
uniform float uCount;    // نسبة الجسيمات الظاهرة 0..1
uniform vec3 uCenter;
varying float vAlpha;
varying float vSeed;
varying float vRot;
varying float vStreak;
void main(){
  float life = fract(aSeed.x + uTime*uSpeed*(.55+.9*aSeed.y));
  vec3 p = uCenter + (aSeed.zyw-.5)*uBox;
  p += uVel*(life-.5);
  float k = aSeed.x*6.2831;
  p.x += sin(life*6.2831*2.+k)*uSway*(.5+aSeed.w);
  p.z += cos(life*6.2831*1.5+k*1.7)*uSway*.8;
  p.y += sin(life*6.2831*3.+k*2.3)*uSway*.35*uFlutter;
  float fade = smoothstep(.0,.12,life)*smoothstep(1.,.78,life);
  float tw = 1.-uTwinkle*(.5+.5*sin(uTime*(1.5+aSeed.y*3.5)+aSeed.z*40.));
  float vis = step(aSeed.y, uCount);
  vAlpha = fade*tw*vis;
  vSeed = aSeed.w;
  vRot = aSeed.x*6.2831 + life*(2.+aSeed.y*5.)*uFlutter;
  vStreak = uStreak;
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = uSize*uPx*(.45+aSeed.y*1.1)*(10./max(.5,-mv.z));
}
`;

export const PART_FRAG = /* glsl */`
precision highp float;
varying float vAlpha;
varying float vSeed;
varying float vRot;
varying float vStreak;
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uShape;   // 0 نقطة، 1 بتلة، 2 نجمة، 3 خيط
uniform float uGlowAmt;
void main(){
  vec2 c = gl_PointCoord-.5;
  float a;
  // دوران
  float cs = cos(vRot), sn = sin(vRot);
  vec2 r = vec2(cs*c.x-sn*c.y, sn*c.x+cs*c.y);
  float dot0 = exp(-dot(c,c)*30.)+exp(-dot(c,c)*7.)*.25*uGlowAmt;
  // بتلة
  float petal = smoothstep(.5,.1, length(r*vec2(1.,2.1)+vec2(0.,r.x*r.x*-2.)))*.95;
  // نجمة (4 رؤوس)
  float star = (exp(-abs(c.x)*38.)*exp(-abs(c.y)*4.5)+exp(-abs(c.y)*38.)*exp(-abs(c.x)*4.5)) + dot0*.5;
  // خيط أفقي (رمل)
  float streak = exp(-abs(c.y)*34.)*exp(-abs(c.x)*5.5);
  float tail = exp(-abs(c.x)*24.)*smoothstep(-.08,.12,c.y)*exp(-max(c.y,0.)*6.5)*.8;
  float emb = exp(-dot(c,c)*46.) + tail + exp(-dot(c,c)*9.)*.28;
  if (uShape < .5) a = dot0;
  else if (uShape < 1.5) a = petal;
  else if (uShape < 2.5) a = star;
  else if (uShape < 3.5) a = streak;
  else a = emb;
  vec3 col = mix(uColA, uColB, vSeed);
  gl_FragColor = vec4(col*a, a*vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---------------------------------------------------------------- رذاذ */
export const MIST_VERT = /* glsl */`
attribute float aSize;
attribute float aAlpha;
attribute float aTint;
uniform float uPx;
varying float vA;
varying float vT;
void main(){
  vA = aAlpha; vT = aTint;
  vec4 mv = modelViewMatrix*vec4(position,1.);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = aSize*uPx*(10./max(.5,-mv.z));
}
`;

export const MIST_FRAG = /* glsl */`
precision highp float;
varying float vA;
varying float vT;
uniform vec3 uColor;
void main(){
  vec2 c = gl_PointCoord-.5;
  float d = dot(c,c);
  float a = exp(-d*9.)*vA;
  vec3 col = mix(uColor, vec3(1.,.95,.85), .45+.35*vT);
  gl_FragColor = vec4(col*a, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---------------------------------------------------------------- انعكاس الخلفية على المنصة */
export const FLOOR_VERT = /* glsl */`
void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }
`;
export const FLOOR_FRAG = /* glsl */`
precision highp float;
uniform sampler2D uBg;
uniform vec2 uRes;
uniform float uHorizon;
uniform float uStrength;
uniform vec3 uTint;
void main(){
  vec2 suv = gl_FragCoord.xy/uRes;
  float d = max(uHorizon-suv.y, 0.);
  vec2 r = vec2(suv.x, uHorizon + d*1.0);
  vec3 c = texture2D(uBg, r).rgb*.4 + texture2D(uBg, r+vec2(.004,.012)).rgb*.3 + texture2D(uBg, r+vec2(-.004,.024)).rgb*.3;
  c = min(c, vec3(.95));
  float fade = smoothstep(.34,.0,d);
  float edge = smoothstep(.0,.03,d);
  vec3 col = c*uTint*uStrength*fade*edge;
  gl_FragColor = vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
