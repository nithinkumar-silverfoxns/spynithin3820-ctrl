/* SILVERFOXNS — Official Brand Film (60s)
 * Deterministic cinematic renderer: every frame is a pure function of time t (seconds),
 * so the film can be played live in a browser or rendered frame-accurately to video.
 */
(function () {
'use strict';

const W = 1920, H = 1080, DURATION = 60;
const BAR = 64;                       // cinematic letterbox (logical px)
const FONT_D = "'Inter Display', 'Inter', 'Helvetica Neue', Arial, sans-serif";
const FONT_T = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const FONT_M = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

// Brand palette
const C = {
  ink: '#04060a', steel: '#8d99a6', silver: '#d7dee5', white: '#f4f7fa',
  ice: '#7cc4ff', iceRGB: [124, 196, 255], silverRGB: [215, 225, 235], threatRGB: [255, 78, 64],
};

// ---------------------------------------------------------------- utilities
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const expoOut = t => { t = clamp(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
const win = (t, a, b, fin, fout) => ss(a, a + fin, t) * (1 - ss(b - fout, b, t));
function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const h = (i, j, k) => hash(i * 157 + j * 113 + k * 271);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(h(xi, yi, zi), h(xi + 1, yi, zi), u), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
           l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
}
const rgba = (c, a) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

// 3D: rotate then perspective-project. cam = {d, f, cx, cy}
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
function project(p, cam) {
  const z = p[2] + cam.d; if (z < 0.05) return null;
  const s = cam.f / z; return { x: (cam.cx ?? W / 2) + p[0] * s, y: (cam.cy ?? H / 2) + p[1] * s, s, z };
}

// ---------------------------------------------------------------- canvases
let S = 1, main, mctx, layerA, layerB, bloomC, bloomC2, grain = [], sprites = {};
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function sprite(rgb, core = 1) {
  const c = mk(64, 64), x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(255,255,255,${core})`);
  g.addColorStop(0.12, rgba(rgb, 0.95));
  g.addColorStop(0.35, rgba(rgb, 0.28));
  g.addColorStop(0.7, rgba(rgb, 0.06));
  g.addColorStop(1, rgba(rgb, 0));
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
}
function init(canvas, scale) {
  S = scale; main = canvas; main.width = W * S; main.height = H * S;
  mctx = main.getContext('2d');
  layerA = mk(W * S, H * S); layerB = mk(W * S, H * S);
  bloomC = mk(W / 4, H / 4); bloomC2 = mk(W / 4, H / 4);
  sprites.silver = sprite(C.silverRGB); sprites.ice = sprite(C.iceRGB); sprites.threat = sprite(C.threatRGB);
  sprites.white = sprite([255, 255, 255]); sprites.soft = sprite([150, 175, 200], 0.4);
  const r = rng(99);
  for (let k = 0; k < 4; k++) {
    const g = mk(256, 256), x = g.getContext('2d'), id = x.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); grain.push(g);
  }
  buildFox(); buildGlobe(); buildTunnel();
}
function glow(ctx, spr, x, y, size, a) { if (a <= 0.003) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(spr, x - size / 2, y - size / 2, size, size); }

// ---------------------------------------------------------------- typography
function setFont(ctx, weight, size, family, tracking = 0) { ctx.font = `${weight} ${size}px ${family}`; ctx.letterSpacing = `${tracking}px`; }
function silverFill(ctx, x0, x1, sweep, alpha = 1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, `rgba(178,188,198,${alpha})`);
  g.addColorStop(0.5, `rgba(226,232,238,${alpha})`);
  g.addColorStop(1, `rgba(176,186,197,${alpha})`);
  if (sweep !== undefined && sweep > -0.2 && sweep < 1.2) {
    const s = clamp(sweep, 0.02, 0.98);
    g.addColorStop(clamp(s - 0.06, 0, 1), `rgba(200,210,220,${alpha})`);
    g.addColorStop(s, `rgba(255,255,255,${alpha})`);
    g.addColorStop(clamp(s + 0.06, 0, 1), `rgba(200,210,220,${alpha})`);
  }
  return g;
}
// Per-character cinematic reveal (rise + fade), centred or left-aligned.
function revealText(ctx, str, x, y, o) {
  const { weight = 300, size = 48, family = FONT_D, tracking = 0, align = 'center', p = 1, stagger = 0.5,
          fill = C.silver, alpha = 1, rise = 18, sweep } = o;
  setFont(ctx, weight, size, family, tracking);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const total = ctx.measureText(str).width - tracking;
  const x0 = align === 'center' ? x - total / 2 : x;
  ctx.fillStyle = fill === 'silver' ? silverFill(ctx, x0, x0 + total, sweep, 1) : fill;
  const n = str.length;
  for (let i = 0; i < n; i++) {
    const ch = str[i]; if (ch === ' ') continue;
    const k = easeOut(clamp((p * (1 + stagger) - (i / n) * stagger)));
    if (k <= 0) continue;
    const cx = x0 + ctx.measureText(str.slice(0, i)).width;
    ctx.globalAlpha = alpha * k;
    ctx.fillText(ch, cx, y + (1 - k) * rise);
  }
  ctx.globalAlpha = 1;
  return total;
}
// Lower-third service caption: index, title, descriptor.
function caption(ctx, t, a, b, idx, title, sub) {
  const A = win(t, a, b, 0.6, 0.6); if (A <= 0) return;
  const x = 150, y = H - BAR - 150, p = clamp((t - a) / 1.1);
  ctx.save();
  ctx.globalAlpha = A;
  ctx.strokeStyle = rgba(C.iceRGB, 0.9 * A); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y - 52); ctx.lineTo(x + 46 * easeOut(p * 1.4), y - 52); ctx.stroke();
  setFont(ctx, 500, 15, FONT_M, 4); ctx.fillStyle = rgba(C.iceRGB, A); ctx.fillText(idx, x + 62, y - 47);
  revealText(ctx, title, x - 2, y + 8, { weight: 300, size: 58, tracking: 14, align: 'left', p, fill: 'silver', alpha: A, sweep: (t - a - 0.6) / 1.6 });
  revealText(ctx, sub, x, y + 52, { weight: 400, size: 19, family: FONT_T, tracking: 2.5, align: 'left', p: clamp((t - a - 0.45) / 1.1), fill: '#8d9aa8', alpha: A, rise: 8 });
  ctx.restore();
}

// ---------------------------------------------------------------- FOX geometry (brand mark)
// Unit-space front view of a faceted fox head, y down. Mirrored for the right half.
const FP = {
  earTip: [-0.74, -1.0], earOut: [-0.95, -0.12], earIn: [-0.28, -0.5], earMid: [-0.6, -0.38],
  crown: [0, -0.42], cheek: [-1.04, 0.12], eye: [-0.34, -0.04], bridge: [0, 0.02],
  muzzle: [-0.2, 0.56], jaw: [-0.58, 0.42], nose: [0, 0.96],
};
const FOX_FACETS = [];   // {pts:[[x,y,z]x3], tone, kind}
let FOX_PTS = [];        // particle targets [x,y,z,tone,edge]
function foxDepth(x, y) { // gives the head real volume: snout forward (-z), ears back
  const ax = Math.abs(x);
  return -0.55 * (1 - ax) * clamp(0.4 + y * 0.8, 0, 1.2) + 0.25 * clamp(-y - 0.3, 0, 1) + 0.12 * ax;
}
function buildFox() {
  const L = [
    ['earTip', 'earOut', 'earIn', 0.78, 'ear'], ['earTip', 'earMid', 'earIn', 0.18, 'inner'],
    ['earIn', 'crown', 'eye', 0.86, 'face'], ['crown', 'bridge', 'eye', 0.96, 'face'],
    ['earOut', 'earIn', 'eye', 0.62, 'face'], ['earOut', 'eye', 'cheek', 0.5, 'face'],
    ['cheek', 'eye', 'jaw', 0.72, 'face'], ['eye', 'bridge', 'muzzle', 0.9, 'face'],
    ['eye', 'muzzle', 'jaw', 0.55, 'face'], ['jaw', 'muzzle', 'nose', 0.38, 'face'],
    ['bridge', 'muzzle', 'nose', 0.8, 'face'],
  ];
  const v = (k, m) => { const p = FP[k]; const x = p[0] * m; return [x, p[1], foxDepth(x, p[1])]; };
  for (const m of [1, -1]) for (const f of L) { const pts = [v(f[0], m), v(f[1], m), v(f[2], m)]; if (f[4] === 'inner') pts.forEach(p => p[2] -= 0.06); FOX_FACETS.push({ pts, tone: f[3] * (m < 0 ? 0.86 : 1), kind: f[4] }); }
  // nose + eyes
  FOX_FACETS.push({ pts: [[-0.09, 0.85, foxDepth(0, .85) - .02], [0.09, 0.85, foxDepth(0, .85) - .02], [0, 0.97, foxDepth(0, .97) - .02]], tone: 0.08, kind: 'nose' });
  for (const m of [1, -1]) {
    const e = [[-0.47, -0.09], [-0.29, -0.14], [-0.21, -0.03], [-0.36, 0.0]].map(p => [p[0] * m, p[1], foxDepth(p[0] * m, p[1]) - 0.02]);
    FOX_FACETS.push({ pts: [e[0], e[1], e[2]], tone: 1, kind: 'eye' }, { pts: [e[0], e[2], e[3]], tone: 1, kind: 'eye' });
  }
  // particle targets: area-weighted samples on faces + dense edge samples
  const r = rng(7); const pts = [];
  const faces = FOX_FACETS.filter(f => f.kind !== 'eye');
  const area = f => { const [a, b, c] = f.pts; return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2; };
  const tot = faces.reduce((s, f) => s + area(f), 0);
  for (const f of faces) {
    const n = Math.round(3400 * area(f) / tot), [a, b, c] = f.pts;
    for (let i = 0; i < n; i++) { let u = r(), w = r(); if (u + w > 1) { u = 1 - u; w = 1 - w; }
      pts.push([a[0] + u * (b[0] - a[0]) + w * (c[0] - a[0]), a[1] + u * (b[1] - a[1]) + w * (c[1] - a[1]), a[2] + u * (b[2] - a[2]) + w * (c[2] - a[2]), f.tone, 0]); }
    for (let e = 0; e < 3; e++) { const p = f.pts[e], q = f.pts[(e + 1) % 3]; const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      for (let i = 0, n2 = Math.round(len * 70); i < n2; i++) { const k = r(); pts.push([lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k), 1, 1]); } }
  }
  for (const f of FOX_FACETS.filter(f => f.kind === 'eye')) for (let i = 0; i < 40; i++) { let u = r(), w = r(); if (u + w > 1) { u = 1 - u; w = 1 - w; } const [a, b, c] = f.pts;
    pts.push([a[0] + u * (b[0] - a[0]) + w * (c[0] - a[0]), a[1] + u * (b[1] - a[1]) + w * (c[1] - a[1]), a[2], 2, 0]); }
  // shuffle
  for (let i = pts.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
  FOX_PTS = pts.map(p => ({ p, seed: r(), dir: (() => { const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1); return [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)]; })(), rad: 2.5 + r() * 5, delay: r() }));
}
// Metallic facet shading (Blinn-Phong on silver) for a transformed facet.
function shadeFacet(pts, tone, light, kind) {
  const [a, b, c] = pts;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const nl = Math.hypot(...n) || 1; n = n.map(q => q / nl); if (n[2] > 0) n = n.map(q => -q);
  const dif = clamp(-(n[0] * light[0] + n[1] * light[1] + n[2] * light[2]));
  const h = [light[0], light[1], light[2] - 1]; const hl = Math.hypot(...h);
  const spec = Math.pow(clamp(-(n[0] * h[0] + n[1] * h[1] + n[2] * h[2]) / hl), 28);
  if (kind === 'eye') return [150, 215, 255];
  if (kind === 'nose') return [16, 20, 26];
  const base = kind === 'inner' ? 0.25 : 1;
  const k = Math.pow((0.1 + 0.75 * dif * (0.45 + 0.55 * tone)) * base, 1.25);
  return [lerp(18, 225, k) + 255 * spec * 0.9, lerp(23, 232, k) + 255 * spec * 0.9, lerp(31, 242, k) + 255 * spec * 0.9];
}
function drawFoxSolid(ctx, xf, cam, alpha, light, edgeA = 0.5, glowEyes = 1) {
  if (alpha <= 0) return;
  const items = FOX_FACETS.map(f => { const P = f.pts.map(xf); return { f, P, z: (P[0][2] + P[1][2] + P[2][2]) / 3 }; });
  items.sort((a, b) => b.z - a.z);
  ctx.save(); ctx.lineJoin = 'round';
  for (const it of items) {
    const sp = it.P.map(p => project(p, cam)); if (sp.some(q => !q)) continue;
    const col = shadeFacet(it.P, it.f.tone, light, it.f.kind);
    ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(sp[0].x, sp[0].y, (sp[1].x + sp[2].x) / 2, (sp[1].y + sp[2].y) / 2);
    g.addColorStop(0, rgba(col.map(c => Math.min(255, c * 1.12)), 1)); g.addColorStop(1, rgba(col.map(c => Math.min(255, c * 0.78)), 1));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(sp[0].x, sp[0].y); ctx.lineTo(sp[1].x, sp[1].y); ctx.lineTo(sp[2].x, sp[2].y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(col.map(c => Math.min(255, c * 0.95)), 1); ctx.lineWidth = 0.8; ctx.stroke(); // seal hairline seams
    if (edgeA > 0 && it.f.kind !== 'eye') { ctx.globalAlpha = alpha * edgeA; ctx.strokeStyle = 'rgba(235,245,255,0.55)'; ctx.lineWidth = 0.9; ctx.stroke(); }
  }
  if (glowEyes > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const m of [1, -1]) { const e = project(xf([-0.34 * m, -0.06, foxDepth(-0.34 * m, -0.06) - 0.05]), cam); if (e) glow(ctx, sprites.ice, e.x, e.y, 70 * e.s / 160, alpha * glowEyes * 0.7); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- SCENE 1 · Genesis (0 – 7.4)
const DUST = (() => { const r = rng(11); return Array.from({ length: 900 }, () => ({ x: (r() - .5) * 14, y: (r() - .5) * 8, z: 0.6 + r() * 14, vx: (r() - .5) * .06, vy: -0.02 - r() * .05, ph: r() * 6.28, b: r() })); })();
function drawDust(ctx, t, camZ, beamX, intensity = 1, f = 900) {
  ctx.globalCompositeOperation = 'lighter';
  for (const d of DUST) {
    const z = d.z - camZ; if (z < 0.25) continue;
    const x = d.x + d.vx * t + Math.sin(t * .3 + d.ph) * .08, y = d.y + d.vy * t + Math.cos(t * .25 + d.ph) * .06;
    const s = f / z, sx = W / 2 + x * s, sy = H / 2 + y * s;
    if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
    const beam = Math.exp(-Math.pow((sx - (beamX + sy * 0.55)) / 260, 2));
    const a = (0.08 + 0.75 * beam) * (0.4 + 0.6 * d.b) * intensity * clamp(1.6 - z / 10);
    if (z < 2.2) glow(ctx, sprites.soft, sx, sy, 40 * s / 300 + 30, a * 0.35);           // bokeh
    else glow(ctx, sprites.silver, sx, sy, Math.max(3, 6 * s / 120), a);
  }
  ctx.globalCompositeOperation = 'source-over';
}
function beam(ctx, x, w, a, rgb = [170, 195, 225]) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, rgba(rgb, 0)); g.addColorStop(0.5, rgba(rgb, a)); g.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(x - w * 0.25, -20); ctx.lineTo(x + w * 0.25, -20); ctx.lineTo(x + w * 1.3 + H * 0.55, H + 20); ctx.lineTo(x - w * 1.3 + H * 0.55, H + 20); ctx.fill();
  const v = ctx.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,6,10,1)');
  ctx.restore();
}
function sceneGenesis(ctx, t) {
  bg(ctx, [8, 11, 16], [2, 3, 5]);
  const flick = 0.9 + 0.1 * noise3(t * 2, 0, 0);
  beam(ctx, 520, 240, 0.075 * flick * ss(0, 2.5, t));
  beam(ctx, 760, 120, 0.04 * flick * ss(0.5, 3, t));
  drawDust(ctx, t, t * 0.35, 520, ss(0, 1.5, t));
  // opening line
  const A = win(t, 1.1, 4.6, 0.8, 0.7);
  if (A > 0) revealText(ctx, 'EVERY CONNECTION IS A DOOR.', W / 2, H / 2 + 12, { weight: 300, size: 30, tracking: 12, p: clamp((t - 1.1) / 1.6), fill: '#c9d3dc', alpha: A });
  const A2 = win(t, 3.2, 6.0, 0.6, 0.6);
  if (A2 > 0) revealText(ctx, 'WE GUARD EVERY ONE.', W / 2, H / 2 + 62, { weight: 300, size: 30, tracking: 12, p: clamp((t - 3.2) / 1.2), fill: 'silver', alpha: A2, sweep: (t - 3.6) / 1.6 });
  // spark → anamorphic flare
  const k = ss(5.4, 7.0, t);
  if (k > 0) {
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, sprites.white, W / 2, H / 2, 20 + 260 * k * k, 0.4 + 0.6 * k);
    glow(ctx, sprites.ice, W / 2, H / 2, 600 * k, 0.35 * k);
    ctx.globalAlpha = 0.85 * k; ctx.drawImage(sprites.ice, W / 2 - 1100 * k, H / 2 - 5, 2200 * k, 10);
    ctx.globalAlpha = 0.5 * k; ctx.drawImage(sprites.white, W / 2 - 700 * k, H / 2 - 2, 1400 * k, 4);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
}
function bg(ctx, c1, c2, cx = W / 2, cy = H / 2) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.75);
  g.addColorStop(0, rgba(c1, 1)); g.addColorStop(1, rgba(c2, 1));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- SCENE 2 · The Silver Fox (6.8 – 15.3)
function godRays(ctx, x, y, t, a, rgb = [150, 185, 225]) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y);
  for (let i = 0; i < 28; i++) {
    const ang = i / 28 * Math.PI * 2 + t * 0.03 + hash(i) * 0.2, len = 900 + hash(i + 3) * 500, wd = 0.02 + hash(i + 9) * 0.035;
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
    const ai = a * (0.25 + 0.75 * hash(i + 17)) * (0.7 + 0.3 * Math.sin(t * 0.8 + i));
    g.addColorStop(0, rgba(rgb, 0.0)); g.addColorStop(0.15, rgba(rgb, ai * 0.12)); g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang - wd) * len, Math.sin(ang - wd) * len); ctx.lineTo(Math.cos(ang + wd) * len, Math.sin(ang + wd) * len); ctx.fill();
  }
  ctx.restore();
}
function sceneFox(ctx, T) {
  const t = T - 6.8;
  bg(ctx, [14, 20, 30], [3, 4, 7], W / 2, H / 2 - 40);
  const R = 2.25, cam = { d: lerp(9.5, 6.6, easeInOut(t / 8.5)), f: 1000, cy: H / 2 + 10 };
  const yaw = lerp(-0.55, 0.12, easeInOut(t / 8.2)) + 0.03 * Math.sin(t * 0.7), pitch = lerp(0.12, -0.03, easeInOut(t / 8));
  const xf = p => rotX(rotY([p[0] * R, p[1] * R, p[2] * R], yaw), pitch);
  // backlight + rays
  const back = ss(2.0, 5.5, t);
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, sprites.soft, W / 2, H / 2 - 30, 1500, 0.55 * back);
  godRays(ctx, W / 2, H / 2 - 80, t, back);
  ctx.globalCompositeOperation = 'source-over';
  // solid metallic body
  const solid = ss(4.6, 6.4, t);
  const light = (() => { const a = -0.9 + t * 0.12; const l = [Math.sin(a) * 0.6, -0.55, 0.75]; const n = Math.hypot(...l); return l.map(q => q / n); })();
  drawFoxSolid(ctx, xf, cam, solid * 0.96, light, 0.35, ss(5.6, 6.6, t));
  // particles: burst → swirl → converge
  ctx.globalCompositeOperation = 'lighter';
  const burst = expoOut(t / 1.1);
  const partA = 1 - 0.75 * ss(5.4, 7.4, t);
  for (let i = 0; i < FOX_PTS.length; i++) {
    const q = FOX_PTS[i], tp = q.p;
    const c0 = 1.3 + q.delay * 1.8, k = easeInOut((t - c0) / 2.4);
    const target = [tp[0] * R, tp[1] * R, tp[2] * R];
    const rr = q.rad * burst;
    let s = [q.dir[0] * rr, q.dir[1] * rr * 0.7, q.dir[2] * rr];
    s = rotZ(s, (t * 0.35) * (0.5 + q.seed));
    const sw = (1 - k) * (1 - k) * 2.2;
    let p = [lerp(s[0], target[0], k), lerp(s[1], target[1], k), lerp(s[2], target[2], k)];
    p = rotZ(p, sw * (q.seed - 0.5));
    if (k >= 1) { p[0] += Math.sin(t * 2 + i) * 0.006; p[1] += Math.cos(t * 1.7 + i) * 0.006; }
    const pr = project(rotX(rotY(p, yaw), pitch), cam); if (!pr) continue;
    const tw = 0.55 + 0.45 * Math.sin(t * 6 + q.seed * 50);
    const edge = tp[4] === 1, eye = tp[3] === 2;
    const a = partA * (edge ? 0.9 : 0.35 + 0.4 * tp[3]) * tw * (k >= 1 ? 1 : 0.6 + 0.4 * k);
    const sz = (edge ? 6 : 4.5) * pr.s / 150 * (1 + (1 - k) * 1.2);
    if (sz < 2.2) { ctx.globalAlpha = a; ctx.fillStyle = edge ? '#dcecff' : '#b9c6d3'; ctx.fillRect(pr.x - sz / 3, pr.y - sz / 3, sz / 1.5, sz / 1.5); }
    else glow(ctx, eye ? sprites.ice : (edge || q.seed > 0.86 ? sprites.ice : sprites.silver), pr.x, pr.y, sz * 2.2, a);
  }
  // energy orbits around the mark
  const eA = ss(3.0, 5.0, t) * (1 - ss(7.6, 8.4, t));
  if (eA > 0) for (let j = 0; j < 7; j++) {
    const tilt = -0.6 + j * 0.2, rad = 2.9 + j * 0.12, sp = 0.6 + hash(j) * 0.5;
    ctx.beginPath(); let first = true;
    for (let s = 0; s < 46; s++) {
      const ang = t * sp + j * 0.9 - s * 0.022;
      const p = rotX(rotY(rotZ([Math.cos(ang) * rad, 0, Math.sin(ang) * rad], tilt), yaw), pitch + 0.25);
      const pr = project(p, cam); if (!pr) { first = true; continue; }
      if (first) { ctx.moveTo(pr.x, pr.y); first = false; } else ctx.lineTo(pr.x, pr.y);
      if (s === 0) glow(ctx, sprites.ice, pr.x, pr.y, 26, eA * 0.9);
    }
    ctx.globalAlpha = eA * 0.45; ctx.strokeStyle = 'rgba(140,200,255,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- SCENE 3 · Global Defense (15.0 – 23.2)
let GLOBE = null;
function buildGlobe() {
  const pts = [], N = 5200, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i, p = [Math.cos(th) * r, y, Math.sin(th) * r];
    const n = noise3(p[0] * 1.7 + 4, p[1] * 1.7 + 1, p[2] * 1.7) * 0.65 + noise3(p[0] * 4 + 9, p[1] * 4, p[2] * 4) * 0.35;
    if (n > 0.53 && Math.abs(y) < 0.93) pts.push(p);
  }
  const r = rng(3), cities = Array.from({ length: 34 }, () => pts[(r() * pts.length) | 0]);
  const arcs = Array.from({ length: 30 }, (_, i) => ({ a: cities[(r() * 34) | 0], b: cities[(r() * 34) | 0], t0: 0.4 + r() * 6.2, dur: 1.4 + r() * 1.2 })).filter(a => a.a !== a.b);
  // geodesic shield (icosphere, 2 subdivisions)
  const t = (1 + Math.sqrt(5)) / 2; let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v => { const l = Math.hypot(...v); return v.map(q => q / l); });
  let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let s = 0; s < 2; s++) { const cache = {}, nf = [];
    const mid = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (cache[k] !== undefined) return cache[k]; const m = V[a].map((q, i) => (q + V[b][i]) / 2); const l = Math.hypot(...m); V.push(m.map(q => q / l)); return cache[k] = V.length - 1; };
    for (const [a, b, c] of F) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); } F = nf; }
  const E = new Set(), edges = []; for (const [a, b, c] of F) for (const [p, q] of [[a, b], [b, c], [c, a]]) { const k = p < q ? p + '_' + q : q + '_' + p; if (!E.has(k)) { E.add(k); edges.push([p, q]); } }
  const threats = Array.from({ length: 26 }, () => { const th = r() * 6.28, ph = Math.acos(2 * r() - 1); return { dir: [Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.6, Math.sin(ph) * Math.sin(th)], t0: 3.6 + r() * 4.2 }; })
    .map(q => { const l = Math.hypot(...q.dir); q.dir = q.dir.map(v => v / l); return q; });
  GLOBE = { pts, arcs, V, edges, threats };
}
function slerp(a, b, k) { const d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1), om = Math.acos(d); if (om < 1e-4) return a; const s = Math.sin(om);
  return a.map((q, i) => (Math.sin((1 - k) * om) * q + Math.sin(k * om) * b[i]) / s); }
function sceneGlobe(ctx, T) {
  const t = T - 15.0, G = GLOBE, R = 2.4, RS = 2.98;
  bg(ctx, [10, 18, 30], [2, 3, 6]);
  const cam = { d: lerp(10.5, 7.6, easeInOut(t / 8)), f: 1000, cx: W / 2 + lerp(220, 120, t / 8), cy: H / 2 + 20 };
  const spin = 0.6 + t * 0.14, pitch = lerp(0.42, 0.18, easeInOut(t / 8)), yaw = lerp(-0.25, 0.1, t / 8);
  const xf = p => rotX(rotY(rotY(p, spin), yaw), pitch);
  const c = project([0, 0, 0], cam), pr = R * c.s;
  // atmosphere
  ctx.globalCompositeOperation = 'lighter';
  const ag = ctx.createRadialGradient(c.x, c.y, pr * 0.85, c.x, c.y, pr * 1.45);
  ag.addColorStop(0, 'rgba(90,160,255,0)'); ag.addColorStop(0.18, 'rgba(110,175,255,0.22)'); ag.addColorStop(0.45, 'rgba(70,130,220,0.06)'); ag.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const og = ctx.createRadialGradient(c.x - pr * 0.3, c.y - pr * 0.35, pr * 0.1, c.x, c.y, pr);
  og.addColorStop(0, 'rgba(26,38,56,1)'); og.addColorStop(1, 'rgba(6,9,14,1)');
  ctx.fillStyle = og; ctx.beginPath(); ctx.arc(c.x, c.y, pr, 0, 7); ctx.fill();
  // land dots
  ctx.globalCompositeOperation = 'lighter';
  const reveal = ss(0, 1.6, t);
  for (let i = 0; i < G.pts.length; i++) {
    const p = xf(G.pts[i].map(q => q * R)); if (p[2] > 0.4) continue;
    const q = project(p, cam); const facing = clamp(-p[2] / R);
    const a = reveal * (0.18 + 0.7 * facing) * (0.8 + 0.2 * hash(i));
    ctx.globalAlpha = a; ctx.fillStyle = facing > 0.5 && hash(i * 3) > 0.92 ? '#9fd3ff' : '#b8c6d4';
    const sz = 2.2 * q.s / 130; ctx.fillRect(q.x - sz / 2, q.y - sz / 2, sz, sz);
  }
  // encrypted links
  for (const a of G.arcs) {
    const k = (t - a.t0) / a.dur; if (k < 0 || k > 1.8) continue;
    const head = clamp(k), tail = clamp(k - 0.55), fade = 1 - ss(1.3, 1.8, k);
    const dist = Math.acos(clamp(a.a[0] * a.b[0] + a.a[1] * a.b[1] + a.a[2] * a.b[2], -1, 1));
    ctx.beginPath(); let first = true, hp = null;
    for (let s = 0; s <= 36; s++) {
      const u = lerp(tail, head, s / 36), b = slerp(a.a, a.b, u), h = R * (1 + Math.sin(u * Math.PI) * (0.08 + dist * 0.16));
      const p = xf(b.map(q => q * h)), q = project(p, cam); if (!q) continue;
      if (first) { ctx.moveTo(q.x, q.y); first = false; } else ctx.lineTo(q.x, q.y); hp = { q, z: p[2] };
    }
    ctx.globalAlpha = 0.75 * fade; ctx.strokeStyle = 'rgba(124,196,255,0.9)'; ctx.lineWidth = 1.4; ctx.stroke();
    if (hp && k < 1) glow(ctx, sprites.ice, hp.q.x, hp.q.y, 30, 0.95 * fade);
  }
  // shield lattice: scans in bottom→top
  const sh = ss(2.6, 4.4, t);
  if (sh > 0) {
    ctx.lineWidth = 1;
    for (const [i, j] of G.edges) {
      const a = xf(G.V[i].map(q => q * RS)), b = xf(G.V[j].map(q => q * RS));
      const yv = (G.V[i][1] + G.V[j][1]) / 2, on = ss(-1.1 + sh * 2.4, -1.0 + sh * 2.4 + 0.15, -yv + 0.0);
      const front = (a[2] + b[2]) / 2 < 0;
      const pa = project(a, cam), pb = project(b, cam); if (!pa || !pb) continue;
      ctx.globalAlpha = (1 - on) * 0 + on * (front ? 0.30 : 0.08);
      ctx.strokeStyle = '#9ccfff'; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    // scanning ring
    const sy = lerp(1.05, -1.05, sh); if (sh < 1) { ctx.beginPath(); for (let s = 0; s <= 64; s++) { const ang = s / 64 * 6.283, rr = RS * Math.sqrt(Math.max(0, 1 - sy * sy)); const q = project(rotX(rotY([Math.cos(ang) * rr, -sy * RS, Math.sin(ang) * rr], yaw), pitch), cam); if (q) s ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
      ctx.globalAlpha = 0.8 * Math.sin(sh * Math.PI); ctx.strokeStyle = '#cfe8ff'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  // threats intercepted at the shield
  for (const th of G.threats) {
    const k = t - th.t0; if (k < 0) continue;
    const dist = 8.5 - k * 4.2, d = Math.max(dist, RS);
    const p = rotX(rotY(th.dir.map(q => q * d), yaw), pitch), q = project(p, cam); if (!q) continue;
    if (dist > RS) {
      const p2 = project(rotX(rotY(th.dir.map(v => v * (d + 0.6)), yaw), pitch), cam);
      if (p2) { ctx.globalAlpha = 0.6; ctx.strokeStyle = 'rgba(255,90,70,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      glow(ctx, sprites.threat, q.x, q.y, 22, 0.9);
    } else {
      const e = (RS - dist) / 4.2; if (e > 0.9) continue;
      glow(ctx, sprites.ice, q.x, q.y, 30 + 90 * e, (1 - e / 0.9) * 0.8);
      ctx.globalAlpha = (1 - e / 0.9) * 0.8; ctx.strokeStyle = '#a8d8ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(q.x, q.y, 10 + 60 * e, (10 + 60 * e) * 0.55, 0, 0, 7); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // HUD readouts (sparse, precise)
  const hud = win(t, 2.2, 8.2, 0.8, 0.6);
  if (hud > 0) { ctx.save(); setFont(ctx, 400, 13, FONT_M, 3); ctx.fillStyle = rgba(C.iceRGB, 0.75 * hud);
    const n = Math.floor(clamp(t - 3.6, 0, 9) * 37 + (t > 3.6 ? 1 : 0));
    ctx.fillText('THREATS NEUTRALISED  ' + String(Math.min(n, 4096)).padStart(4, '0'), W - 470, BAR + 70);
    ctx.fillText('NETWORK INTEGRITY    100%', W - 470, BAR + 94);
    ctx.fillStyle = rgba([150, 165, 180], 0.5 * hud); ctx.fillText('ZERO-TRUST MESH · ACTIVE', W - 470, BAR + 118); ctx.restore(); }
  caption(ctx, T, 16.2, 22.6, '01', 'CYBERSECURITY', 'Threat intelligence  ·  Zero-trust defense  ·  24/7 monitoring');
}

// ---------------------------------------------------------------- SCENE 4 · Encryption Tunnel (22.9 – 30.5)
let TUN = null;
function buildTunnel() { TUN = { rings: 64, per: 40, gap: 1.2 }; }
const HEX = '0123456789ABCDEF';
function sceneTunnel(ctx, T) {
  const t = T - 22.9;
  bg(ctx, [6, 12, 22], [1, 2, 4]);
  // forward travel: accelerates, then eases as the lock engages (integrated speed curve)
  let camZ = 0; { const n = 60, dt = Math.max(t, 0) / n; for (let i = 0; i < n; i++) { const u = (i + 0.5) * dt; camZ += (4 + 1.8 * u) * (1 - 0.82 * ss(4.6, 6.0, u)) * dt; } }
  const R = 3.2, f = 820, rot = t * 0.12, flow = 1;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, sprites.soft, W / 2, H / 2, 900, 0.5);
  glow(ctx, sprites.white, W / 2, H / 2, 120, 0.55);
  setFont(ctx, 500, 30, FONT_M, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const zOff = camZ * flow + (1 - flow) * 0; // keep motion continuous
  const base = Math.floor(zOff / TUN.gap);
  for (let ri = TUN.rings - 1; ri >= 0; ri--) {
    const idx = base + ri, z = idx * TUN.gap - zOff + 0.3; if (z <= 0.35) continue;
    const s = f / z, fogA = clamp(1 - z / (TUN.rings * TUN.gap)) * clamp(z / 1.2);
    for (let k = 0; k < TUN.per; k++) {
      const ang = k / TUN.per * Math.PI * 2 + rot + (idx % 2) * 0.08;
      const x = W / 2 + Math.cos(ang) * R * s, y = H / 2 + Math.sin(ang) * R * s * 0.92;
      if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
      const hsh = hash(idx * 131 + k * 7);
      if (hsh < 0.35) continue;
      const a = fogA * (0.25 + 0.75 * hsh);
      if (s > 70) {
        const ch = HEX[Math.floor(hash(idx * 17 + k + Math.floor(T * 10) * 3) * 16)];
        ctx.globalAlpha = a; ctx.fillStyle = hsh > 0.9 ? '#bfe3ff' : '#7f93a8';
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(s / 260, s / 260); ctx.fillText(ch, 0, 0); ctx.restore();
      } else { ctx.globalAlpha = a; ctx.fillStyle = hsh > 0.9 ? '#9fd3ff' : '#6d7f92'; const sz = Math.max(1.2, s / 40); ctx.fillRect(x - sz, y - sz / 2, sz * 2, sz); }
    }
  }
  // light rails
  for (let k = 0; k < 10; k++) {
    const ang = k / 10 * Math.PI * 2 + rot * 1.2 + 0.2;
    const z1 = 0.6, z2 = 60, s1 = f / z1, s2 = f / z2, rr = R * 0.97;
    const g = ctx.createLinearGradient(W / 2 + Math.cos(ang) * rr * s1, H / 2 + Math.sin(ang) * rr * s1, W / 2 + Math.cos(ang) * rr * s2, H / 2 + Math.sin(ang) * rr * s2);
    g.addColorStop(0, 'rgba(124,196,255,0)'); g.addColorStop(0.5, 'rgba(124,196,255,0.25)'); g.addColorStop(1, 'rgba(124,196,255,0)');
    ctx.globalAlpha = 0.8; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(W / 2 + Math.cos(ang) * rr * s1, H / 2 + Math.sin(ang) * rr * s1 * 0.92); ctx.lineTo(W / 2 + Math.cos(ang) * rr * s2, H / 2 + Math.sin(ang) * rr * s2 * 0.92); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  drawLock(ctx, W / 2, H / 2 - 10, t);
  caption(ctx, T, 23.6, 29.6, '01', 'ENCRYPTION', 'Every byte protected  ·  End to end');
}
function drawLock(ctx, x, y, t) {
  const a = ss(3.6, 4.4, t); if (a <= 0) return;
  const draw = easeInOut((t - 3.6) / 1.4), close = easeInOut((t - 5.5) / 0.28), sc = 1 + 0.05 * Math.exp(-Math.max(0, t - 5.78) * 6) * (t > 5.78 ? 1 : 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  // dark core to seat the lock
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 230); g.addColorStop(0, `rgba(3,6,10,${0.85 * a})`); g.addColorStop(1, 'rgba(3,6,10,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const bw = 150, bh = 118, sy = -bh / 2 + 6 - 34 * (1 - close);
  const path = () => { ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2 + 30, bw, bh, 16); };
  const shackle = () => { ctx.beginPath(); ctx.moveTo(-46, sy + 24); ctx.lineTo(-46, sy - 26); ctx.arc(0, sy - 26, 46, Math.PI, 0); ctx.lineTo(46, sy + 4 + (1 - close) * 0); };
  for (const [lw, col, al] of [[10, 'rgba(124,196,255,0.25)', 1], [3, '#e6eef6', 1]]) {
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.globalAlpha = a * al;
    ctx.setLineDash([1000 * draw, 1000]); path(); ctx.stroke(); shackle(); ctx.stroke(); ctx.setLineDash([]);
  }
  // keyhole
  ctx.globalAlpha = a * ss(4.6, 5.0, t); ctx.fillStyle = '#e6eef6'; ctx.beginPath(); ctx.arc(0, 30 + 8, 11, 0, 7); ctx.fill(); ctx.fillRect(-4, 38, 8, 26);
  // click flash
  if (t > 5.78) { const e = (t - 5.78) / 0.9; if (e < 1) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.ice, 0, 20, 300 + 600 * e, (1 - e) * 0.9);
    ctx.globalAlpha = (1 - e) * 0.9; ctx.strokeStyle = '#cfe8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 20, 120 + 380 * easeOut(e), 0, 7); ctx.stroke(); } }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * ss(5.9, 6.4, t); setFont(ctx, 500, 15, FONT_M, 8); ctx.fillStyle = '#9fd3ff'; ctx.textAlign = 'center'; ctx.fillText('SECURED', 4, 150); ctx.textAlign = 'left';
  ctx.restore();
}

// ---------------------------------------------------------------- glass UI panel helper
function glass(ctx, x, y, w, h, a, r = 18, op = 1) {
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, `rgba(46,58,74,${Math.min(1, 0.62 * op)})`); g.addColorStop(1, `rgba(14,19,27,${Math.min(1, 0.78 * op)})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  const b = ctx.createLinearGradient(x, y, x + w, y + h);
  b.addColorStop(0, 'rgba(220,235,250,0.55)'); b.addColorStop(0.4, 'rgba(160,180,200,0.12)'); b.addColorStop(1, 'rgba(124,196,255,0.35)');
  ctx.strokeStyle = b; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}
function floorGrid(ctx, t, camX, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(124,196,255,0.10)'; ctx.lineWidth = 1;
  const hy = H * 0.62, f = 700;
  for (let i = -30; i <= 30; i++) { const x = i * 1.2 - camX; ctx.beginPath(); ctx.moveTo(W / 2 + x * f / 2, hy + 1.6 * f / 2); ctx.lineTo(W / 2 + x * f / 60, hy + 1.6 * f / 60); ctx.stroke(); }
  for (let z = 2; z < 60; z *= 1.22) { const y = hy + 1.6 * f / z; ctx.globalAlpha = a * clamp(1.4 - z / 30); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const g = ctx.createLinearGradient(0, hy - 60, 0, hy + 140); g.addColorStop(0, 'rgba(4,6,10,0.9)'); g.addColorStop(1, 'rgba(4,6,10,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, hy - 60, W, 200); ctx.restore();
}

// ---------------------------------------------------------------- SCENE 5 · Web Development (30.2 – 37.6)
const CODE = [
  [['k', 'import'], ['p', ' { '], ['n', 'Shield'], ['p', ' } '], ['k', 'from'], ['s', " '@silverfoxns/core'"], ['p', ';']],
  [],
  [['k', 'export async function'], ['f', ' launch'], ['p', '(app) {']],
  [['p', '  '], ['k', 'const'], ['n', ' site'], ['p', ' = '], ['k', 'await'], ['n', ' Shield'], ['p', '.'], ['f', 'harden'], ['p', '(app, {']],
  [['p', '    tls: '], ['s', "'strict'"], ['p', ',']],
  [['p', '    headers: '], ['s', "'hardened'"], ['p', ',']],
  [['p', '    audit: '], ['k', 'true'], ['p', ',']],
  [['p', '  });']],
  [['p', '  '], ['k', 'return'], ['n', ' site'], ['p', '.'], ['f', 'deploy'], ['p', '({ region: '], ['s', "'global'"], ['p', ' });']],
  [['p', '}']],
];
const CODECOL = { k: '#7cc4ff', s: '#e3eaf1', n: '#c3ccd6', f: '#a9d8ff', p: '#7d8a98' };
function codePanel(ctx, x, y, w, h, t, a) {
  glass(ctx, x, y, w, h, a, 18, 1.22);
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.clip();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(200,212,224,0.35)'; ctx.beginPath(); ctx.arc(x + 26 + i * 18, y + 24, 5, 0, 7); ctx.fill(); }
  setFont(ctx, 400, 13, FONT_M, 1); ctx.fillStyle = '#6f7d8b'; ctx.fillText('launch.ts', x + 100, y + 29);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y + 46, w, 1);
  setFont(ctx, 400, 19, FONT_M, 0);
  const chars = Math.floor(t * 34); let used = 0;
  for (let li = 0; li < CODE.length; li++) {
    let cx = x + 64; const ly = y + 92 + li * 33;
    ctx.fillStyle = '#3f4a56'; ctx.fillText(String(li + 1).padStart(2, ' '), x + 22, ly);
    for (const [ty, txt] of CODE[li]) {
      const n = clamp(chars - used, 0, txt.length); used += txt.length; if (n <= 0) continue;
      const s = txt.slice(0, n); ctx.fillStyle = CODECOL[ty]; ctx.fillText(s, cx, ly); cx += ctx.measureText(s).width;
    }
    used += 1;
    if (chars >= used - 1 - CODE[li].reduce((s, q) => s + q[1].length, 0) && (chars < used || li === CODE.length - 1) && Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = '#7cc4ff'; ctx.fillRect(cx + 2, ly - 17, 2, 22); }
  }
  ctx.restore();
}
function sitePanel(ctx, x, y, w, h, t, a) {
  glass(ctx, x, y, w, h, a);
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.clip();
  // browser bar
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, w, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.roundRect(x + w / 2 - 170, y + 12, 340, 22, 11); ctx.fill();
  setFont(ctx, 400, 12, FONT_M, 1); ctx.fillStyle = '#8796a6'; ctx.textAlign = 'center'; ctx.fillText('silverfoxns.com', x + w / 2, y + 28); ctx.textAlign = 'left';
  // nav
  const p = (d) => easeOut((t - d) / 0.7);
  ctx.globalAlpha = a * p(0.3);
  drawMiniFox(ctx, x + 44, y + 84, 13, 1);
  setFont(ctx, 600, 15, FONT_D, 4); ctx.fillStyle = '#dfe6ed'; ctx.fillText('SILVERFOXNS', x + 64, y + 90);
  setFont(ctx, 400, 13, FONT_T, 1); ctx.fillStyle = '#8796a6';
  ['Security', 'Development', 'CRM', 'Automation'].forEach((s, i) => ctx.fillText(s, x + w - 420 + i * 100, y + 90));
  // hero
  ctx.globalAlpha = a * p(0.7);
  setFont(ctx, 300, 46, FONT_D, 1); ctx.fillStyle = silverFill(ctx, x + 50, x + 600, (t - 1.5) / 1.5);
  ctx.fillText('Secure by design.', x + 50, y + 180 + (1 - p(0.7)) * 16);
  ctx.globalAlpha = a * p(1.0);
  setFont(ctx, 400, 16, FONT_T, 0.5); ctx.fillStyle = '#8796a6'; ctx.fillText('Enterprise-grade protection for modern business.', x + 52, y + 216);
  ctx.globalAlpha = a * p(1.2); ctx.fillStyle = '#d7dee5'; ctx.beginPath(); ctx.roundRect(x + 52, y + 240, 150, 40, 20); ctx.fill();
  setFont(ctx, 600, 13, FONT_T, 1.5); ctx.fillStyle = '#0a0e14'; ctx.fillText('GET STARTED', x + 78, y + 265);
  // cards
  for (let i = 0; i < 3; i++) {
    const k = p(1.4 + i * 0.22), cw = (w - 140) / 3, cx = x + 50 + i * (cw + 20), cy = y + 310 + (1 - k) * 40;
    ctx.globalAlpha = a * k; ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(cx, cy, cw, h - 340, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
    ctx.fillStyle = 'rgba(124,196,255,0.7)'; ctx.fillRect(cx + 18, cy + 20, 26, 3);
    ctx.fillStyle = 'rgba(220,228,236,0.75)'; ctx.fillRect(cx + 18, cy + 36, cw * 0.55, 8);
    ctx.fillStyle = 'rgba(160,172,186,0.35)'; ctx.fillRect(cx + 18, cy + 54, cw * 0.75, 6); ctx.fillRect(cx + 18, cy + 66, cw * 0.62, 6);
  }
  ctx.restore();
}
function phonePanel(ctx, x, y, w, h, t, a) {
  glass(ctx, x, y, w, h, a, 34);
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 34); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(x + w / 2 - 40, y + 14, 80, 20, 10); ctx.fill();
  // performance ring
  const k = easeInOut((t - 1.0) / 2.2), cx = x + w / 2, cy = y + 150;
  ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(cx, cy, 62, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#7cc4ff'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.99 * k); ctx.stroke();
  setFont(ctx, 300, 40, FONT_D, 0); ctx.fillStyle = '#e8eef4'; ctx.textAlign = 'center'; ctx.fillText(String(Math.round(99 * k)), cx, cy + 14);
  setFont(ctx, 500, 11, FONT_M, 3); ctx.fillStyle = '#7f8e9e'; ctx.fillText('PERFORMANCE', cx, cy + 102); ctx.textAlign = 'left';
  for (let i = 0; i < 4; i++) { const kk = easeOut((t - 1.6 - i * 0.2) / 0.6); ctx.globalAlpha = a * kk;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(x + 18, y + 278 + i * 62 + (1 - kk) * 20, w - 36, 50, 10); ctx.fill();
    ctx.fillStyle = 'rgba(124,196,255,0.6)'; ctx.beginPath(); ctx.arc(x + 42, y + 303 + i * 62, 9, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(210,220,230,0.6)'; ctx.fillRect(x + 62, y + 296 + i * 62, w * 0.42, 6); ctx.fillStyle = 'rgba(160,172,186,0.3)'; ctx.fillRect(x + 62, y + 308 + i * 62, w * 0.3, 5); }
  ctx.restore();
}
function drawMiniFox(ctx, cx, cy, r, a) { // flat-shaded mark for UI use
  ctx.save(); ctx.globalAlpha *= a;
  for (const f of FOX_FACETS) { const k = f.kind === 'eye' ? null : f.kind === 'nose' ? 0.05 : f.kind === 'inner' ? 0.2 : f.tone;
    ctx.fillStyle = k === null ? '#9fd3ff' : `rgb(${lerp(40, 236, k)},${lerp(46, 241, k)},${lerp(56, 247, k)})`;
    ctx.beginPath(); f.pts.forEach((p, i) => i ? ctx.lineTo(cx + p[0] * r, cy + p[1] * r) : ctx.moveTo(cx + p[0] * r, cy + p[1] * r)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); }
  ctx.restore();
}
function panel3D(ctx, camX, camY, camZ, px, py, pz, w, h, drawFn) {
  const z = pz - camZ, s = 1000 / z;
  const sx = W / 2 + (px - camX) * s, sy = H / 2 + (py - camY) * s, k = s / 160;
  ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k); drawFn(-w / 2, -h / 2); ctx.restore();
}
function sceneWeb(ctx, T) {
  const t = T - 30.2;
  bg(ctx, [16, 22, 32], [3, 4, 7], W / 2, H * 0.35);
  const camX = lerp(-1.4, 1.2, easeInOut(t / 7.4)), camY = lerp(0.25, -0.05, easeInOut(t / 7.4)), camZ = lerp(0, 0.9, easeInOut(t / 7.4));
  floorGrid(ctx, t, camX * 0.6, 0.9);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W * 0.55, H * 0.4, 1600, 0.35); ctx.globalCompositeOperation = 'source-over';
  const pin = d => ss(d, d + 0.9, t);
  panel3D(ctx, camX * 0.7, camY, camZ, -6.6, -1.2, 11.5, 520, 360, (x, y) => { ctx.filter = 'blur(1.5px)'; sitePanelMini(ctx, x, y, 520, 360, t, 0.55 * pin(0.4)); ctx.filter = 'none'; });
  panel3D(ctx, camX, camY, camZ, 1.6, -0.45, 8.8, 1000, 640, (x, y) => sitePanel(ctx, x, y, 1000, 640, t - 0.5, pin(0.2)));
  panel3D(ctx, camX, camY, camZ, -2.2, 0.9, 7.0, 760, 420, (x, y) => codePanel(ctx, x, y, 760, 420, t - 0.4, pin(0.0)));
  panel3D(ctx, camX, camY, camZ, 4.3, 0.35, 6.1, 300, 560, (x, y) => phonePanel(ctx, x, y, 300, 560, t - 0.8, pin(0.9)));
  caption(ctx, T, 31.0, 37.0, '02', 'WEB DEVELOPMENT', 'Secure, high-performance digital experiences');
}
function sitePanelMini(ctx, x, y, w, h, t, a) { glass(ctx, x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i ? 'rgba(160,172,186,0.25)' : 'rgba(124,196,255,0.6)'; ctx.fillRect(x + 30, y + 40 + i * 40, (w - 60) * (0.4 + 0.5 * hash(i)), 10); } ctx.restore(); }

// ---------------------------------------------------------------- SCENE 6 · CRM + Automation (37.2 – 45.5)
function crmPanel(ctx, x, y, w, h, t, a) {
  glass(ctx, x, y, w, h, a, 22);
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.clip();
  setFont(ctx, 500, 13, FONT_M, 4); ctx.fillStyle = '#7cc4ff'; ctx.fillText('CUSTOMER INTELLIGENCE', x + 44, y + 52);
  setFont(ctx, 300, 34, FONT_D, 1); ctx.fillStyle = '#e3e9ef'; ctx.fillText('Relationship Overview', x + 44, y + 96);
  const kp = [['ACTIVE ACCOUNTS', 2847, ''], ['WIN RATE', 38.6, '%'], ['RETENTION', 96.2, '%'], ['RESPONSE TIME', 1.8, 'h']];
  kp.forEach(([l, v, u], i) => {
    const k = easeOut((t - 0.3 - i * 0.15) / 1.6), bx = x + 44 + i * 270, by = y + 130;
    ctx.globalAlpha = a * clamp(k * 2); ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.beginPath(); ctx.roundRect(bx, by, 250, 110, 14); ctx.fill();
    setFont(ctx, 500, 11, FONT_M, 2.5); ctx.fillStyle = '#7f8e9e'; ctx.fillText(l, bx + 20, by + 32);
    const val = v * k, txt = v >= 100 ? Math.round(val).toLocaleString('en-US') : val.toFixed(1);
    setFont(ctx, 300, 44, FONT_D, 0); ctx.fillStyle = '#eef3f7'; ctx.fillText(txt + u, bx + 18, by + 84);
  });
  ctx.globalAlpha = a;
  // revenue curve
  const cx0 = x + 44, cy0 = y + 290, cw = 640, ch = 230, k = easeInOut((t - 0.8) / 2.2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(cx0, cy0 + i * ch / 4); ctx.lineTo(cx0 + cw, cy0 + i * ch / 4); ctx.stroke(); }
  const fy = u => cy0 + ch - ch * (0.15 + 0.62 * u + 0.1 * Math.sin(u * 9) * (1 - u * 0.5) + 0.05 * Math.sin(u * 23));
  ctx.beginPath(); const N = 80; for (let i = 0; i <= N * k; i++) { const u = i / N; i ? ctx.lineTo(cx0 + u * cw, fy(u)) : ctx.moveTo(cx0, fy(0)); }
  const lastU = Math.floor(N * k) / N;
  ctx.strokeStyle = '#a9d8ff'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.lineTo(cx0 + lastU * cw, cy0 + ch); ctx.lineTo(cx0, cy0 + ch); ctx.closePath();
  const gf = ctx.createLinearGradient(0, cy0, 0, cy0 + ch); gf.addColorStop(0, 'rgba(124,196,255,0.25)'); gf.addColorStop(1, 'rgba(124,196,255,0)'); ctx.fillStyle = gf; ctx.fill();
  if (k > 0 && k < 1) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.ice, cx0 + lastU * cw, fy(lastU), 34, 1); ctx.globalCompositeOperation = 'source-over'; }
  // pipeline
  const st = [['Lead', 1], ['Qualified', 0.72], ['Proposal', 0.48], ['Won', 0.34]];
  setFont(ctx, 500, 11, FONT_M, 2.5); ctx.fillStyle = '#7f8e9e'; ctx.fillText('PIPELINE', x + 740, y + 300);
  st.forEach(([l, v], i) => { const kk = easeInOut((t - 1.0 - i * 0.18) / 1.4), by = y + 326 + i * 50;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(x + 740, by, 300, 30, 8); ctx.fill();
    const g = ctx.createLinearGradient(x + 740, 0, x + 1040, 0); g.addColorStop(0, 'rgba(200,214,228,0.85)'); g.addColorStop(1, 'rgba(124,196,255,0.85)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 740, by, Math.max(1, 300 * v * kk), 30, 8); ctx.fill();
    setFont(ctx, 500, 13, FONT_T, 0.5); ctx.fillStyle = '#0b1017'; if (kk > 0.3) ctx.fillText(l, x + 754, by + 20); });
  ctx.restore();
}
const FLOW = [
  { id: 'TRIGGER', l: 'New enquiry', x: -4.6, z: 0 }, { id: 'VERIFY', l: 'Identity check', x: -2.3, z: 0 }, { id: 'ENRICH', l: 'Company data', x: 0, z: 0 },
  { id: 'ROUTE', l: 'Assign owner', x: 2.3, z: -1.1 }, { id: 'SYNC', l: 'Update CRM', x: 2.3, z: 1.1 }, { id: 'NOTIFY', l: 'Alert team', x: 4.6, z: -1.1 }, { id: 'REPORT', l: 'Live analytics', x: 4.6, z: 1.1 },
];
const FLOW_E = [[0, 1, 0.6], [1, 2, 1.3], [2, 3, 2.0], [2, 4, 2.0], [3, 5, 2.7], [4, 6, 2.7]];
function sceneFlow(ctx, t, a) {
  if (a <= 0) return;
  const cam = { d: lerp(8.6, 6.9, easeInOut(t / 4.4)), f: 1000, cx: W / 2 - 20, cy: H / 2 - 40 };
  const yaw = lerp(0.32, -0.12, easeInOut(t / 4.4)), pitch = lerp(0.85, 0.72, t / 4.4);
  const xf = p => rotX(rotY(p, yaw), pitch);
  const P = FLOW.map(n => project(xf([n.x, 0, n.z]), cam));
  ctx.save(); ctx.globalAlpha = a;
  // plane grid
  ctx.strokeStyle = 'rgba(124,196,255,0.07)'; ctx.lineWidth = 1;
  for (let i = -8; i <= 8; i++) { const p1 = project(xf([i * 0.8, 0.02, -4]), cam), p2 = project(xf([i * 0.8, 0.02, 4]), cam), p3 = project(xf([-7, 0.02, i * 0.5]), cam), p4 = project(xf([7, 0.02, i * 0.5]), cam);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke(); }
  // edges + pulses (loop)
  for (const [i, j, d] of FLOW_E) {
    const A = P[i], B = P[j], mx = (A.x + B.x) / 2;
    const show = easeOut((t - d * 0.45 + 0.2) / 0.6);
    ctx.globalAlpha = a * show * 0.55; ctx.strokeStyle = '#9fb7cf'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.bezierCurveTo(mx, A.y, mx, B.y, B.x, B.y); ctx.stroke();
    for (let r = 0; r < 3; r++) { const u = ((t - d * 0.45) * 0.9 - r * 0.33) % 1; if (t - d * 0.45 < r * 0.33 || u < 0) continue;
      const bx = (1 - u) ** 3 * A.x + 3 * (1 - u) ** 2 * u * mx + 3 * (1 - u) * u * u * mx + u ** 3 * B.x, by = (1 - u) ** 3 * A.y + 3 * (1 - u) ** 2 * u * A.y + 3 * (1 - u) * u * u * B.y + u ** 3 * B.y;
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.ice, bx, by, 30, a * show); ctx.globalCompositeOperation = 'source-over'; }
  }
  // nodes
  FLOW.forEach((n, i) => {
    const p = P[i], arrive = i === 0 ? 0.1 : FLOW_E.find(e => e[1] === i)[2] * 0.45 + 0.2, k = easeOut((t - arrive + 0.3) / 0.6), on = ss(arrive + 0.35, arrive + 0.7, t);
    const sc = p.s / 125; if (k <= 0) return;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(sc, sc); ctx.globalAlpha = a * k;
    if (on > 0) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.ice, 0, 0, 340, 0.35 * on); ctx.globalCompositeOperation = 'source-over'; }
    glass(ctx, -105, -40, 210, 80, a * k, 14);
    ctx.globalAlpha = a * k;
    ctx.fillStyle = on > 0.5 ? '#7cc4ff' : 'rgba(160,175,190,0.5)'; ctx.beginPath(); ctx.arc(-74, 0, 12, 0, 7); ctx.fill();
    if (on > 0.5) { ctx.strokeStyle = '#0a0f16'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-75, 5); ctx.lineTo(-67, -5); ctx.stroke(); }
    setFont(ctx, 600, 11, FONT_M, 2.5); ctx.fillStyle = '#7cc4ff'; ctx.fillText(n.id, -50, -6);
    setFont(ctx, 400, 15, FONT_T, 0.3); ctx.fillStyle = '#dbe3ea'; ctx.fillText(n.l, -50, 16);
    ctx.restore();
  });
  ctx.restore();
}
function sceneBusiness(ctx, T) {
  const t = T - 37.2;
  bg(ctx, [14, 20, 30], [3, 4, 7], W / 2, H * 0.4);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W / 2, H * 0.45, 1700, 0.3); ctx.globalCompositeOperation = 'source-over';
  const crmA = ss(0, 0.7, t) * (1 - ss(3.9, 4.6, t));
  if (crmA > 0) { const s = lerp(0.92, 1.0, easeOut(t / 4.6)), y = lerp(30, 0, easeOut(t / 1.2));
    ctx.save(); ctx.translate(W / 2 + 120, H / 2 - 30 + y); ctx.scale(s, s); ctx.translate(-560, -300); crmPanel(ctx, 0, 0, 1120, 560, t, crmA); ctx.restore(); }
  sceneFlow(ctx, t - 4.0, ss(4.0, 4.8, t));
  caption(ctx, T, 37.8, 41.4, '03', 'CRM SOLUTIONS', 'Every customer relationship, intelligently managed');
  caption(ctx, T, 41.7, 45.0, '04', 'BUSINESS AUTOMATION', 'Intelligent workflows that run themselves');
}

