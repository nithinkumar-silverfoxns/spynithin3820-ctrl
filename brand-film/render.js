// Render the film frame-accurately to MP4.
//   node render.js [--scale 2] [--fps 30] [--workers 4] [--out out.mp4] [--audio score.wav] [--from 0 --to 60]
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const scale = +arg('scale', 2), fps = +arg('fps', 30), workers = +arg('workers', 4);
const out = path.resolve(arg('out', 'silverfoxns-brand-film.mp4')), audio = arg('audio', 'score.wav');
const from = +arg('from', 0), to = +arg('to', 60), tmp = path.resolve(arg('tmp', '.render-tmp'));
const total = Math.round((to - from) * fps);
fs.mkdirSync(tmp, { recursive: true });
async function worker(w, browser) {
  const a = Math.floor(total * w / workers), b = Math.floor(total * (w + 1) / workers);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'film.html') + `?render&scale=${scale}`);
  await page.evaluate(() => window.ready);
  const seg = path.join(tmp, `seg${w}.mp4`);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', scale >= 2 ? '17' : '16', '-pix_fmt', 'yuv420p', '-tune', 'grain', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const t = from + f / fps;
    const d = await page.evaluate(t => { SFX.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.96); }, t);
    if (!ff.stdin.write(Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 60 === 0) console.log(`worker ${w}: frame ${f - a}/${b - a}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close(); return seg;
}
(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const segs = await Promise.all(Array.from({ length: workers }, (_, w) => worker(w, browser)));
  await browser.close();
  fs.writeFileSync(path.join(tmp, 'list.txt'), segs.map(s => `file '${s}'`).join('\n'));
  const args = ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt')];
  if (audio && fs.existsSync(audio)) args.push('-ss', String(from), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest');
  args.push('-c:v', 'copy', '-movflags', '+faststart', out);
  await new Promise((res, rej) => spawn('ffmpeg', args, { stdio: 'inherit' }).on('close', c => c ? rej(c) : res()));
  console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
