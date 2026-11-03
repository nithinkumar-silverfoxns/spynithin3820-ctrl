"""SILVERFOXNS — THE DIGITAL SHADOW: score, narration and final mix (60 s, 48 kHz stereo).

    python3 score_shadow.py shadow-mix.wav

Inputs (all optional except the narration):
  vo/l1.wav … vo/l9.wav   narration lines (see voiceover.sh), placed at the cue times below
  assets/founder.wav      the genuine founder recording's audio (extracted from assets/founder.mp4)
Music is ducked automatically under narration and under the founder interview.
"""
import os, sys, wave
import numpy as np
from synth import *            # instruments + busses (dry, send) + helpers
import synth

HERE = os.path.dirname(os.path.abspath(__file__))
VO_DIR = os.environ.get('VO_DIR', os.path.join(HERE, 'vo'))

# ---------------------------------------------------------------- narration cue sheet (seconds)
VO = [(1, 0.7), (2, 5.35), (3, 10.9), (4, 20.55), (5, 22.75), (6, 35.8), (7, 52.45), (8, 53.55), (9, 54.85)]
FOUNDER_AT = 43.35
IMPACTS = [5.1, 20.5, 56.6]


def read_wav(path):
    with wave.open(path) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), '<i2').astype(float) / 32768
    x = x.reshape(-1, ch).mean(axis=1)
    if sr != SR:
        x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x


# ---------------------------------------------------------------- music
# 0–5.1 · city: drone, digital ambience, then the silence and the first impact
place(drone(midi(n2m('D1')), 4.6, 0.8), 0.0, 0, rev=0.1)
place(shimmer([midi(n2m('A5')), midi(n2m('E6')), midi(n2m('D7'))], 4.5, 0.8), 0.0, 0, rev=0.9)
amb = fft_filter(rng.standard_normal(int(4.5 * SR)), lo=200, hi=1800) * 0.02 * np.minimum(np.arange(int(4.5 * SR)) / SR / 1.5, 1)
place(amb, 0.0, 0, rev=0.4)
for i in range(16):
    place(blip(1800 + (i * 613) % 2600, 0.45), 0.3 + i * 0.26 + (i % 3) * 0.04, pan=((i * 0.53) % 1.6) - 0.8, rev=0.5)
place(riser(1.2, 0.5, 300, 6000), 3.25, 0, rev=0.3)          # swells… then nothing (4.5 – 5.1)
for h in IMPACTS:
    place(boom(1.0), h, 0, rev=0.35)
# 5.1–10.2 · threats emerge: low pulse + Dm strings
chord(['D2', 'A2', 'D3', 'F3', 'A3'], 5.1, 5.0, 0.8, attack=0.25)
place(brass(midi(n2m('D2')), 4.6, 0.9, attack=0.2), 5.1, 0, rev=0.4)
for s in range(int(5.0 / 0.272)):
    place(stacc(midi(n2m('D2')), 0.6 if s % 2 == 0 else 0.35, 0.12), 5.1 + s * 0.272, pan=-0.2 if s % 2 else 0.2, rev=0.15)
for i in range(14):
    place(blip(900 + (i * 397) % 1400, 0.4), 5.6 + i * 0.33, pan=((i * 0.71) % 1.6) - 0.8, rev=0.5)
place(riser(1.4, 0.6), 8.85, 0, rev=0.4)
# 10.2–14.8 · the fox awakens
place(boom(0.55, f0=90), 10.25, 0, rev=0.5)
chord(['Bb1', 'F2', 'D3', 'F3', 'Bb3', 'D4'], 10.25, 4.4, 0.75, attack=0.8)
place(shimmer([midi(n2m('D6')), midi(n2m('F6')), midi(n2m('A6'))], 4.6, 1.2), 10.2, 0, rev=0.9)
for i, nm in enumerate(['D5', 'F5', 'A5', 'G5', 'F5']):
    place(strings(midi(n2m(nm)), 0.8, 0.4, attack=0.2, release=0.8, bright=1.2), 11.0 + i * 0.75, 0.3, rev=0.6)
place(riser(1.1, 0.5, 400, 8000), 13.7, 0, rev=0.4)
# 14.8–20.5 · the walk: ostinato + taiko
prog = [('D2', ['D3', 'F3', 'A3', 'D4']), ('Bb1', ['D3', 'F3', 'Bb3', 'D4']), ('F2', ['C3', 'F3', 'A3', 'C4'])]
for k, (root, notes) in enumerate(prog):
    t0 = 14.8 + k * 1.9
    chord(notes, t0, 1.85, 0.6)
    for s in range(8):
        place(stacc(midi(n2m(root)) * (2 if s % 4 == 3 else 1), 0.7 if s % 2 == 0 else 0.45), t0 + s * 0.2375, pan=-0.2 if s % 2 else 0.2, rev=0.2)
