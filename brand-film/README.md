# SILVERFOXNS — Official Brand Film (60 s)

A cinematic launch film for **SILVERFOXNS**: cybersecurity first, with web development,
CRM solutions and business automation. It is built entirely in code: a real-time 3D canvas
renderer and an original synthesised orchestral score. Every frame is a pure function of time,
so the film renders to video frame by frame with no randomness between renders.

| File | What it is |
|---|---|
| `silverfoxns-brand-film-4k.mp4` | Final film, 3840×2160 (4K UHD), 30 fps, H.264 + AAC |
| `silverfoxns-brand-film-1080p.mp4` | Same film at 1920×1080 for web and social |
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

---

# SILVERFOXNS — THE DIGITAL SHADOW (60 s, 4K, with narration)

The second film tells one continuous story: a city under invisible threat, the silver fox awakening, the fox walking into a
security operations centre, the reflection into technology, the founder interview, and the fox dissolving into the logo.

| File | What it is |
|---|---|
| `silverfoxns-digital-shadow-4k.mp4` / `-1080p.mp4` | Rendered film with narration, score and sound design |
| `shadow.html` + `shadow.js` | The film engine. Open `shadow.html` in Chrome and press **PLAY FILM** to watch it live |
| `voiceover.sh` → `vo/l1–l9.wav` | Narration: Piper neural voice (`en_US-ryan-high`), pitched down, EQ'd and compressed |
| `score_shadow.py` → `shadow-mix.wav` | Score + narration + founder audio, with automatic ducking under speech (uses `synth.py`) |
| `silverfoxns-digital-shadow.srt` | Subtitles for the narration |

| Time | Scene |
|---|---|
| 0:00–0:10 | **The digital world**: drone flight between glass towers at night; data streams and links between towers; threats spread in red; a moment of silence and signal glitch, then the bass impact; the camera rises above the city |
| 0:10–0:15 | **The fox awakens**: silver particles form the fox; the camera pushes into an extreme close-up of its eye |
| 0:15–0:21 | **The walk**: a full-body metallic particle fox walks through a digital space; the camera tracks it toward a doorway of light |
| 0:21–0:35 | **Security operations**: the fox enters the operations centre; *SILVERFOXNS*, then 01 Security assessments · 02 Threat intelligence / exposure monitoring · 03 Digital investigations / dark web awareness · 04 Secure networks |
| 0:35–0:43 | **Through the reflection**: interfaces slide across the metal fox, then the camera dives through its eye into web development, CRM platforms and business automation |
| 0:43–0:52 | **Founder interview**: *Why did you build SILVERFOXNS?* — NITHINKUMAR, Founder – SILVERFOXNS |
| 0:52–1:00 | **Signature reveal**: the fox walks toward the camera, dissolves into particles and becomes the logo, then *BEYOND SECURITY. BEYOND LIMITS.*, www.silverfoxns.com, *Founded by Nithinkumar.* |

## Adding the genuine assets

The brief asks for the real logo and a genuine founder recording. Neither was supplied, so:

- **Founder interview**: the scene shows a clearly marked placeholder. Put the real clip (8–9 s, horizontal) at
  `assets/founder.mp4`. `render.js` composites it full-frame with the grade, slow push-in, question and lower third, and
  `score_shadow.py` mixes its audio and lowers the music underneath.
- **Logo**: the film currently uses the faceted fox mark. Put the real logo (transparent PNG) at `assets/logo.png`. In the finale
  the particles assemble into its shape and the logo itself is shown.
- **Narrator**: to use a human voice-over artist, record the nine lines from `voiceover.sh` as `vo/l1.wav … vo/l9.wav`.

```bash
./voiceover.sh                                   # or drop in recorded vo/*.wav
ffmpeg -i assets/founder.mp4 -vn -ac 1 -ar 48000 assets/founder.wav   # only once the real clip is supplied
python3 score_shadow.py shadow-mix.wav           # music + narration (+ founder audio) mix
node render.js --page shadow.html --scale 2 --audio shadow-mix.wav --out silverfoxns-digital-shadow-4k.mp4
```

No clients, certifications, achievements or capabilities are claimed. The on-screen interfaces are illustrative and
show only the services named in the brief.
