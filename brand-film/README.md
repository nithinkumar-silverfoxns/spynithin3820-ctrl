# SILVERFOXNS — Official Brand Film (60 s)

A cinematic launch film for **SILVERFOXNS**: cybersecurity first, with web development,
CRM solutions and business automation. It is built entirely in code: a real-time 3D canvas
renderer and an original synthesised orchestral score. Every frame is a pure function of time,
so the film renders to video frame by frame with no randomness between renders.

| File | What it is |
|---|---|
| `silverfoxns-brand-film-1080p.mp4` | Final film, 1920×1080, 30 fps, H.264 + AAC (shareable) |
| `film.html` + `film.js` | The film engine. Open `film.html` in Chrome and press **PLAY FILM** to watch it live |
| `score.py` → `score.wav` | Original score: strings, low brass, ostinato, taiko and boom impacts, risers, piano motif, digital textures, convolution reverb |
| `render.js` | Frame-accurate renderer (Playwright + ffmpeg). `--scale 2` = 3840×2160 (4K) |
| `assets/silverfoxns-logo.svg` / `.png` | Fox mark + wordmark lock-up, same geometry as in the film |
| `assets/silverfoxns-mark.svg` | Fox mark on its own (icons, favicons, watermarks) |
| `stills/` | Key frames from the film, for social posts, decks and the website |

## Storyboard

| Time | Scene | Picture | Sound |
|---|---|---|---|
| 0:00–0:07 | **Genesis** | Volumetric light beams, drifting dust with depth-of-field bokeh. *“Every connection is a door. We guard every one.”* A spark grows into an anamorphic flare | Sub-bass drone, high shimmer, sparse piano, digital ticks, riser |
| 0:07–0:15 | **The Silver Fox** | The spark bursts into about 5,000 metallic particles that swirl into the faceted fox, which then turns to shaded silver metal with glowing ice-blue eyes, god rays and orbiting energy trails | Impact; full strings and low brass in D minor; violin line |
| 0:15–0:23 | **01 Cybersecurity** | Drone orbit around a dotted globe with encrypted links. A geodesic shield scans into place and incoming threats (red) are stopped at the shield | Pulsing ostinato, taiko, Dm–B♭–F–C |
| 0:23–0:30 | **Encryption** | Fly-through of a tunnel of scrambling hex glyphs. A padlock draws on and locks shut, then a ring of light, then *SECURED* | 16th-note pulse, timpani roll, metal lock click and boom |
| 0:30–0:37 | **02 Web Development** | Glass UI panels in 3D parallax: live-typed code, the silverfoxns.com site building itself, a mobile performance ring | Bright plucked arpeggios over F–C–Dm–B♭ |
| 0:37–0:45 | **03 CRM Solutions · 04 Business Automation** | CRM dashboard with KPIs counting up, a revenue curve and a pipeline. Then a 3D workflow graph (Trigger → Verify → Enrich → Route / Sync → Notify / Report) with data pulses | Arpeggios continue, soft impacts on each reveal |
| 0:45–0:52 | **Founder** | Overhead spotlight with a ghosted fox wireframe. A line of light, then **NITHINKUMAR** rises behind it, then *Founder – SILVERFOXNS* | Drums drop out; piano motif over warm strings |
| 0:52–1:00 | **Finale** | Particles converge into the metal fox mark: **SILVERFOXNS**, *BEYOND SECURITY. BEYOND LIMITS.*, www.silverfoxns.com | Build, then a big D-major resolution, brass and chimes |

**Brand system:** near-black ink `#04060A`, brushed silver `#D7DEE5`, steel `#8D99A6`, ice-blue accent `#7CC4FF`
(threat red is used only for attacks). Type is Inter Display (titles), Inter (body) and JetBrains Mono (data). The film uses a 2.2:1 letterbox, bloom, vignette and film grain throughout.

## Re-render

```bash
python3 score.py score.wav                                    # rebuild the score
node render.js --scale 1 --out silverfoxns-brand-film-1080p.mp4   # 1080p, ~6 min on 4 cores
node render.js --scale 2 --out silverfoxns-brand-film-4k.mp4      # 4K UHD, ~17 min on 4 cores
```

Needs Node + Playwright (Chromium), ffmpeg, Python 3 + numpy, and the Inter / Inter Display / JetBrains Mono fonts installed locally.

**Using your existing logo:** the fox mark is defined once in `film.js` (`FP` + `buildFox`). You can change those
points to match an existing mark, or swap the finale lock-up in `sceneFinale` for an image. Then re-render.