// ---------------------------------------------------------------- SCENE 7 · Founder (45.0 – 52.6)
function sceneFounder(ctx, T) {
  const t = T - 45.0;
  bg(ctx, [10, 13, 18], [2, 2, 4], W / 2, H * 0.3);
  // overhead volumetric cone
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, 'rgba(170,195,225,0.16)'); cg.addColorStop(1, 'rgba(170,195,225,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(W / 2 - 90, 0); ctx.lineTo(W / 2 + 90, 0); ctx.lineTo(W / 2 + 620, H); ctx.lineTo(W / 2 - 620, H); ctx.fill(); ctx.restore();
  drawDust(ctx, t + 10, t * 0.15, W / 2 - H * 0.28, 0.7);
  // ghost fox wireframe
  const R = 3.4, cam = { d: 8, f: 1000, cy: H / 2 - 20 }, yaw = -0.4 + t * 0.06;
  const xf = p => rotY([p[0] * R, p[1] * R, p[2] * R], yaw);
  ctx.save(); ctx.globalAlpha = 0.07 * win(t, 0.3, 7.4, 1.2, 1.0); ctx.strokeStyle = '#9fc8ef'; ctx.lineWidth = 1;
  for (const f of FOX_FACETS) { const P = f.pts.map(p => project(xf(p), cam)); ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.stroke(); }
  ctx.restore();
  const A = 1 - ss(6.6, 7.4, t), ly = H / 2 + 18;
  // light line
  const lw = 980 * expoOut((t - 0.5) / 1.4);
  if (lw > 1) { ctx.save(); ctx.globalAlpha = A; ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0); g.addColorStop(0, 'rgba(124,196,255,0)'); g.addColorStop(0.5, 'rgba(230,242,255,0.95)'); g.addColorStop(1, 'rgba(124,196,255,0)');
    ctx.fillStyle = g; ctx.fillRect(W / 2 - lw / 2, ly - 1, lw, 2); glow(ctx, sprites.ice, W / 2, ly, 700 * lw / 980, 0.25); ctx.restore(); }
  // name rises from behind the line
  const p = easeOut((t - 1.3) / 1.6);
  if (p > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, ly - 4); ctx.clip();
    ctx.translate(0, (1 - p) * 120);
    setFont(ctx, 300, 104, FONT_D, 30); const tw = ctx.measureText('NITHINKUMAR').width - 30;
    ctx.fillStyle = silverFill(ctx, W / 2 - tw / 2, W / 2 + tw / 2, (t - 2.9) / 1.6, 1); ctx.globalAlpha = A;
    ctx.fillText('NITHINKUMAR', W / 2 - tw / 2, ly - 34); ctx.restore(); }
  const p2 = clamp((t - 2.4) / 1.3);
  if (p2 > 0) revealText(ctx, 'Founder – SILVERFOXNS', W / 2, ly + 62, { weight: 400, size: 25, family: FONT_T, tracking: 7, p: p2, fill: '#9fb0c0', alpha: A, rise: -10 });
}

