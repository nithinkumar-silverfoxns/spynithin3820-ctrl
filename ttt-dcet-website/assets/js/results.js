/* Results dashboard charts — dependency-free SVG, animated with GSAP when available.
   Palette (validated for CVD on the navy surface): blue #4F7FF0, gold #C08A1E. */
(() => {
  'use strict';
  const dash = document.getElementById('resultsDash');
  if (!dash) return;
  const data = JSON.parse(dash.dataset.results);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const BLUE = '#4F7FF0', GOLD = '#C08A1E';
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };
  const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const niceStep = (raw) => { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
  const niceMax = (m) => { const st = niceStep(m / 4); return st * Math.ceil(m / st); };
  const ticks = (max) => { const st = niceStep(max / 4); const t = []; for (let v = 0; v <= max + 1e-9; v += st) t.push(v); return t; };
  const animate = (nodes, props) => { if (window.gsap && !reduced) gsap.from(nodes, props); };

  const tip = (wrap) => { let t = wrap.querySelector('.chart-tip'); if (!t) { t = document.createElement('div'); t.className = 'chart-tip'; wrap.appendChild(t); } return t; };
  const showTip = (wrap, html, x, y) => { const t = tip(wrap); t.innerHTML = html; t.style.left = x + 'px'; t.style.top = y + 'px'; t.style.opacity = 1; };
  const hideTip = (wrap) => { tip(wrap).style.opacity = 0; };

  /* ---------- Band chart (single series, one hue) ---------- */
  const bandWrap = document.getElementById('bandChart');
  const drawBands = (year) => {
    const y = data.years.find((d) => d.year === year);
    const entries = Object.entries(data.bands).map(([k, label]) => ({ label, v: y.values[k] })).filter((e) => e.v !== null);
    bandWrap.querySelector('svg')?.remove();
    const W = Math.max(320, Math.round(bandWrap.clientWidth || 720)), H = W < 520 ? 260 : 300, m = { t: 24, r: 8, b: 34, l: 40 };
    const short = W < 560;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });
    const max = niceMax(Math.max(...entries.map((e) => e.v)));
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = el('g', { class: 'grid' }, svg);
    ticks(max).forEach((v) => {
      const yy = m.t + ih - (v / max) * ih;
      el('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy }, g);
      const tx = el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', class: 'lbl' }, svg); tx.textContent = v;
    });
    const bw = Math.min(64, iw / entries.length - 14);
    const bars = [];
    entries.forEach((e, i) => {
      const cx = m.l + (iw / entries.length) * (i + 0.5);
      const h = (e.v / max) * ih;
      const x = cx - bw / 2, yTop = m.t + ih - h;
      // 4px rounded data-end, square at baseline
      const r = Math.min(4, h);
      const path = `M${x},${m.t + ih} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + bw - r} Q${x + bw},${yTop} ${x + bw},${yTop + r} V${m.t + ih} Z`;
      const bar = el('path', { d: path, fill: BLUE, 'fill-opacity': (0.55 + (0.45 * (entries.length - i)) / entries.length).toFixed(2) }, svg);
      bars.push(bar);
      const val = el('text', { x: cx, y: yTop - 7, 'text-anchor': 'middle', class: 'val' }, svg); val.textContent = e.v;
      const lb = el('text', { x: cx, y: H - 12, 'text-anchor': 'middle', class: 'lbl' }, svg); lb.textContent = short ? e.label.replace('Top ', '≤') : e.label;
      const hit = el('rect', { x: cx - iw / entries.length / 2, y: m.t, width: iw / entries.length, height: ih, fill: 'transparent' }, svg);
      hit.addEventListener('pointerenter', () => { const r = bandWrap.getBoundingClientRect(), sr = svg.getBoundingClientRect(); showTip(bandWrap, `<b>${e.v}</b> students · ${e.label} ranks · DCET ${year}`, (cx / W) * sr.width + (sr.left - r.left), (yTop / H) * sr.height + (sr.top - r.top)); });
      hit.addEventListener('pointerleave', () => hideTip(bandWrap));
    });
    bandWrap.prepend(svg);
    bars.forEach((b) => { b.style.transformOrigin = `0 ${m.t + ih}px`; b.style.transformBox = 'view-box'; });
    animate(bars, { scaleY: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 });

    document.getElementById('dashBest').textContent = 'State ' + ord(y.best);
    document.getElementById('dashYearLbl').textContent = 'DCET ' + year;
    document.getElementById('dash100').textContent = y.values.below_100 ?? '—';
    document.getElementById('dash500').textContent = y.values.below_500 ?? '—';
    document.getElementById('bandNote').textContent = entries.length < 4
      ? `For DCET ${year}, only the categories shown were published. Counts are cumulative.`
      : 'Cumulative counts: “Top 500” includes everyone in the top 100.';
  };

  let currentYear = data.years[0].year, rw = window.innerWidth;
  window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - rw) > 80) { rw = window.innerWidth; drawBands(currentYear); } });
  const tabs = Array.from(dash.querySelectorAll('[data-year]'));
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    currentYear = +t.dataset.year;
    drawBands(currentYear);
  }));
  drawBands(data.years[0].year);

  /* ---------- Trend chart (2 series, direct-labelled) ---------- */
  const trendWrap = document.getElementById('trendChart');
  (() => {
    const yrs = [...data.years].sort((a, b) => a.year - b.year);
    const series = [{ k: 'below_100', c: BLUE, name: 'Under rank 100' }, { k: 'below_500', c: GOLD, name: 'Under rank 500' }];
    const W = Math.max(320, Math.round(trendWrap.clientWidth || 640)), H = W < 520 ? 240 : 300, m = { t: 20, r: 44, b: 34, l: 40 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = niceMax(Math.max(...yrs.map((y) => y.values.below_500 || 0)));
    const X = (i) => m.l + (iw * i) / (yrs.length - 1);
    const Y = (v) => m.t + ih - (v / max) * ih;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });
    const g = el('g', { class: 'grid' }, svg);
    ticks(max).forEach((v) => { const yy = Y(v); el('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy }, g); const t = el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end', class: 'lbl' }, svg); t.textContent = v; });
    yrs.forEach((y, i) => { const t = el('text', { x: X(i), y: H - 10, 'text-anchor': 'middle', class: 'lbl' }, svg); t.textContent = y.year; });
    const lines = [];
    series.forEach((s) => {
      const pts = yrs.map((y, i) => [X(i), Y(y.values[s.k] || 0)]);
      const line = el('path', { d: 'M' + pts.map((p) => p.join(',')).join(' L'), fill: 'none', stroke: s.c, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
      lines.push(line);
      pts.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: s.c, stroke: '#0b1437', 'stroke-width': 2 }, svg));
      const last = pts[pts.length - 1];
      const lab = el('text', { x: last[0] + 10, y: last[1] + 4, class: 'val' }, svg); lab.textContent = yrs[yrs.length - 1].values[s.k];
    });
    const cross = el('line', { y1: m.t, y2: m.t + ih, stroke: 'rgba(255,255,255,.3)', 'stroke-dasharray': '3 3', opacity: 0 }, svg);
    const hit = el('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
    hit.addEventListener('pointermove', (ev) => {
      const sr = svg.getBoundingClientRect(), wr = trendWrap.getBoundingClientRect();
      const vx = ((ev.clientX - sr.left) / sr.width) * W;
      const i = Math.max(0, Math.min(yrs.length - 1, Math.round(((vx - m.l) / iw) * (yrs.length - 1))));
      cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.setAttribute('opacity', 1);
      const y = yrs[i];
      showTip(trendWrap, `<b>DCET ${y.year}</b> · State ${ord(y.best)}<br>${y.values.below_100 ?? '—'} under 100 · ${y.values.below_500 ?? '—'} under 500`, (X(i) / W) * sr.width + (sr.left - wr.left), (m.t / H) * sr.height + (sr.top - wr.top) + 40);
    });
    hit.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); hideTip(trendWrap); });
    trendWrap.appendChild(svg);
    lines.forEach((l) => { const len = l.getTotalLength(); l.style.strokeDasharray = len; l.style.strokeDashoffset = reduced ? 0 : len; });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { lines.forEach((l) => { if (window.gsap && !reduced) gsap.to(l, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }); else l.style.strokeDashoffset = 0; }); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(trendWrap);
  })();

  /* ---------- College admissions (horizontal bars) ---------- */
  const cw = document.getElementById('collegeChart');
  if (cw) {
    const rows = JSON.parse(cw.dataset.colleges);
    const max = Math.max(...rows.map((r) => r.n));
    const frag = document.createDocumentFragment();
    rows.forEach((r) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:.3rem .8rem;margin-bottom:.85rem';
      row.innerHTML = `<span style="font-size:.86rem;color:rgba(255,255,255,.82)">${r.c.replace(/[<>&]/g, '')}</span><b style="font-family:var(--ff-display)">${r.n}</b><span style="grid-column:1/-1;height:8px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden"><i style="display:block;height:100%;width:${(r.n / max) * 100}%;background:${BLUE};border-radius:0 4px 4px 0;transform-origin:left"></i></span>`;
      frag.appendChild(row);
    });
    cw.appendChild(frag);
    const bars = cw.querySelectorAll('i');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { animate(bars, { scaleX: 0, duration: 1.1, ease: 'power3.out', stagger: 0.06 }); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(cw);
  }
})();
