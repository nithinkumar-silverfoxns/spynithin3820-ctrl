// Render the film frame-accurately to MP4.
//   node render.js [--page film.html] [--scale 2] [--fps 30] [--workers 4] [--out out.mp4] [--audio score.wav] [--from 0 --to 60]
// For shadow.html, a genuine founder recording at assets/founder.mp4 is composited into the interview scene (43.0 s – 52.4 s).
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const scale = +arg('scale', 2), fps = +arg('fps', 30), workers = +arg('workers', 4);
const out = path.resolve(arg('out', 'silverfoxns-brand-film.mp4')), audio = arg('audio', 'score.wav');
const from = +arg('from', 0), to = +arg('to', 60), tmp = path.resolve(arg('tmp', '.render-tmp'));
const total = Math.round((to - from) * fps), pageFile = arg('page', 'film.html');
const FOUNDER = { src: path.resolve(__dirname, 'assets/founder.mp4'), at: 43.0, end: 52.4, dir: path.join(tmp, 'founder') };
fs.mkdirSync(tmp, { recursive: true });
const hasFounder = pageFile.startsWith('shadow') && fs.existsSync(FOUNDER.src);
if (hasFounder) { fs.mkdirSync(FOUNDER.dir, { recursive: true });
  require('child_process').execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', FOUNDER.src, '-t', String(FOUNDER.end - FOUNDER.at), '-vf', `fps=${fps},scale=1920:-2`, '-q:v', '2', path.join(FOUNDER.dir, '%05d.jpg')]);
  require('child_process').execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', FOUNDER.src, '-vn', '-ac', '1', '-ar', '48000', path.resolve(__dirname, 'assets/founder.wav')]);
  console.log('founder footage prepared'); }
async function worker(w, browser) {
  const a = Math.floor(total * w / workers), b = Math.floor(total * (w + 1) / workers);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto('file://' + path.resolve(__dirname, pageFile) + `?render&scale=${scale}`);
  await page.evaluate(() => window.ready);
  const seg = path.join(tmp, `seg${w}.mp4`);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', scale >= 2 ? '17' : '16', '-pix_fmt', 'yuv420p', '-tune', 'grain', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const t = from + f / fps;
    let img = null;
    if (hasFounder && t >= FOUNDER.at && t < FOUNDER.end) { const fp = path.join(FOUNDER.dir, String(Math.floor((t - FOUNDER.at) * fps) + 1).padStart(5, '0') + '.jpg'); if (fs.existsSync(fp)) img = 'file://' + fp; }
    const d = await page.evaluate(async ([t, img]) => { if (img) { const i = new Image(); i.src = img; await i.decode(); window.__founderFrame = i; } SFX.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.96); }, [t, img]);
    if (!ff.stdin.write(Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 60 === 0) console.log(`worker ${w}: frame ${f - a}/${b - a}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close(); return seg;
}
(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--allow-file-access-from-files'] });
  const segs = await Promise.all(Array.from({ length: workers }, (_, w) => worker(w, browser)));
  await browser.close();
  fs.writeFileSync(path.join(tmp, 'list.txt'), segs.map(s => `file '${s}'`).join('\n'));
  const args = ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt')];
  if (audio && fs.existsSync(audio)) args.push('-ss', String(from), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest');
  args.push('-c:v', 'copy', '-movflags', '+faststart', out);
  await new Promise((res, rej) => spawn('ffmpeg', args, { stdio: 'inherit' }).on('close', c => c ? rej(c) : res()));
  console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