// ---------------------------------------------------------------- SCENE 8 · Finale (52.2 – 60)
const LOGO_PTS = (() => { const r = rng(21); return Array.from({ length: 2600 }, () => ({ s: [(r() - .5) * W * 1.6, (r() - .5) * H * 1.6], d: r(), z: r() })); })();
function sceneFinale(ctx, T) {
  const t = T - 52.2;
  bg(ctx, [14, 19, 27], [2, 3, 5], W / 2, H * 0.42);
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, sprites.soft, W / 2, H / 2 - 150, 1300, 0.45 * ss(1.5, 3, t));
  godRays(ctx, W / 2, H / 2 - 150, t, 0.6 * ss(2.2, 3.4, t));
  ctx.globalCompositeOperation = 'source-over';
  const R = 1.35, cam = { d: 8.6, f: 1000, cy: H / 2 - 170 };
  const yaw = lerp(0.5, 0, easeOut((t - 0.8) / 2.6)) + 0.025 * Math.sin(t * 0.9), light = (() => { const a = -1.2 + t * 0.35; const l = [Math.sin(a) * 0.7, -0.5, 0.7]; const n = Math.hypot(...l); return l.map(q => q / n); })();
  const xf = p => rotY([p[0] * R, p[1] * R, p[2] * R], yaw);
  const solid = ss(1.9, 2.7, t);
  drawFoxSolid(ctx, xf, cam, solid, light, 0.25, solid);
  // converging particles
  ctx.globalCompositeOperation = 'lighter';
  const pa = 1 - ss(2.4, 3.4, t);
  if (pa > 0) for (let i = 0; i < LOGO_PTS.length; i++) {
    const L = LOGO_PTS[i], tp = FOX_PTS[i % FOX_PTS.length].p, k = easeInOut((t - L.d * 0.9) / 1.5);
    const q = project(xf(tp), cam); if (!q) continue;
    const x = lerp(W / 2 + L.s[0], q.x, k), y = lerp(H / 2 + L.s[1], q.y, k);
    glow(ctx, tp[4] ? sprites.ice : sprites.silver, x, y, 5 + (1 - k) * 8, pa * (0.4 + 0.5 * L.z));
  }
  ctx.globalCompositeOperation = 'source-over';
  const fadeAll = 1 - ss(59.25, 60.0, T);
  // wordmark
  const wy = H / 2 + 110;
  const p = clamp((t - 2.8) / 1.3);
  if (p > 0) revealText(ctx, 'SILVERFOXNS', W / 2 + 6, wy, { weight: 500, size: 96, tracking: 26, p, fill: 'silver', sweep: (t - 4.3) / 1.8, rise: 22, stagger: 0.7, alpha: fadeAll });
  // divider
  const dl = 420 * easeInOut((t - 3.9) / 1.0);
  if (dl > 1) { ctx.save(); ctx.globalAlpha = 0.8 * fadeAll; const g = ctx.createLinearGradient(W / 2 - dl / 2, 0, W / 2 + dl / 2, 0); g.addColorStop(0, 'rgba(124,196,255,0)'); g.addColorStop(0.5, 'rgba(124,196,255,1)'); g.addColorStop(1, 'rgba(124,196,255,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - dl / 2, wy + 42, dl, 1.5); ctx.restore(); }
  const p2 = clamp((t - 4.2) / 1.4);
  if (p2 > 0) revealText(ctx, 'BEYOND SECURITY. BEYOND LIMITS.', W / 2 + 6, wy + 100, { weight: 300, size: 30, tracking: 13, p: p2, fill: '#cfd9e2', rise: 10, alpha: fadeAll });
  const p3 = clamp((t - 5.4) / 1.0);
  if (p3 > 0) revealText(ctx, 'www.silverfoxns.com', W / 2 + 3, wy + 160, { weight: 400, size: 20, family: FONT_T, tracking: 5, p: p3, fill: '#7f93a8', rise: 6, alpha: fadeAll });
}

// ---------------------------------------------------------------- timeline + compositor
const SCENES = [
  { a: 0.0, b: 7.4, fin: 0.01, fout: 0.6, fn: sceneGenesis },
  { a: 6.8, b: 15.3, fin: 0.5, fout: 0.55, fn: sceneFox, zoomOut: 1.0 },
  { a: 14.95, b: 23.2, fin: 0.5, fout: 0.45, fn: sceneGlobe },
  { a: 22.9, b: 30.5, fin: 0.35, fout: 0.35, fn: sceneTunnel, zoomOut: 1.0 },
  { a: 30.2, b: 37.6, fin: 0.35, fout: 0.5, fn: sceneWeb },
  { a: 37.2, b: 45.5, fin: 0.5, fout: 0.55, fn: sceneBusiness },
  { a: 45.0, b: 52.6, fin: 0.6, fout: 0.6, fn: sceneFounder },
  { a: 52.2, b: 60.01, fin: 0.6, fout: 0.01, fn: sceneFinale },
];
// cue hits (shared with the score): light-flash overlays on impacts
const FLASH = [[6.95, 0.9], [15.0, 0.55], [23.0, 0.45], [28.7, 0.5], [30.25, 0.75], [37.25, 0.35], [45.1, 0.3], [54.2, 0.6]];
function renderFrame(t) {
  t = clamp(t, 0, DURATION);
  const ctx = mctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W * S, H * S);
  let li = 0;
  for (const sc of SCENES) {
    if (t < sc.a || t > sc.b) continue;
    const A = win(t, sc.a, sc.b, sc.fin, sc.fout); if (A <= 0.001) continue;
    const L = li++ % 2 ? layerB : layerA, lc = L.getContext('2d');
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalAlpha = 1; lc.globalCompositeOperation = 'source-over'; lc.filter = 'none';
    lc.clearRect(0, 0, L.width, L.height); lc.setTransform(S, 0, 0, S, 0, 0);
    sc.fn(lc, t);
    ctx.save(); ctx.globalAlpha = A;
    if (sc.zoomOut) { const z = 1 + 0.35 * ss(sc.b - sc.fout - 0.2, sc.b, t); ctx.translate(W * S / 2, H * S / 2); ctx.scale(z, z); ctx.translate(-W * S / 2, -H * S / 2); }
    ctx.drawImage(L, 0, 0); ctx.restore();
  }
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // bloom
  const b = bloomC.getContext('2d'), b2 = bloomC2.getContext('2d');
  b.globalAlpha = 1; b.clearRect(0, 0, bloomC.width, bloomC.height); b.drawImage(main, 0, 0, bloomC.width, bloomC.height);
  b2.clearRect(0, 0, bloomC2.width, bloomC2.height); b2.filter = 'blur(10px) brightness(1.15)'; b2.drawImage(bloomC, 0, 0); b2.filter = 'none';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.42; ctx.drawImage(bloomC2, 0, 0, W, H);
  // impact flashes
  let fl = 0; for (const [ft, amp] of FLASH) { const d = t - ft; if (d > -0.08 && d < 0.8) fl += amp * (d < 0 ? (d + 0.08) / 0.08 : Math.exp(-d * 6)); }
  if (fl > 0.01) { const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7); g.addColorStop(0, `rgba(220,236,255,${Math.min(0.85, fl)})`); g.addColorStop(1, `rgba(120,170,230,${Math.min(0.4, fl * 0.35)})`); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // film grain
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.085;
  const gi = Math.floor(t * 24) % 4, pat = ctx.createPattern(grain[gi], 'repeat'), off = hash(Math.floor(t * 24)) * 256;
  ctx.save(); ctx.translate(off, off * 0.7); ctx.fillStyle = pat; ctx.fillRect(-off, -off, W + 256, H + 256); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // letterbox + global fade-in
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR);
  const fadeIn = 1 - ss(0, 0.8, t); if (fadeIn > 0) { ctx.globalAlpha = fadeIn; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  const fadeOut = ss(59.5, 60, t); if (fadeOut > 0) { ctx.globalAlpha = fadeOut; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

window.SFX = { init, renderFrame, DURATION, W, H, FOX_FACETS: () => FOX_FACETS };
})();
