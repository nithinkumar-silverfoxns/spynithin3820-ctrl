// node still.js <outdir> t1 t2 ... -> PNG stills (1920x1080) for review
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'film.html') + '?render&scale=' + (process.env.SCALE || 1)); await p.evaluate(() => window.ready);
  for (const t of ts) { const t0 = Date.now();
    const d = await p.evaluate(t => { SFX.renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, parseFloat(t));
    fs.writeFileSync(path.join(out, `t${String(t).padStart(5, '0')}.png`), Buffer.from(d.split(',')[1], 'base64')); console.log(t, Date.now() - t0, 'ms'); }
  await b.close();
})();