for b in range(12):
    place(taiko(0.6 if b % 4 == 0 else 0.3), 14.8 + b * 0.475, rev=0.3)
place(riser(1.3, 0.8, 250, 9000), 19.2, 0, rev=0.4)
# 20.5–35.2 · security operations
prog = [('D2', ['D3', 'F3', 'A3', 'D4'], ['D5', 'F5', 'A5', 'F5']), ('Bb1', ['D3', 'F3', 'Bb3', 'D4'], ['D5', 'F5', 'Bb5', 'F5']),
        ('F2', ['C3', 'F3', 'A3', 'C4'], ['C5', 'F5', 'A5', 'F5']), ('C2', ['C3', 'E3', 'G3', 'C4'], ['C5', 'E5', 'G5', 'E5'])]
t0 = 20.5
k = 0
while t0 < 34.9:
    root, notes, arp = prog[k % 4]
    d = min(1.85, 35.2 - t0)
    chord(notes, t0, d, 0.55, attack=0.4)
    place(brass(midi(n2m(root)) * 2, d, 0.35, attack=0.3), t0, 0, rev=0.4)
    for s in range(int(d / 0.115)):
        place(stacc(midi(n2m(root)), 0.5 if s % 4 == 0 else 0.28, 0.1), t0 + s * 0.115, pan=-0.25 if s % 2 else 0.25, rev=0.15)
        if s % 2 == 0:
            place(pluck(midi(n2m(arp[(s // 2) % 4])) * (2 if (s // 8) % 2 else 1), 0.32), t0 + s * 0.115, pan=np.sin(s * 0.7) * 0.7, rev=0.45)
    t0 += 1.85
    k += 1
for b in range(31):
    tt = 20.5 + b * 0.4625
    if tt < 34.9:
        place(taiko(0.5 if b % 4 == 0 else 0.22), tt, rev=0.3)
for h in (23.0, 26.0, 29.2, 32.2):
    place(whoosh(0.7, 0.5), h - 0.45, 0, rev=0.3)
    place(boom(0.4, f0=95), h, 0, rev=0.4)
for i in range(40):
    place(blip(2200 + (i * 911) % 2400, 0.3), 23.2 + i * 0.29, pan=((i * 0.61) % 1.6) - 0.8, rev=0.5)
place(metal_click(0.9), 34.96, 0, rev=0.6)
place(boom(0.55, f0=85), 34.98, 0, rev=0.4)
# 35.2–43 · innovation: brighter harmony
place(whoosh(0.9, 0.6), 36.3, 0, rev=0.35)
prog = [('F2', ['F3', 'A3', 'C4', 'F4'], ['F5', 'A5', 'C6', 'A5']), ('C2', ['E3', 'G3', 'C4', 'E4'], ['E5', 'G5', 'C6', 'G5']),
        ('D2', ['F3', 'A3', 'D4', 'F4'], ['D5', 'F5', 'A5', 'F5']), ('Bb1', ['F3', 'Bb3', 'D4', 'F4'], ['D5', 'F5', 'Bb5', 'F5'])]
for k, (root, notes, arp) in enumerate(prog):
    t0 = 35.2 + k * 1.95
    chord(notes, t0, 1.95, 0.5, attack=0.5)
    place(strings(midi(n2m(root)), 1.95, 0.6, attack=0.3), t0, 0, rev=0.3)
    for s in range(int(1.95 / 0.1219)):
        place(pluck(midi(n2m(arp[s % 4])) * (2 if (s // 4) % 2 else 1), 0.4 if s % 4 == 0 else 0.25), t0 + s * 0.1219, pan=np.sin(s * 0.7) * 0.7, rev=0.45)
for b in range(16):
    place(taiko(0.35 if b % 4 == 0 else 0.15), 35.2 + b * 0.4875, rev=0.3)
place(boom(0.35, f0=90), 36.9, 0, rev=0.4)
place(boom(0.3, f0=90), 39.5, 0, rev=0.4)
# 43–52.2 · founder: quiet bed only
place(whoosh(0.8, 0.4), 42.5, 0, rev=0.4)
for t0, d, notes in [(43.0, 2.3, ['Bb2', 'F3', 'Bb3', 'D4']), (45.3, 2.3, ['A2', 'F3', 'A3', 'C4']), (47.6, 2.3, ['G2', 'D3', 'G3', 'Bb3']), (49.9, 2.3, ['A2', 'E3', 'A3', 'C#4'])]:
    chord(notes, t0, d, 0.35, attack=0.9, bright=0.7)
for tt, nm in [(43.2, 'D5'), (45.5, 'C5'), (47.8, 'Bb4'), (50.1, 'A4')]:
    place(piano(midi(n2m(nm)), 0.4), tt, 0.15, rev=0.8)
# 52.2–60 · signature reveal
chord(['G2', 'D3', 'G3', 'Bb3', 'D4'], 52.2, 2.2, 0.55, attack=0.4)
chord(['A2', 'E3', 'A3', 'C#4', 'E4'], 54.4, 2.2, 0.7, attack=0.3)
for i in range(22):
    place(taiko(0.15 + 0.6 * (i / 22) ** 1.6), 54.4 + i * 0.1, rev=0.3)
place(riser(2.0, 0.9, 200, 10000), 54.6, 0, rev=0.4)
chord(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4', 'F#4', 'A4'], 56.6, 3.0, 1.0, attack=0.1, release=1.5)
for nm in ['D1', 'D2', 'A2']:
    place(brass(midi(n2m(nm)), 3.0, 1.0, attack=0.12, release=1.3), 56.6, 0, rev=0.45)
place(drone(midi(n2m('D1')), 3.4, 0.9), 56.6, 0, rev=0.1)
place(shimmer([midi(n2m('D6')), midi(n2m('F#6')), midi(n2m('A6'))], 3.4, 1.3), 56.7, 0, rev=0.9)
for tt, nm in [(57.2, 'A5'), (57.45, 'D6'), (57.85, 'F#6'), (58.3, 'A6')]:
    place(piano(midi(n2m(nm)), 0.5), tt, 0.1, rev=0.85)

# ---------------------------------------------------------------- music render (reverb)
def _ir(seconds=3.2):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for c in range(2):
        x = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds)
        out[c] = fft_filter(x * np.exp(-t * 6), hi=7000) * 0.5 + fft_filter(x, hi=2200)
        out[c, :int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return out / np.abs(out).max()


def conv(x, h):
    L = len(x) + len(h) - 1
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[:len(x)]


IR = _ir()
wet = np.vstack([conv(synth.send[0], IR[0]), conv(synth.send[1], IR[1])])
wet *= np.abs(synth.dry).max() / (np.abs(wet).max() + 1e-9) * 0.55
music = synth.dry + wet
music = np.vstack([fft_filter(ch, lo=24) for ch in music])
music /= np.abs(music).max()

# ---------------------------------------------------------------- narration + founder audio
voice = np.zeros(N)
for idx, at in VO:
    p = os.path.join(VO_DIR, f'l{idx}.wav')
    if not os.path.exists(p):
        print('missing narration line', p); continue
    x = read_wav(p)
    i0 = int(at * SR)
    voice[i0:i0 + len(x)] += x[:N - i0]
founder = np.zeros(N)
fp = os.path.join(HERE, 'assets', 'founder.wav')
if os.path.exists(fp):
    x = read_wav(fp)[:int(8.8 * SR)]
    x[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
    i0 = int(FOUNDER_AT * SR)
    founder[i0:i0 + len(x)] = x[:N - i0]
    print('founder audio placed')

# voice: short ambience so it sits in the room
vwet = conv(voice, IR[0][:int(1.2 * SR)] * np.exp(-np.arange(int(1.2 * SR)) / SR * 3))
voice_st = np.vstack([voice + vwet * 0.05, voice + conv(voice, IR[1][:int(1.2 * SR)] * np.exp(-np.arange(int(1.2 * SR)) / SR * 3)) * 0.05])
voice_st /= max(np.abs(voice_st).max(), 1e-9)

# ducking: music dips under speech (smoothed envelope), and sits low under the founder interview
def envelope(x, win=0.18):
    k = int(win * SR)
    c = np.cumsum(np.abs(x))
    e = (c[k:] - c[:-k]) / k
    return np.concatenate([np.zeros(k // 2), e, np.zeros(len(x) - len(e) - k // 2)])

speech = envelope(voice + founder)
duck = 1 - 0.62 * np.clip(speech / (speech.max() * 0.25 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode='same')
t = np.arange(N) / SR
duck *= 1 - 0.55 * np.clip((t - 42.9) / 0.4, 0, 1) * (1 - np.clip((t - 52.0) / 0.4, 0, 1))

mix = music * duck * 0.62 + voice_st * 0.52 + np.vstack([founder, founder]) * 0.55
mix = np.tanh(mix / np.abs(mix).max() * 1.5) / np.tanh(1.5)
mix = mix[:, :int(60.0 * SR)]
fade = int(0.4 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix = mix / np.abs(mix).max() * 10 ** (-1 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else 'shadow-mix.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', out)
