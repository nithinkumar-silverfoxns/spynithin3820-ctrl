/* SILVERFOXNS — THE DIGITAL SHADOW (60s) — engine shared with the first brand film (film.js)
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
  buildFox(); buildGlobe(); buildTunnel(); buildCity(); buildFoxBody(); buildHall();
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
function oldCaption() {}
// Lower-third caption: index, title, descriptor.
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
  const hud = 0;
  if (hud > 0) { ctx.save(); setFont(ctx, 400, 13, FONT_M, 3); ctx.fillStyle = rgba(C.iceRGB, 0.75 * hud);
    const n = Math.floor(clamp(t - 3.6, 0, 9) * 37 + (t > 3.6 ? 1 : 0));
    ctx.fillText('THREATS NEUTRALISED  ' + String(Math.min(n, 4096)).padStart(4, '0'), W - 470, BAR + 70);
    ctx.fillText('NETWORK INTEGRITY    100%', W - 470, BAR + 94);
    ctx.fillStyle = rgba([150, 165, 180], 0.5 * hud); ctx.fillText('ZERO-TRUST MESH · ACTIVE', W - 470, BAR + 118); ctx.restore(); }
  oldCaption(ctx, T, 16.2, 22.6, '01', 'CYBERSECURITY', 'Threat intelligence  ·  Zero-trust defense  ·  24/7 monitoring');
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
  oldCaption(ctx, T, 23.6, 29.6, '01', 'ENCRYPTION', 'Every byte protected  ·  End to end');
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
  oldCaption(ctx, T, 31.0, 37.0, '02', 'WEB DEVELOPMENT', 'Secure, high-performance digital experiences');
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
  oldCaption(ctx, T, 37.8, 41.4, '03', 'CRM SOLUTIONS', 'Every customer relationship, intelligently managed');
  oldCaption(ctx, T, 41.7, 45.0, '04', 'BUSINESS AUTOMATION', 'Intelligent workflows that run themselves');
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

// ================================================================ THE DIGITAL SHADOW — new scenes
// Free camera: position + yaw/pitch/roll (pitch > 0 looks down; y axis points down).
function camXf(p, cam) {
  let q = [p[0] - cam.x, p[1] - cam.y, p[2] - cam.z];
  q = rotY(q, -(cam.yaw || 0)); q = rotX(q, cam.pitch || 0); if (cam.roll) q = rotZ(q, cam.roll);
  return q;
}
function proj2(p, cam) { const q = camXf(p, cam); if (q[2] < 0.12) return null; const s = cam.f / q[2]; return { x: W / 2 + q[0] * s, y: H / 2 + q[1] * s, s, z: q[2] }; }
function clipNear(qs, near = 0.15) {
  const out = [];
  for (let i = 0; i < qs.length; i++) { const a = qs[i], b = qs[(i + 1) % qs.length], ai = a[2] >= near, bi = b[2] >= near;
    if (ai) out.push(a); if (ai !== bi) { const k = (near - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, near]); } }
  return out;
}
function polyPath(ctx, pts, cam) {
  const c = clipNear(pts.map(p => camXf(p, cam))); if (c.length < 3) return false;
  ctx.beginPath(); c.forEach((q, i) => { const s = cam.f / q[2], x = W / 2 + q[0] * s, y = H / 2 + q[1] * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); return true;
}
function line3(ctx, a, b, cam) { const c = clipNear([camXf(a, cam), camXf(b, cam)]); if (c.length < 2) return false;
  const P = c.map(q => [W / 2 + q[0] * cam.f / q[2], H / 2 + q[1] * cam.f / q[2]]); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1]); return true; }
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------------------------------------------------------- SCENE 1 · The Digital World (0 – 10.4)
let CITY = null;
function buildCity() {
  const r = rng(404), B = [];
  for (const side of [-1, 1]) for (const [x0, x1, h0, h1] of [[3.6, 6, 9, 34], [11, 16, 14, 52], [21, 34, 18, 70]]) {
    let z = -6 + r() * 4;
    while (z < 300) { const w = 2.2 + r() * 2.8, d = 2.4 + r() * 3.6, x = side * (x0 + w / 2 + r() * (x1 - x0)), h = h0 + Math.pow(r(), 1.6) * (h1 - h0);
      B.push({ x, z: z + d / 2, w, d, h, seed: r() * 1000, rim: r() > 0.6, warm: r() > 0.55, beacon: r() > 0.7 }); z += d + 0.8 + r() * 2.2; }
  }
  const lines = Array.from({ length: 9 }, () => ({ x: (r() - .5) * 5.2, y: -2.5 - r() * 13, sp: 26 + r() * 30, ph: r() * 40, red: r() > 0.55 }));
  const inner = B.filter(b => Math.abs(b.x) < 9);
  const arcs = Array.from({ length: 26 }, () => { const a = inner[(r() * inner.length) | 0]; let b = inner[(r() * inner.length) | 0]; return { a, b, t0: r() * 9, dur: 0.9 + r() * 0.9, red: r() > 0.6 }; });
  const rings = Array.from({ length: 9 }, () => { const b = B[(r() * B.length) | 0]; return { x: b.x, z: b.z, t0: 5.2 + r() * 4 }; });
  CITY = { B, lines, arcs, rings };
}
function cityCam(t) {
  let z = 0; { const n = 50, dt = t / n; for (let i = 0; i < n; i++) { const u = (i + 0.5) * dt; z += (13 - 5 * ss(5, 7, u)) * dt; } }
  const rise = easeInOut((t - 5.3) / 4.9);
  return { x: 0.9 * Math.sin(t * 0.45), y: -8.5 - 34 * rise, z: -4 + z, yaw: 0.07 * Math.sin(t * 0.35), pitch: 0.02 + 0.62 * rise, roll: 0.05 * Math.sin(t * 0.5) * (1 - rise), f: 900 };
}
function sceneCity(ctx, T) {
  const t = T, cam = cityCam(t), threat = ss(5.05, 6.2, t);
  // sky
  const hz = proj2([cam.x, cam.y, cam.z + 4000], cam), hy = hz ? hz.y : H / 2;
  const sky = ctx.createLinearGradient(0, hy - 700, 0, hy + 80);
  sky.addColorStop(0, '#03050a'); sky.addColorStop(0.75, '#0c1624'); sky.addColorStop(1, rgba(mixc([26, 42, 62], [60, 26, 30], threat * 0.35), 1));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#05070b'; ctx.fillRect(0, hy, W, H);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W / 2, hy, 2200, 0.35); ctx.globalCompositeOperation = 'source-over';
  // street plane lights
  const fog = [11, 16, 25];
  const vis = CITY.B.filter(b => b.z - cam.z > -6 && b.z - cam.z < 240).map(b => ({ b, d: Math.hypot(b.x - cam.x, b.z - cam.z) })).sort((a, b) => b.d - a.d);
  // ground: street lamps + traffic trails
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 44; k++) { const z = Math.floor(cam.z / 6) * 6 + k * 6; for (const sx of [-3.1, 3.1]) { const p = proj2([sx, -0.3, z], cam); if (p) glow(ctx, sprites.soft, p.x, p.y, Math.max(4, 60 * p.s / 300), 0.6 * clamp(1 - (z - cam.z) / 260)); } }
  for (let k = 0; k < 26; k++) { const lane = (k % 4 - 1.5) * 1.1, dir = lane > 0 ? 1 : -1, z = cam.z + ((hash(k) * 260 + dir * 22 * t) % 260 + 260) % 260;
    const a = proj2([lane, -0.25, z], cam), b = proj2([lane, -0.25, z - dir * 3], cam); if (!a || !b) continue;
    ctx.globalAlpha = 0.5 * clamp(1 - (z - cam.z) / 240); ctx.strokeStyle = dir > 0 ? '#ffd9b0' : '#cfe4ff'; ctx.lineWidth = Math.max(1, a.s / 90); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // buildings (painter's order)
  for (const { b, d } of vis) {
    const fk = clamp(d / 230), x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, top = -b.h;
    const faces = [];
    if (cam.z < z0) faces.push({ p: [[x0, 0, z0], [x1, 0, z0], [x1, top, z0], [x0, top, z0]], ax: 'x', u0: x0, u1: x1, fz: z0, sh: 1.0 });
    if (cam.x > x1) faces.push({ p: [[x1, 0, z0], [x1, 0, z1], [x1, top, z1], [x1, top, z0]], ax: 'z', u0: z0, u1: z1, fx: x1, sh: 0.75 });
    if (cam.x < x0) faces.push({ p: [[x0, 0, z0], [x0, 0, z1], [x0, top, z1], [x0, top, z0]], ax: 'z', u0: z0, u1: z1, fx: x0, sh: 0.75 });
    if (cam.y < top) faces.push({ p: [[x0, top, z0], [x1, top, z0], [x1, top, z1], [x0, top, z1]], top: true, sh: 1.3 });
    for (const f of faces) {
      if (!polyPath(ctx, f.p, cam)) continue;
      const base = mixc(mixc([5, 8, 13], [12, 18, 28], f.sh - 0.75), fog, fk * 0.8);
      const pt = proj2([b.x, top, b.z], cam), pb = proj2([b.x, 0, b.z], cam);
      if (pt && pb && !f.top) { const g = ctx.createLinearGradient(0, pt.y, 0, pb.y); g.addColorStop(0, rgba(mixc(base, [52, 70, 94], 0.5 * (1 - fk)), 1)); g.addColorStop(0.35, rgba(base, 1)); g.addColorStop(1, rgba(mixc(base, [2, 3, 5], 0.5), 1)); ctx.fillStyle = g; }
      else ctx.fillStyle = rgba(f.top ? mixc(base, [40, 52, 70], 0.4) : base, 1);
      ctx.fill();
      if (f.top) continue;
      // windows
      if (d < 150) { const rows = Math.floor(b.h / 1.15), cols = Math.max(2, Math.floor((f.u1 - f.u0) / 0.85)), wa = clamp(1.1 - d / 150);
        ctx.globalCompositeOperation = 'lighter';
        for (let ri = 1; ri < rows; ri++) for (let ci = 0; ci < cols; ci++) {
          const hsh = hash(b.seed + ri * 31.7 + ci * 7.3 + (f.ax === 'x' ? 0 : 500));
          if (hsh > 0.28) continue;
          const u = f.u0 + (ci + 0.5) * (f.u1 - f.u0) / cols, y = -ri * 1.15;
          const p = proj2(f.ax === 'x' ? [u, y, f.fz - 0.01] : [f.fx, y, u], cam); if (!p) continue;
          const red = threat > 0 && hash(b.seed * 3 + ri + ci) < 0.08 * threat;
          const flick = red ? (0.4 + 0.6 * (Math.sin(t * 22 + hsh * 90) > 0)) : 1;
          ctx.globalAlpha = wa * (0.2 + 2.0 * hsh) * flick * (f.sh < 1 ? 0.6 : 1) * clamp(p.z / 14 + 0.25);
          ctx.fillStyle = red ? '#ff5a48' : b.warm ? '#ffe2b8' : '#cfe6ff';
          const sw = Math.max(1, 0.3 * p.s) * (f.ax === 'z' ? 0.55 : 1), sh = Math.max(1, 0.4 * p.s);
          ctx.fillRect(p.x - sw / 2, p.y - sh / 2, sw, sh);
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    }
    // rim light on the leading vertical edge
    if (b.rim) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * clamp(1 - fk); ctx.strokeStyle = '#8fc8ff'; ctx.lineWidth = 1.2; ctx.beginPath();
      const ex = b.x > cam.x ? x0 : x1; line3(ctx, [ex, 0, z0], [ex, top, z0], cam); ctx.stroke(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    if (b.beacon) { const p = proj2([b.x, top - 0.4, b.z], cam); if (p) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.white, p.x, p.y, Math.max(6, p.s / 4), (0.5 + 0.5 * Math.sin(t * 3 + b.seed)) * clamp(1 - fk)); ctx.globalCompositeOperation = 'source-over'; } }
  }
  // data: fibre lines down the avenue
  ctx.globalCompositeOperation = 'lighter';
  for (const L of CITY.lines) {
    ctx.globalAlpha = 0.1; ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 1; ctx.beginPath(); line3(ctx, [L.x, L.y, cam.z + 6], [L.x, L.y, cam.z + 220], cam); ctx.stroke();
    for (let k = 0; k < 3; k++) { const z = cam.z + 8 + ((L.ph + k * 71 + t * L.sp) % 220); const isRed = L.red && threat > hash(k + L.ph);
      const a = proj2([L.x, L.y, z], cam), b = proj2([L.x, L.y, z - 2.5], cam); if (!a || !b) continue;
      ctx.globalAlpha = 0.9 * clamp(1 - (z - cam.z) / 220); ctx.strokeStyle = isRed ? '#ff5a48' : '#bfe3ff'; ctx.lineWidth = Math.max(1, a.s / 120); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      glow(ctx, isRed ? sprites.threat : sprites.ice, a.x, a.y, Math.max(8, a.s / 6), 0.8 * clamp(1 - (z - cam.z) / 220)); }
  }
  // data arcs between towers
  for (const A of CITY.arcs) {
    const k = ((t - A.t0) % 3.2 + 3.2) % 3.2 / A.dur; if (k > 1.6) continue;
    const p0 = [A.a.x, -A.a.h, A.a.z], p1 = [A.b.x, -A.b.h, A.b.z], hh = Math.min(p0[1], p1[1]) - 6 - Math.hypot(p0[0] - p1[0], p0[2] - p1[2]) * 0.25;
    const at = u => [lerp(p0[0], p1[0], u), (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * hh + u * u * p1[1], lerp(p0[2], p1[2], u)];
    const isRed = A.red && threat > 0.5, head = clamp(k), tail = clamp(k - 0.5), fade = 1 - ss(1.1, 1.6, k);
    ctx.beginPath(); let ok = false; for (let s = 0; s <= 20; s++) { const p = proj2(at(lerp(tail, head, s / 20)), cam); if (!p) continue; ok ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); ok = true; }
    ctx.globalAlpha = 0.55 * fade; ctx.strokeStyle = isRed ? '#ff6a58' : '#8fd0ff'; ctx.lineWidth = 1.3; ctx.stroke();
    const hp = proj2(at(head), cam); if (hp && k < 1) glow(ctx, isRed ? sprites.threat : sprites.ice, hp.x, hp.y, Math.max(10, hp.s / 4), fade);
  }
  // threat infection rings on the ground plane (visible from the aerial)
  for (const R of CITY.rings) { const e = (t - R.t0) / 2.6; if (e < 0 || e > 1) continue;
    ctx.beginPath(); let ok = false; for (let s = 0; s <= 40; s++) { const a = s / 40 * 6.283, p = proj2([R.x + Math.cos(a) * 26 * easeOut(e), -0.2, R.z + Math.sin(a) * 26 * easeOut(e)], cam); if (!p) { ok = false; continue; } ok ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); ok = true; }
    ctx.globalAlpha = 0.5 * (1 - e); ctx.strokeStyle = '#ff5a48'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // haze
  const hzG = ctx.createLinearGradient(0, hy - 220, 0, hy + 140); hzG.addColorStop(0, 'rgba(20,32,48,0)'); hzG.addColorStop(0.6, 'rgba(24,36,54,0.35)'); hzG.addColorStop(1, 'rgba(10,14,20,0)');
  ctx.fillStyle = hzG; ctx.fillRect(0, hy - 220, W, 360);
  // silver particles begin gathering (bridge into the fox)
  const g = ss(8.6, 10.4, t);
  if (g > 0) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 700; i++) { const a = hash(i) * 6.283, r0 = 900 * (0.3 + hash(i + 7)), rr = r0 * (1 - easeInOut(g) * 0.85);
    glow(ctx, i % 5 ? sprites.silver : sprites.ice, W / 2 + Math.cos(a + g * 1.5) * rr, H / 2 + Math.sin(a + g * 1.5) * rr * 0.6, 7, g * 0.8); } ctx.globalCompositeOperation = 'source-over'; }
}

// ---------------------------------------------------------------- Full-body particle fox (procedural, walking)
let FOXB = null;
function buildFoxBody() {
  const r = rng(77), P = [];
  const sph = () => { const th = r() * 6.283, z = 2 * r() - 1, s = Math.sqrt(1 - z * z); return [s * Math.cos(th), s * Math.sin(th), z]; };
  const add = (part, n, extra = {}) => { for (let i = 0; i < n; i++) P.push(Object.assign({ part, d: sph(), u: r(), v: r(), w: r(), s: r() }, extra)); };
  add('body', 1500); add('chest', 420); add('neck', 360); add('head', 520); add('snout', 260); add('earL', 110); add('earR', 110); add('tail', 900);
  for (const leg of ['FL', 'FR', 'BL', 'BR']) add('leg' + leg, 240);
  for (let i = P.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [P[i], P[j]] = [P[j], P[i]]; }
  FOXB = P;
}
const FLOOR_Y = 1.0;
const ELL = { body: [[-0.05, -0.02, 0], [0.86, 0.32, 0.28]], chest: [[0.55, 0.04, 0], [0.36, 0.36, 0.27]], neck: [[0.93, -0.27, 0], [0.24, 0.31, 0.2]], head: [[1.2, -0.52, 0], [0.27, 0.21, 0.21]] };
const LEGS = { FL: [0.62, 0.14, 0.15, 0], FR: [0.62, 0.14, -0.15, Math.PI], BL: [-0.6, 0.12, 0.15, Math.PI], BR: [-0.6, 0.12, -0.15, 0] };
// Returns [pos, normal, tone] for one sample at walk phase ph (local fox space: +x forward, y down).
function foxSample(q, ph, bob) {
  const part = q.part;
  if (ELL[part]) { const [c, rr] = ELL[part], d = q.d; const p = [c[0] + d[0] * rr[0], c[1] + d[1] * rr[1] + bob, c[2] + d[2] * rr[2]];
    const n = [d[0] / rr[0], d[1] / rr[1], d[2] / rr[2]], l = Math.hypot(...n); const belly = part === 'body' || part === 'chest' ? clamp(d[1]) : 0;
    return [p, n.map(v => v / l), 0.85 + 0.35 * belly]; }
  if (part === 'snout') { const u = q.u, a = q.v * 6.283, rad = 0.14 * (1 - u) + 0.025, c = [1.36 + u * 0.42, -0.5 + u * 0.08 + bob, 0];
    return [[c[0], c[1] + Math.sin(a) * rad * 0.85, Math.cos(a) * rad], [0.25, Math.sin(a), Math.cos(a)], u > 0.9 ? 0.25 : 0.95]; }
  if (part === 'earL' || part === 'earR') { const z = part === 'earL' ? 1 : -1; let a = q.u, b = q.v; if (a + b > 1) { a = 1 - a; b = 1 - b; }
    const A = [1.08, -0.66, 0.15 * z], B = [1.3, -0.68, 0.09 * z], Cc = [1.14, -1.02, 0.17 * z];
    return [[A[0] + a * (B[0] - A[0]) + b * (Cc[0] - A[0]), A[1] + a * (B[1] - A[1]) + b * (Cc[1] - A[1]) + bob, A[2] + a * (B[2] - A[2]) + b * (Cc[2] - A[2])], [0.3, -0.3, z * 0.9], q.w > 0.5 ? 1 : 0.45]; }
  if (part === 'tail') { const u = q.u, sway = 0.12 * Math.sin(ph * 0.5 + u * 2.2) * u;
    const c = [-0.86 - 1.1 * u, -0.06 + 0.42 * u - 0.12 * u * u + bob * (1 - u), sway];
    const rad = (0.06 + 0.24 * Math.sin(Math.PI * Math.pow(u, 0.8)) * (0.45 + 0.55 * u)) * (u > 0.95 ? (1 - u) * 20 : 1); const a = q.v * 6.283;
    return [[c[0], c[1] + Math.sin(a) * rad, c[2] + Math.cos(a) * rad], [0, Math.sin(a), Math.cos(a)], u > 0.84 ? 1.35 : 0.9]; }
  // legs
  const L = LEGS[part.slice(3)], phase = ph + L[3], swing = 0.42 * Math.sin(phase), lift = Math.max(0, Math.sin(phase + 1.6));
  const hip = [L[0], L[1] + bob, L[2]], a1 = swing, a2 = swing + (L[0] > 0 ? -0.55 : 0.55) * lift - (L[0] > 0 ? 0 : 0.25);
  const knee = [hip[0] + Math.sin(a1) * 0.43, hip[1] + Math.cos(a1) * 0.43, hip[2]];
  const foot = [knee[0] + Math.sin(a2) * 0.43, knee[1] + Math.cos(a2) * 0.43, hip[2]];
  const u = q.u, c = u < 0.5 ? [lerp(hip[0], knee[0], u * 2), lerp(hip[1], knee[1], u * 2), hip[2]] : [lerp(knee[0], foot[0], u * 2 - 1), lerp(knee[1], foot[1], u * 2 - 1), hip[2]];
  const rad = lerp(0.1, 0.04, u), a = q.v * 6.283;
  return [[c[0] + Math.cos(a) * rad, c[1], c[2] + Math.sin(a) * rad], [Math.cos(a), 0, Math.sin(a)], u > 0.8 ? 0.35 : 0.8];
}
// Draws the fox. place = {x,y,z,yaw,scale}; returns screen positions when collect is set.
function drawFoxBody(ctx, cam, place, ph, opts = {}) {
  const { alpha = 1, form = 1, light = [-0.4, -0.7, -0.55], reflect = 0.18, collect = null, seed = 0 } = opts;
  const bob = 0.025 * Math.sin(ph * 2), sc = place.scale || 1;
  const ln = Math.hypot(...light), Ld = light.map(v => v / ln);
  ctx.globalCompositeOperation = 'lighter';
  const n = FOXB.length;
  for (let i = 0; i < n; i++) {
    const q = FOXB[i]; const [lp, nn, tone] = foxSample(q, ph, bob);
    let p = rotY([lp[0] * sc, lp[1] * sc, lp[2] * sc], place.yaw); p = [p[0] + place.x, p[1] + place.y, p[2] + place.z];
    if (form < 1) { const k = easeInOut(clamp((form * 1.6 - q.s * 0.6))); const sd = [hash(i + seed) - 0.5, hash(i * 3 + seed) - 0.5, hash(i * 7 + seed) - 0.5];
      p = [lerp(p[0] + sd[0] * 9, p[0], k), lerp(p[1] + sd[1] * 5, p[1], k), lerp(p[2] + sd[2] * 9, p[2], k)]; }
    const pr = proj2(p, cam); if (!pr) continue;
    const nw = rotY(nn, place.yaw); const dif = clamp(-(nw[0] * Ld[0] + nw[1] * Ld[1] + nw[2] * Ld[2]));
    const vd = camXf(p, cam), vl = Math.hypot(...vd); const rim = Math.pow(1 - Math.abs((nw[0] * vd[0] + nw[1] * vd[1] + nw[2] * vd[2]) / vl), 3);
    const b = clamp((0.12 + 0.7 * dif + 0.55 * rim) * tone, 0, 1.4);
    const sz = Math.max(1.1, 0.026 * pr.s) * (form < 1 ? 1 + (1 - form) : 1);
    if (collect) collect[i] = [pr.x, pr.y, b];
    ctx.globalAlpha = alpha * clamp(0.25 + b * 0.75) * (0.75 + 0.25 * Math.sin(q.s * 80 + ph));
    ctx.fillStyle = b > 1.05 ? '#ffffff' : rim > 0.45 ? '#bfe3ff' : '#c6d1dc';
    ctx.fillRect(pr.x - sz / 2, pr.y - sz / 2, sz, sz);
    if (q.s > 0.93) glow(ctx, sprites.ice, pr.x, pr.y, sz * 5, alpha * 0.35 * b);
    if (reflect > 0 && i % 2 === 0) { const rp = proj2([p[0], 2 * (place.y + FLOOR_Y * sc) - p[1], p[2]], cam); if (rp) { ctx.globalAlpha = alpha * reflect * b * 0.6; ctx.fillRect(rp.x - sz / 2, rp.y - sz / 2, sz, sz); } }
  }
  // eye glints
  for (const z of [0.1, -0.1]) { let e = rotY([1.36 * sc, (-0.6 + bob) * sc, z * sc], place.yaw); e = [e[0] + place.x, e[1] + place.y, e[2] + place.z]; const pe = proj2(e, cam);
    if (pe) glow(ctx, sprites.ice, pe.x, pe.y, Math.max(10, 0.22 * pe.s), alpha * form * 0.9); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function floor3D(ctx, cam, cx, cz, a, span = 26) {
  ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = '#7cc4ff';
  const x0 = Math.floor(cx) - span, z0 = Math.floor(cz) - 4;
  for (let i = 0; i <= span * 2; i++) { const x = x0 + i; ctx.globalAlpha = a * 0.13 * clamp(1 - Math.abs(x - cx) / span); ctx.beginPath(); line3(ctx, [x, FLOOR_Y, z0], [x, FLOOR_Y, z0 + 40], cam); ctx.stroke(); }
  for (let j = 0; j <= 40; j++) { const z = z0 + j; ctx.globalAlpha = a * 0.13 * clamp(1 - (z - cam.z) / 34); ctx.beginPath(); line3(ctx, [x0, FLOOR_Y, z], [x0 + span * 2, FLOOR_Y, z], cam); ctx.stroke(); }
  ctx.restore();
}
function dataPillars(ctx, cam, t, a, cx = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const x = Math.floor(cx / 30) * 30 + (hash(i) - 0.5) * 60 + (i % 2) * 30, z = 4 + hash(i + 3) * 26;
    const top = proj2([x, -9, z], cam), bot = proj2([x, FLOOR_Y, z], cam); if (!top || !bot) continue;
    const g = ctx.createLinearGradient(0, top.y, 0, bot.y); g.addColorStop(0, 'rgba(124,196,255,0)'); g.addColorStop(1, `rgba(124,196,255,${0.22 * a})`);
    ctx.fillStyle = g; const w = Math.max(1, 0.05 * bot.s); ctx.fillRect(bot.x - w / 2, top.y, w, bot.y - top.y);
    for (let k = 0; k < 6; k++) { const y = -9 + ((k * 1.7 + t * (1.5 + hash(i) * 2)) % 10); const p = proj2([x, y, z], cam); if (p) glow(ctx, sprites.ice, p.x, p.y, Math.max(4, 0.12 * p.s), a * 0.6); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- SCENE 2a · The Fox Awakens — formation + macro eye (10.1 – 15.0)
function sceneAwaken(ctx, T) {
  const t = T - 10.1;
  sceneFox(ctx, 6.8 + 1.0 + t * 1.42);           // particles form the faceted head (shared with the first film)
  // extreme close-up: push into the left eye
  const z = ss(2.9, 4.9, t);
  if (z > 0) {
    const R = 2.25, eye = [-0.34 * R, -0.06 * R, (foxDepth(-0.34, -0.06) - 0.05) * R];
    const cam = { d: lerp(4.2, 0.95, easeInOut(z)), f: 1000 };
    const xf = p => rotY([p[0] * R - eye[0], p[1] * R - eye[1], p[2] * R - eye[2]], 0.12 * (1 - z));
    ctx.save(); ctx.globalAlpha = z; ctx.fillStyle = '#05080d'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const light = [0.35, -0.5, 0.79];
    drawFoxSolid(ctx, xf, cam, z, light, 0.2, 0);
    ctx.save(); ctx.globalAlpha = 0.35 * z; ctx.fillStyle = '#05080d'; ctx.fillRect(0, 0, W, H); ctx.restore();
    // the iris: a living HUD
    const e = project([0, 0, -0.05], cam), rr = 0.23 * e.s;
    ctx.save(); ctx.globalAlpha = z; ctx.globalCompositeOperation = 'lighter';
    glow(ctx, sprites.ice, e.x, e.y, rr * 5, 0.45); glow(ctx, sprites.white, e.x, e.y, rr * 0.9, 0.55);
    ctx.strokeStyle = '#bfe3ff'; ctx.lineWidth = Math.max(1, rr * 0.012);
    for (let k = 0; k < 3; k++) { ctx.globalAlpha = z * (0.55 - k * 0.12); ctx.beginPath(); ctx.arc(e.x, e.y, rr * (0.9 + k * 0.45), t * (0.6 - k * 0.5), t * (0.6 - k * 0.5) + 4.6); ctx.stroke(); }
    for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283 + t * 0.2; ctx.globalAlpha = z * 0.35; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * rr * 0.55, e.y + Math.sin(a) * rr * 0.55); ctx.lineTo(e.x + Math.cos(a) * rr * (0.75 + 0.1 * hash(k)), e.y + Math.sin(a) * rr * (0.75 + 0.1 * hash(k))); ctx.stroke(); }
    ctx.restore();
  }
}
// ---------------------------------------------------------------- SCENE 2b · The walk (14.8 – 21.0)
function sceneWalk(ctx, T) {
  const t = T - 14.8, speed = 1.25, fx = t * speed;
  bg(ctx, [12, 18, 28], [2, 3, 6], W * 0.6, H * 0.45);
  const cam = { x: fx + lerp(0.2, 1.5, easeInOut(t / 6.2)), y: lerp(-0.1, 0.25, t / 6.2), z: lerp(-4.6, -3.6, easeInOut(t / 6.2)), yaw: lerp(-0.05, -0.28, easeInOut(t / 6.2)), pitch: -0.03, f: 1000 };
  dataPillars(ctx, cam, t, 0.9, fx);
  floor3D(ctx, cam, cam.x, cam.z, 1);
  // doorway of light ahead (into the operations centre)
  const door = ss(3.6, 6.0, t); if (door > 0) { const p = proj2([fx + 7, -1.2, 2.5], cam); if (p) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, sprites.soft, p.x, p.y, 1400 * door, 0.5 * door); ctx.globalAlpha = door * 0.7; const gw = 0.9 * p.s, gh = 3.6 * p.s; const g = ctx.createLinearGradient(p.x - gw / 2, 0, p.x + gw / 2, 0);
    g.addColorStop(0, 'rgba(180,215,255,0)'); g.addColorStop(0.5, 'rgba(225,240,255,0.9)'); g.addColorStop(1, 'rgba(180,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - gw / 2, p.y - gh / 2, gw, gh); ctx.restore(); } }
  drawFoxBody(ctx, cam, { x: fx, y: 0, z: 0, yaw: 0, scale: 1 }, t * 2 * Math.PI * 0.85, { form: ss(0, 1.3, t) * 0.5 + 0.5, light: [-0.3, -0.8, 0.5], seed: 3 });
}

// ---------------------------------------------------------------- SCENE 3 · Security operations (20.5 – 35.4)
let HALL = null;
function buildHall() { const P = [];
  for (const tier of [-0.35, -2.15]) for (let i = 0; i < 9; i++) { const a = -1.15 + i / 8 * 2.3; P.push({ a, y: tier, seed: i * 7 + (tier < -1 ? 50 : 0) }); }
  HALL = P; }
function hallPanel(ctx, cam, pn, t, alpha, mirror = false) {
  const C0 = [0, 0, 3.2], R = 6.6, w = 2.25, h = 1.45, a = pn.a;
  const c = [C0[0] + Math.sin(a) * R, pn.y, C0[2] + Math.cos(a) * R], right = [Math.cos(a), 0, -Math.sin(a)];
  const my = y => mirror ? 2 * FLOOR_Y - y : y;
  const corner = (u, v) => [c[0] + right[0] * (u - 0.5) * w, my(c[1] + (v - 0.5) * h), c[2] + right[2] * (u - 0.5) * w];
  const P = [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)];
  if (!polyPath(ctx, P, cam)) return;
  ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(28,40,56,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(160,205,255,0.55)'; ctx.lineWidth = 1; ctx.stroke();
  const at = (u, v) => proj2(corner(u, v), cam);
  ctx.globalCompositeOperation = 'lighter';
  const kind = pn.seed % 4;
  ctx.strokeStyle = 'rgba(124,196,255,0.8)'; ctx.fillStyle = 'rgba(200,225,250,0.7)';
  const hd = [at(0.06, 0.12), at(0.4, 0.12)]; if (hd[0] && hd[1]) { ctx.beginPath(); ctx.moveTo(hd[0].x, hd[0].y); ctx.lineTo(hd[1].x, hd[1].y); ctx.lineWidth = 2; ctx.stroke(); }
  ctx.lineWidth = 1.2;
  if (kind === 0) { ctx.beginPath(); for (let s = 0; s <= 30; s++) { const u = s / 30, v = 0.75 - 0.45 * (0.5 + 0.5 * Math.sin(u * 8 + t * 1.5 + pn.seed)) * (0.4 + 0.6 * hash(Math.floor(u * 30) + pn.seed)); const p = at(0.06 + u * 0.88, v); if (p) s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke(); }
  else if (kind === 1) { for (let r = 0; r < 5; r++) { const L = 0.2 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.8 + r + pn.seed)); const p0 = at(0.06, 0.3 + r * 0.13), p1 = at(0.06 + L * 0.85, 0.3 + r * 0.13); if (p0 && p1) { ctx.globalAlpha = alpha * 0.6; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineWidth = Math.max(1, 0.05 * p0.s * 0.3); ctx.stroke(); } } }
  else if (kind === 2) { const p = at(0.5, 0.55); if (p) { ctx.globalAlpha = alpha * 0.7; ctx.lineWidth = 1.2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(p.x, p.y, 0.25 * p.s * (1 + k * 0.4) * Math.abs(Math.cos(a)) + 2, 0.25 * p.s * (1 + k * 0.4), 0, t + k, t + k + 4.5); ctx.stroke(); } } }
  else { for (let r = 0; r < 6; r++) for (let q = 0; q < 8; q++) { if (hash(r * 8 + q + pn.seed + Math.floor(t * 3)) > 0.35) continue; const p = at(0.08 + q * 0.11, 0.3 + r * 0.11); if (p) { ctx.globalAlpha = alpha * 0.8; ctx.fillRect(p.x - 2, p.y - 1, Math.max(2, 0.06 * p.s), 2); } } }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function sceneHall(ctx, T) {
  const t = T - 20.5;
  bg(ctx, [16, 24, 36], [2, 3, 6], W / 2, H * 0.42);
  const k = easeInOut(t / 3.0);
  const cam = { x: lerp(-1.2, 0.3, k), y: lerp(-2.6, -1.05, k), z: lerp(-8.5, -6.2, k), yaw: lerp(0.12, -0.02, k), pitch: lerp(0.16, 0.02, k), f: 1000 };
  ctx.globalCompositeOperation = 'lighter'; const c = proj2([0, -1.2, 6], cam); if (c) glow(ctx, sprites.soft, c.x, c.y, 2000, 0.45); ctx.globalCompositeOperation = 'source-over';
  floor3D(ctx, cam, 0, cam.z, 1, 14);
  for (const pn of HALL) hallPanel(ctx, cam, pn, t, 0.18, true);
  for (const pn of HALL) hallPanel(ctx, cam, pn, t, ss(0, 1.2, t - Math.abs(pn.a) * 0.3));
  // the fox walks into the centre of the room
  const fz = lerp(-4.8, -0.6, easeOut(t / 3.2)), ph = t * 2 * Math.PI * 0.85 * (1 - 0.6 * ss(2.4, 3.2, t));
  drawFoxBody(ctx, cam, { x: 0.15, y: 0, z: fz, yaw: -Math.PI / 2, scale: 0.85 }, ph, { light: [0.2, -0.8, 0.6], seed: 5 });
  // brand title over the room
  const A = win(t, 0.25, 3.0, 0.5, 0.45);
  if (A > 0) revealText(ctx, 'SILVERFOXNS', W / 2 + 8, H / 2 - 200, { weight: 500, size: 74, tracking: 22, p: clamp((t - 0.25) / 1.0), fill: 'silver', sweep: (t - 1.1) / 1.4, alpha: A });
  if (A > 0) revealText(ctx, 'CYBERSECURITY  ·  DIGITAL INTELLIGENCE', W / 2 + 5, H / 2 - 146, { weight: 400, size: 17, family: FONT_M, tracking: 7, p: clamp((t - 0.8) / 1.0), fill: '#8fb8dc', alpha: A, rise: 6 });
}
// Module 1 — security assessments
function assessPanel(ctx, x, y, w, h, t, a) {
  glass(ctx, x, y, w, h, a, 22, 1.15);
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.clip();
  setFont(ctx, 500, 13, FONT_M, 4); ctx.fillStyle = '#7cc4ff'; ctx.fillText('SECURITY ASSESSMENT', x + 44, y + 52);
  setFont(ctx, 300, 34, FONT_D, 1); ctx.fillStyle = '#e3e9ef'; ctx.fillText('Attack surface review', x + 44, y + 96);
  const items = ['Perimeter & exposed services', 'Web application review', 'Configuration audit', 'Access control review', 'Risk prioritisation'];
  items.forEach((s, i) => { const t0 = 0.3 + i * 0.42, k = clamp((t - t0) / 0.42), done = t > t0 + 0.42, by = y + 150 + i * 62;
    ctx.globalAlpha = a * clamp((t - t0 + 0.3) / 0.3); ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.beginPath(); ctx.roundRect(x + 44, by, 520, 48, 10); ctx.fill();
    setFont(ctx, 400, 17, FONT_T, 0.3); ctx.fillStyle = '#d5dee7'; ctx.fillText(s, x + 92, by + 30);
    if (done) { ctx.fillStyle = '#7cc4ff'; ctx.beginPath(); ctx.arc(x + 68, by + 24, 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#0a0f16'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x + 63, by + 24); ctx.lineTo(x + 67, by + 28); ctx.lineTo(x + 74, by + 19); ctx.stroke();
      setFont(ctx, 500, 11, FONT_M, 2); ctx.fillStyle = '#7f93a8'; ctx.fillText('REVIEWED', x + 470, by + 29); }
    else if (k > 0) { ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 68, by + 24, 9, t * 8, t * 8 + 4.2); ctx.stroke();
      ctx.fillStyle = 'rgba(124,196,255,0.7)'; ctx.fillRect(x + 92, by + 40, 380 * k, 2); } });
  ctx.globalAlpha = a;
  // likelihood × impact matrix
  const mx = x + 620, my = y + 150, cs = 58;
  setFont(ctx, 500, 11, FONT_M, 2.5); ctx.fillStyle = '#7f8e9e'; ctx.fillText('LIKELIHOOD × IMPACT', mx, my - 18);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const sev = (i + (4 - j)) / 8, k = clamp((t - 0.6 - (i + j) * 0.06) / 0.4);
    const col = sev < 0.45 ? [62, 86, 112] : sev < 0.75 ? [132, 150, 170] : [188, 112, 102];
    ctx.globalAlpha = a * k * (0.25 + 0.5 * sev); ctx.fillStyle = rgba(col, 1); ctx.beginPath(); ctx.roundRect(mx + i * (cs + 6), my + j * (cs + 6), cs, cs, 6); ctx.fill(); }
  for (const [i, j, d] of [[1, 3, 1.4], [3, 1, 1.9], [2, 2, 2.3]]) { const k = clamp((t - d) / 0.3); if (k <= 0) continue; const cx = mx + i * (cs + 6) + cs / 2, cy = my + j * (cs + 6) + cs / 2;
    ctx.globalAlpha = a * k; ctx.fillStyle = '#eef4fa'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill();
    ctx.globalAlpha = a * k * (1 - ((t - d) * 1.2) % 1); ctx.strokeStyle = '#eef4fa'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 7 + 22 * (((t - d) * 1.2) % 1), 0, 7); ctx.stroke(); }
  ctx.restore();
}
function sceneAssess(ctx, T) {
  const t = T - 23.0;
  bg(ctx, [14, 20, 30], [2, 3, 6], W / 2, H * 0.4);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W / 2, H * 0.45, 1700, 0.3); ctx.globalCompositeOperation = 'source-over';
  const s = lerp(0.94, 1.02, easeInOut(t / 3.3)), dx = lerp(40, -30, easeInOut(t / 3.3));
  ctx.save(); ctx.translate(W / 2 + dx, H / 2 - 40); ctx.scale(s, s); ctx.translate(-480, -270); assessPanel(ctx, 0, 0, 960, 520, t, ss(0, 0.5, t)); ctx.restore();
  caption(ctx, T, 23.25, 26.1, '01', 'SECURITY ASSESSMENTS', 'Identifying risk before it becomes an incident');
}
// Module 2 — threat intelligence & exposure monitoring (globe from the first film + exposure feed)
function sceneIntel(ctx, T) {
  sceneGlobe(ctx, 15.0 + 2.0 + (T - 26.0) * 1.15);
  const t = T - 26.0, x = W - 560, y = BAR + 70;
  const A = win(t, 0.3, 3.5, 0.4, 0.4); if (A <= 0) return;
  ctx.save(); glass(ctx, x, y, 420, 230, A * 0.95, 16);
  ctx.globalAlpha = A; setFont(ctx, 500, 12, FONT_M, 3.5); ctx.fillStyle = '#7cc4ff'; ctx.fillText('EXPOSURE MONITOR', x + 26, y + 38);
  const feed = [['Credential mention detected', 'REVIEW'], ['New subdomain discovered', 'MAPPED'], ['Open service observed', 'FLAGGED'], ['Certificate change', 'LOGGED']];
  feed.forEach(([s, tag], i) => { const k = clamp((t - 0.6 - i * 0.5) / 0.35); if (k <= 0) return; const by = y + 70 + i * 38;
    ctx.globalAlpha = A * k; ctx.fillStyle = i === 0 ? '#ff7a66' : '#7cc4ff'; ctx.beginPath(); ctx.arc(x + 32, by - 5, 4, 0, 7); ctx.fill();
    setFont(ctx, 400, 15, FONT_T, 0.2); ctx.fillStyle = '#d5dee7'; ctx.fillText(s, x + 48, by);
    setFont(ctx, 500, 10, FONT_M, 2); ctx.fillStyle = '#7f93a8'; ctx.fillText(tag, x + 330, by); });
  ctx.restore();
  caption(ctx, T, 26.2, 29.2, '02', 'THREAT INTELLIGENCE', 'Exposure monitoring  ·  Early warning');
}
// Module 3 — digital investigations & dark web awareness
const INV = [['CASE', 0, 0], ['DOMAIN', -330, -150], ['EMAIL', -380, 60], ['IP ADDRESS', -150, 210], ['USERNAME', 210, -200], ['FORUM POST', 360, -10], ['PASTE SITE', 260, 200], ['LEAK MENTION', 40, -260]];
const INV_E = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [4, 5], [5, 6], [4, 7], [2, 7], [3, 6]];
function sceneInvestigate(ctx, T) {
  const t = T - 29.2;
  bg(ctx, [12, 17, 26], [2, 2, 5], W / 2, H * 0.48);
  const cx = W / 2 + 140, cy = H / 2 - 30, s = lerp(1.0, 1.14, easeInOut(t / 3.2)), rot = t * 0.05;
  // depth layers: surface / deep / dark
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const layers = [['SURFACE WEB', 300], ['DEEP WEB', 410], ['DARK WEB', 520]];
  layers.forEach(([l, r], i) => { const k = ss(0.1 + i * 0.25, 0.8 + i * 0.25, t);
    ctx.globalAlpha = k * (i === 2 ? 0.55 : 0.3); ctx.strokeStyle = i === 2 ? '#a87a8a' : '#7cc4ff'; ctx.lineWidth = 1; ctx.setLineDash(i === 2 ? [3, 7] : [2, 10]);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.62, 0, rot * (i + 1), rot * (i + 1) + 6.283); ctx.stroke(); ctx.setLineDash([]);
    setFont(ctx, 500, 14, FONT_M, 4); ctx.fillStyle = i === 2 ? '#c9a3b0' : '#8ea3b8'; ctx.globalAlpha = k * 0.9; ctx.fillText(l, r * 0.72, -r * 0.62 * 0.72); });
  // scanning sweep on the dark layer
  const sw = t * 1.4; ctx.globalCompositeOperation = 'lighter'; const g = ctx.createConicGradient ? ctx.createConicGradient(sw, 0, 0) : null;
  if (g) { g.addColorStop(0, 'rgba(124,196,255,0.16)'); g.addColorStop(0.08, 'rgba(124,196,255,0)'); g.addColorStop(1, 'rgba(124,196,255,0)'); ctx.globalAlpha = ss(0.6, 1.2, t); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 520, 322, 0, 0, 7); ctx.fill(); }
  for (let i = 0; i < 40; i++) { const a = hash(i) * 6.283 + rot * 3, r = 440 + hash(i + 5) * 70, px = Math.cos(a) * r, py = Math.sin(a) * r * 0.62; const ping = Math.max(0, Math.cos(a - sw)) ** 30;
    glow(ctx, hash(i + 9) > 0.8 ? sprites.threat : sprites.silver, px, py, 10 + 30 * ping, (0.25 + 0.75 * ping) * ss(0.6, 1.2, t)); }
  ctx.globalCompositeOperation = 'source-over';
  // entity graph
  INV_E.forEach(([i, j], n) => { const k = easeOut((t - 0.4 - n * 0.12) / 0.5); if (k <= 0) return; const A = INV[i], B = INV[j];
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#9fb7cf'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(A[1], A[2]); ctx.lineTo(lerp(A[1], B[1], k), lerp(A[2], B[2], k)); ctx.stroke(); });
  INV.forEach(([l, x, y], i) => { const k = easeOut((t - 0.2 - i * 0.14) / 0.45); if (k <= 0) return; const main = i === 0, alert = l === 'LEAK MENTION';
    ctx.globalAlpha = k; ctx.globalCompositeOperation = 'lighter'; glow(ctx, alert ? sprites.threat : sprites.ice, x, y, main ? 120 : 60, 0.5); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = main ? '#e9f1f8' : alert ? '#ff7a66' : '#7cc4ff'; ctx.beginPath(); ctx.arc(x, y, main ? 12 : 7, 0, 7); ctx.fill();
    setFont(ctx, 500, main ? 17 : 14, FONT_M, 3); ctx.fillStyle = main ? '#e9f1f8' : '#c3cfda'; ctx.textAlign = 'center'; ctx.fillText(l, x, y + (main ? 34 : 26)); ctx.textAlign = 'left'; });
  ctx.restore(); ctx.globalAlpha = 1;
  caption(ctx, T, 29.4, 32.3, '03', 'DIGITAL INVESTIGATIONS', 'Dark web awareness  ·  Connecting the evidence');
}
// Module 4 — secure networks & digital protection (encrypted tunnel + lock from the first film)
function sceneSecure(ctx, T) {
  sceneTunnel(ctx, 22.9 + 3.0 + (T - 32.2));
  caption(ctx, T, 32.4, 35.2, '04', 'SECURE NETWORKS', 'Digital protection, end to end');
}

// ---------------------------------------------------------------- SCENE 4 · Through the reflection (35.2 – 43.2)
function sceneReflect(ctx, T) {
  const t = T - 35.2;
  bg(ctx, [16, 22, 32], [2, 3, 6], W / 2, H * 0.45);
  const R = 2.3, z = ss(0.9, 1.95, t);
  const eye = [-0.34 * R, -0.06 * R, (foxDepth(-0.34, -0.06) - 0.05) * R];
  const off = [eye[0] * z, eye[1] * z, eye[2] * z], yaw = lerp(0.42, 0.18, easeInOut(t / 2));
  const cam = { d: lerp(6.4, 0.9, easeInOut(z)), f: 1000 };
  const xf = p => rotY([p[0] * R - off[0], p[1] * R - off[1], p[2] * R - off[2]], yaw * (1 - z));
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W / 2, H / 2, 1500, 0.4); ctx.globalCompositeOperation = 'source-over';
  const light = [Math.sin(t * 0.9 - 0.6) * 0.6, -0.5, 0.75];
  drawFoxSolid(ctx, xf, cam, 1, light, 0.25, 1);
  // UI reflections sliding across the metal (clipped to the fox silhouette)
  ctx.save(); ctx.beginPath();
  for (const f of FOX_FACETS) { const P = f.pts.map(p => project(xf(p), cam)); if (P.some(q => !q)) continue; ctx.moveTo(P[0].x, P[0].y); ctx.lineTo(P[1].x, P[1].y); ctx.lineTo(P[2].x, P[2].y); ctx.closePath(); }
  ctx.clip(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const x = W / 2 - 700 + ((i * 330 + t * 420) % 1600), y = H / 2 - 260 + hash(i) * 380;
    ctx.globalAlpha = 0.16; ctx.strokeStyle = '#cfe8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, 260, 160, 12); ctx.stroke();
    ctx.fillStyle = 'rgba(124,196,255,0.25)'; for (let r = 0; r < 4; r++) ctx.fillRect(x + 20, y + 30 + r * 28, 160 * (0.5 + 0.5 * hash(i * 4 + r)), 6); }
  ctx.restore();
  const fl = ss(1.6, 2.0, t); if (fl > 0) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.white, W / 2, H / 2, 2400 * fl, fl); ctx.globalCompositeOperation = 'source-over'; }
}
function sceneWebB(ctx, T) { sceneWeb(ctx, 30.2 + 1.2 + (T - 36.9) * 1.15); caption(ctx, T, 37.1, 39.6, '', 'WEB DEVELOPMENT', 'Modern, secure websites and software'); }
function sceneBizB(ctx, T) { sceneBusiness(ctx, 37.2 + 0.5 + (T - 39.5) * 1.75);
  caption(ctx, T, 39.7, 41.5, '', 'CRM PLATFORMS', 'Customer relationships, intelligently managed');
  caption(ctx, T, 41.5, 43.2, '', 'BUSINESS AUTOMATION', 'Intelligent workflows that run themselves'); }

// ---------------------------------------------------------------- SCENE 5 · Founder interview (43.0 – 52.3)
function sceneFounderInterview(ctx, T) {
  const t = T - 43.0;
  // office backdrop: soft window light + defocused practicals
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0b0f15'); g.addColorStop(0.62, '#141b25'); g.addColorStop(1, '#1d2633'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) { const x = W * 0.66 + i * 70 + Math.sin(i) * 20 - t * 6, y0 = 0; ctx.globalAlpha = 0.05; ctx.fillStyle = '#cfe0f0'; ctx.fillRect(x, y0, 26, H); }
  for (let i = 0; i < 18; i++) { const x = hash(i) * W, y = H * (0.2 + hash(i + 4) * 0.6), r = 30 + hash(i + 8) * 70; glow(ctx, hash(i + 2) > 0.55 ? sprites.soft : sprites.silver, x - t * (4 + hash(i) * 6), y, r * 2.4, 0.08 + 0.1 * hash(i + 3)); }
  ctx.restore();
  const src = window.__founderFrame;
  if (src && (src.naturalWidth || src.videoWidth)) {
    const iw = src.naturalWidth || src.videoWidth, ih = src.naturalHeight || src.videoHeight, push = 1 + 0.04 * clamp(t / 9.2), sc = Math.max(W / iw, H / ih) * push;
    ctx.drawImage(src, W / 2 - iw * sc / 2, H / 2 - ih * sc / 2, iw * sc, ih * sc);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(60,90,120,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  } else {
    // Placeholder until the genuine founder recording is supplied (assets/founder.mp4)
    const fw = 1000, fh = 562, fx = W / 2 - fw / 2, fy = H / 2 - fh / 2 - 20, A = ss(0.2, 0.9, t);
    ctx.save(); ctx.globalAlpha = A; ctx.fillStyle = 'rgba(6,9,14,0.55)'; ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = 'rgba(200,215,230,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(fx, fy, fw, fh);
    ctx.strokeStyle = 'rgba(124,196,255,0.9)'; ctx.lineWidth = 2; for (const [x, y, sx, sy] of [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x + sx * 34, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * 34); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(200,215,230,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(W / 2 - 34, fy + fh / 2 - 82, 52, 36, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W / 2 + 18, fy + fh / 2 - 70); ctx.lineTo(W / 2 + 36, fy + fh / 2 - 80); ctx.lineTo(W / 2 + 36, fy + fh / 2 - 48); ctx.lineTo(W / 2 + 18, fy + fh / 2 - 58); ctx.stroke();
    ctx.textAlign = 'center'; setFont(ctx, 500, 15, FONT_M, 6); ctx.fillStyle = '#9fb7cf'; ctx.fillText('FOUNDER INTERVIEW', W / 2, fy + fh / 2 + 4);
    setFont(ctx, 300, 22, FONT_T, 1); ctx.fillStyle = '#c9d3dc'; ctx.fillText('Genuine recording to be inserted', W / 2, fy + fh / 2 + 44);
    setFont(ctx, 400, 13, FONT_M, 2); ctx.fillStyle = '#6f8396'; ctx.fillText('assets/founder.mp4', W / 2, fy + fh / 2 + 76); ctx.textAlign = 'left'; ctx.restore();
  }
  // bottom shade for the lower third
  const sh = ctx.createLinearGradient(0, H * 0.55, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = sh; ctx.fillRect(0, H * 0.55, W, H * 0.45);
  // interview question
  const Q = win(t, 0.35, 4.6, 0.6, 0.6);
  if (Q > 0) { setFont(ctx, 500, 12, FONT_M, 5); ctx.globalAlpha = Q; ctx.fillStyle = '#7cc4ff'; ctx.fillText('INTERVIEW', 150, BAR + 92);
    revealText(ctx, 'Why did you build SILVERFOXNS?', 148, BAR + 138, { weight: 300, size: 34, tracking: 1.5, align: 'left', p: clamp((t - 0.45) / 1.2), fill: '#e6edf3', alpha: Q, rise: 8 }); }
  // lower third
  const L = win(t, 1.0, 9.0, 0.7, 0.6);
  if (L > 0) { const x = 150, y = H - BAR - 120;
    ctx.save(); ctx.globalAlpha = L; ctx.fillStyle = '#7cc4ff'; ctx.fillRect(x, y - 58, 3, 92 * easeOut((t - 1.0) / 0.6)); ctx.restore();
    revealText(ctx, 'NITHINKUMAR', x + 26, y - 12, { weight: 400, size: 46, tracking: 12, align: 'left', p: clamp((t - 1.1) / 1.0), fill: 'silver', alpha: L, sweep: (t - 2.0) / 1.5 });
    revealText(ctx, 'Founder – SILVERFOXNS', x + 28, y + 26, { weight: 400, size: 20, family: FONT_T, tracking: 4, align: 'left', p: clamp((t - 1.5) / 1.0), fill: '#a8b8c7', alpha: L, rise: 6 }); }
}

// ---------------------------------------------------------------- SCENE 6 · Signature reveal (52.0 – 60)
let LOGO_TARGETS = null, LOGO_IMG = null;   // set from a supplied logo (assets/logo.png) when available
function logoTarget(i) {
  if (LOGO_TARGETS && LOGO_TARGETS.length) { const q = LOGO_TARGETS[i % LOGO_TARGETS.length]; return [q[0], q[1], 1]; }
  const p = FOX_PTS[i % FOX_PTS.length].p; return [W / 2 + p[0] * 135, H / 2 - 175 + p[1] * 135, p[4] ? 1.2 : 0.8];
}
function sceneReveal(ctx, T) {
  const t = T - 52.0;
  bg(ctx, [14, 19, 27], [2, 3, 5], W / 2, H * 0.42);
  const cam = { x: 0, y: lerp(0.15, -0.35, easeInOut(t / 2.6)), z: -3.6, yaw: 0, pitch: lerp(-0.1, 0.0, t / 2.6), f: 1000 };
  const walkA = 1 - ss(2.4, 3.2, t);
  floor3D(ctx, cam, 0, cam.z + ((t * 0.9) % 1), 0.8 * walkA, 12);
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, sprites.soft, W / 2, H / 2 - 170, 1300, 0.45 * ss(3.4, 4.6, t)); godRays(ctx, W / 2, H / 2 - 170, t, 0.6 * ss(4.4, 5.2, t)); ctx.globalCompositeOperation = 'source-over';
  const ph = t * 2 * Math.PI * 0.55;                   // slow motion stride
  const fz = lerp(5.2, 2.1, easeOut(t / 3.0));
  const place = { x: lerp(1.2, 0.35, easeOut(t / 3.0)), y: 0, z: fz, yaw: Math.PI / 2 + 0.62, scale: 1 };
  const D0 = 2.35;                                      // dissolve begins
  if (t < D0 + 0.05) { drawFoxBody(ctx, cam, place, ph, { light: [0.3, -0.7, 0.65], reflect: 0.2 }); }
  else {
    const scr = new Array(FOXB.length); const tmp = document.createElement('canvas'); // positions captured without drawing
    drawFoxBody(tmpCtx(), cam, place, D0 * 2 * Math.PI * 0.55, { collect: scr, reflect: 0 });
    ctx.globalCompositeOperation = 'lighter';
    const pa = 1 - ss(4.6, 5.4, t);
    for (let i = 0; i < FOXB.length; i++) { const s = scr[i]; if (!s) continue; const k = easeInOut(clamp((t - D0 - hash(i) * 0.9) / 1.5)); const tg = logoTarget(i);
      const sw = Math.sin(k * Math.PI) * 140 * (hash(i + 3) - 0.5), x = lerp(s[0], tg[0], k) + sw, y = lerp(s[1], tg[1], k) - Math.sin(k * Math.PI) * 60 * hash(i + 5);
      glow(ctx, hash(i) > 0.8 ? sprites.ice : sprites.silver, x, y, 4 + Math.sin(k * Math.PI) * 9, pa * (0.45 + 0.4 * s[2] * (1 - k) + 0.3 * k)); }
    ctx.globalCompositeOperation = 'source-over';
  }
  // solid logo
  const solid = ss(4.4, 5.1, t);
  if (solid > 0) {
    if (LOGO_IMG) { const lw = 300, lh = lw * LOGO_IMG.naturalHeight / LOGO_IMG.naturalWidth; ctx.save(); ctx.globalAlpha = solid; ctx.drawImage(LOGO_IMG, W / 2 - lw / 2, H / 2 - 175 - lh / 2, lw, lh); ctx.restore(); }
    else { const R = 1.17, c2 = { d: 8.6, f: 1000, cy: H / 2 - 175 }, yaw = 0.02 * Math.sin(t), light = (() => { const a = -1.2 + t * 0.35; const l = [Math.sin(a) * 0.7, -0.5, 0.7]; const n = Math.hypot(...l); return l.map(q => q / n); })();
      drawFoxSolid(ctx, p => rotY([p[0] * R, p[1] * R, p[2] * R], yaw), c2, solid, light, 0.25, solid); }
  }
  const fadeAll = 1 - ss(59.75, 60.0, T), wy = H / 2 + 62;
  const p = clamp((t - 4.6) / 1.0);
  if (p > 0) revealText(ctx, 'SILVERFOXNS', W / 2 + 6, wy, { weight: 500, size: 92, tracking: 26, p, fill: 'silver', sweep: (t - 5.6) / 1.6, rise: 22, stagger: 0.7, alpha: fadeAll });
  const dl = 420 * easeInOut((t - 5.1) / 0.8);
  if (dl > 1) { ctx.save(); ctx.globalAlpha = 0.8 * fadeAll; const g = ctx.createLinearGradient(W / 2 - dl / 2, 0, W / 2 + dl / 2, 0); g.addColorStop(0, 'rgba(124,196,255,0)'); g.addColorStop(0.5, 'rgba(124,196,255,1)'); g.addColorStop(1, 'rgba(124,196,255,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - dl / 2, wy + 38, dl, 1.5); ctx.restore(); }
  const p2 = clamp((t - 5.2) / 0.9); if (p2 > 0) revealText(ctx, 'BEYOND SECURITY. BEYOND LIMITS.', W / 2 + 6, wy + 92, { weight: 300, size: 29, tracking: 13, p: p2, fill: '#cfd9e2', rise: 10, alpha: fadeAll });
  const p3 = clamp((t - 5.75) / 0.7); if (p3 > 0) revealText(ctx, 'www.silverfoxns.com', W / 2 + 3, wy + 146, { weight: 400, size: 20, family: FONT_T, tracking: 5, p: p3, fill: '#8ea3b8', rise: 6, alpha: fadeAll });
  const p4 = clamp((t - 6.15) / 0.7); if (p4 > 0) revealText(ctx, 'Founded by Nithinkumar.', W / 2 + 2, wy + 192, { weight: 300, size: 18, family: FONT_T, tracking: 3, p: p4, fill: '#6f8396', rise: 6, alpha: fadeAll });
}
let _tmp = null; function tmpCtx() { if (!_tmp) { const c = document.createElement('canvas'); c.width = 4; c.height = 4; _tmp = c.getContext('2d'); } return _tmp; }

// Optional real logo: sample its opaque pixels as particle targets.
function useLogo(img) {
  LOGO_IMG = img;
  try { const lw = 300, lh = Math.round(lw * img.naturalHeight / img.naturalWidth), c = mk(lw, lh), x = c.getContext('2d'); x.drawImage(img, 0, 0, lw, lh);
    const d = x.getImageData(0, 0, lw, lh).data, pts = [];
    for (let y = 0; y < lh; y += 2) for (let xx = 0; xx < lw; xx += 2) if (d[(y * lw + xx) * 4 + 3] > 128) pts.push([W / 2 - lw / 2 + xx, H / 2 - 175 - lh / 2 + y]);
    const r = rng(5); for (let i = pts.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    LOGO_TARGETS = pts;
  } catch (e) { LOGO_TARGETS = null; }
}

// ---------------------------------------------------------------- timeline + compositor
const SCENES = [
  { a: 0.0, b: 10.45, fin: 0.01, fout: 0.4, fn: sceneCity },
  { a: 10.05, b: 15.05, fin: 0.4, fout: 0.3, fn: sceneAwaken },
  { a: 14.75, b: 20.85, fin: 0.3, fout: 0.35, fn: sceneWalk, zoomOut: 1 },
  { a: 20.5, b: 23.25, fin: 0.35, fout: 0.3, fn: sceneHall },
  { a: 22.95, b: 26.3, fin: 0.3, fout: 0.3, fn: sceneAssess },
  { a: 26.0, b: 29.45, fin: 0.3, fout: 0.3, fn: sceneIntel },
  { a: 29.15, b: 32.45, fin: 0.3, fout: 0.3, fn: sceneInvestigate },
  { a: 32.15, b: 35.45, fin: 0.3, fout: 0.3, fn: sceneSecure, zoomOut: 1 },
  { a: 35.2, b: 37.3, fin: 0.3, fout: 0.4, fn: sceneReflect },
  { a: 36.9, b: 39.8, fin: 0.3, fout: 0.35, fn: sceneWebB },
  { a: 39.5, b: 43.3, fin: 0.35, fout: 0.4, fn: sceneBizB },
  { a: 42.95, b: 52.4, fin: 0.45, fout: 0.45, fn: sceneFounderInterview },
  { a: 52.0, b: 60.01, fin: 0.45, fout: 0.01, fn: sceneReveal },
];
const FLASH = [[5.1, 1.0], [10.25, 0.5], [14.8, 0.45], [20.5, 0.8], [23.0, 0.3], [26.0, 0.3], [29.2, 0.3], [32.2, 0.3], [34.98, 0.4], [43.0, 0.2], [56.6, 0.75]];
function glitch(ctx, t) {   // pre-impact signal corruption (city, before the first bass hit)
  const g = ss(4.55, 4.75, t) * (1 - ss(5.05, 5.12, t)); if (g <= 0) return;
  const fr = Math.floor(t * 30);
  for (let i = 0; i < 9; i++) { const y = hash(fr * 13 + i) * H * S, h = (8 + hash(fr + i * 5) * 60) * S, dx = (hash(fr * 7 + i) - 0.5) * 140 * S * g;
    ctx.drawImage(main, 0, y, W * S, h, dx, y, W * S, h); }
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * g; ctx.drawImage(main, 6 * S, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
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
    if (sc.zoomOut) { const z = 1 + 0.3 * ss(sc.b - sc.fout - 0.15, sc.b, t); ctx.translate(W * S / 2, H * S / 2); ctx.scale(z, z); ctx.translate(-W * S / 2, -H * S / 2); }
    ctx.drawImage(L, 0, 0); ctx.restore();
  }
  // the silence before the first impact
  const hush = ss(4.45, 4.7, t) * (1 - ss(5.0, 5.1, t)); if (hush > 0) { ctx.globalAlpha = 0.55 * hush; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W * S, H * S); ctx.globalAlpha = 1; }
  glitch(ctx, t);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const b = bloomC.getContext('2d'), b2 = bloomC2.getContext('2d');
  b.globalAlpha = 1; b.clearRect(0, 0, bloomC.width, bloomC.height); b.drawImage(main, 0, 0, bloomC.width, bloomC.height);
  b2.clearRect(0, 0, bloomC2.width, bloomC2.height); b2.filter = 'blur(10px) brightness(1.15)'; b2.drawImage(bloomC, 0, 0); b2.filter = 'none';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4; ctx.drawImage(bloomC2, 0, 0, W, H);
  let fl = 0; for (const [ft, amp] of FLASH) { const d = t - ft; if (d > -0.08 && d < 0.8) fl += amp * (d < 0 ? (d + 0.08) / 0.08 : Math.exp(-d * 6)); }
  if (fl > 0.01) { const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7); g.addColorStop(0, `rgba(220,236,255,${Math.min(0.85, fl)})`); g.addColorStop(1, `rgba(120,170,230,${Math.min(0.4, fl * 0.35)})`); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // grade: cool shadows, neutral highlights
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(30,60,95,0.18)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.08;
  const gi = Math.floor(t * 24) % 4, pat = ctx.createPattern(grain[gi], 'repeat'), off = hash(Math.floor(t * 24)) * 256;
  ctx.save(); ctx.translate(off, off * 0.7); ctx.fillStyle = pat; ctx.fillRect(-off, -off, W + 256, H + 256); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR);
  const fadeIn = 1 - ss(0, 0.9, t); if (fadeIn > 0) { ctx.globalAlpha = fadeIn; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

window.SFX = { init, renderFrame, DURATION, W, H, useLogo, FOX_FACETS: () => FOX_FACETS };
})();
