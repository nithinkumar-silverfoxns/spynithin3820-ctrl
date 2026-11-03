// Export the SILVERFOXNS fox mark (same geometry as the film) to SVG.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, 'film.html') + '?render&scale=1'); await p.evaluate(() => window.ready);
  const F = await p.evaluate(() => SFX.FOX_FACETS().map(f => ({ pts: f.pts.map(q => [q[0], q[1]]), tone: f.tone, kind: f.kind })));
  await b.close();
  const col = f => { if (f.kind === 'eye') return '#8fd0ff'; if (f.kind === 'nose') return '#10151c';
    const k = f.kind === 'inner' ? 0.18 : f.tone; const l = (a, c) => Math.round(a + (c - a) * k); return `rgb(${l(38, 236)},${l(45, 241)},${l(56, 247)})`; };
  const poly = (f, s, ox, oy) => `<polygon points="${f.pts.map(q => `${(ox + q[0] * s).toFixed(2)},${(oy + q[1] * s).toFixed(2)}`).join(' ')}" fill="${col(f)}" stroke="${col(f)}" stroke-width="0.6" stroke-linejoin="round"/>`;
  const order = [...F].sort((a, b) => (a.kind === 'inner' || a.kind === 'eye' || a.kind === 'nose') - (b.kind === 'inner' || b.kind === 'eye' || b.kind === 'nose'));
  const mark = (s, ox, oy) => order.map(f => poly(f, s, ox, oy)).join('\n    ');
  const font = `font-family="'Inter Display','Inter','Helvetica Neue',Arial,sans-serif"`;
  fs.mkdirSync('assets', { recursive: true });
  fs.writeFileSync('assets/silverfoxns-mark.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="SILVERFOXNS mark">\n  <g>\n    ${mark(108, 120, 122)}\n  </g>\n</svg>\n`);
  fs.writeFileSync('assets/silverfoxns-logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" role="img" aria-label="SILVERFOXNS — Beyond Security. Beyond Limits.">
  <defs>
    <linearGradient id="silver" x1="0" x2="1"><stop offset="0" stop-color="#b2bcc6"/><stop offset=".5" stop-color="#f2f6f9"/><stop offset="1" stop-color="#b0bac5"/></linearGradient>
    <linearGradient id="rule" x1="0" x2="1"><stop offset="0" stop-color="#7cc4ff" stop-opacity="0"/><stop offset=".5" stop-color="#7cc4ff"/><stop offset="1" stop-color="#7cc4ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#121924"/><stop offset="1" stop-color="#03050a"/></radialGradient>
  </defs>
  <rect width="1200" height="760" fill="url(#bg)"/>
  <g>
    ${mark(150, 600, 250)}
  </g>
  <text x="608" y="530" text-anchor="middle" ${font} font-weight="500" font-size="88" letter-spacing="24" fill="url(#silver)">SILVERFOXNS</text>
  <rect x="400" y="566" width="400" height="1.5" fill="url(#rule)"/>
  <text x="606" y="630" text-anchor="middle" ${font} font-weight="300" font-size="27" letter-spacing="11" fill="#cfd9e2">BEYOND SECURITY. BEYOND LIMITS.</text>
  <text x="603" y="684" text-anchor="middle" font-family="'Inter','Helvetica Neue',Arial,sans-serif" font-size="19" letter-spacing="5" fill="#7f93a8">www.silverfoxns.com</text>
</svg>\n`);
  console.log('ok');
})();
