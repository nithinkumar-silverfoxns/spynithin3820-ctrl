"""SILVERFOXNS brand film — original cinematic score (60 s, 48 kHz stereo).

Fully synthesised with numpy: orchestral string section, low brass, pulse ostinato,
taiko / boom impacts, risers, piano motif, digital textures, convolution reverb.
Cue times match the impact flashes in film.js.

    python3 score.py score.wav
"""
import sys, wave
import numpy as np

SR = 48000
DUR = 60.0
N = int(SR * (DUR + 1.0))
rng = np.random.default_rng(7)

dry = np.zeros((2, N))
send = np.zeros((2, N))      # reverb send


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
NOTE.update({'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10})


def n2m(s):
    name, octv = (s[:-1], int(s[-1]))
    return 12 * (octv + 1) + NOTE[name]


def place(sig, t0, pan=0.0, gain=1.0, rev=0.3):
    """Mix mono or stereo signal into the busses at t0 seconds."""
    i0 = int(round(t0 * SR))
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        sig = np.vstack([sig * l, sig * r]) * np.sqrt(2)
    n = min(sig.shape[1], N - i0)
    if n <= 0:
        return
    dry[:, i0:i0 + n] += sig[:, :n] * gain
    send[:, i0:i0 + n] += sig[:, :n] * gain * rev


def env_adsr(n, a, d, s, r, total):
    t = np.arange(n) / SR
    e = np.ones(n) * s
    e = np.where(t < a, t / max(a, 1e-4), e)
    dd = (t >= a) & (t < a + d)
    e[dd] = 1 - (1 - s) * (t[dd] - a) / max(d, 1e-4)
    rel = t > total - r
    e[rel] *= np.clip((total - t[rel]) / max(r, 1e-4), 0, 1)
    return e


def fft_filter(x, lo=None, hi=None, slope=0.15):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if hi:
        m *= 1 / (1 + (f / hi) ** (1 / slope * 0.5))
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** (1 / slope * 0.5))
    return np.fft.irfft(X * m, len(x))


# ---------------------------------------------------------------- instruments
def strings(freq, dur, amp=1.0, attack=0.9, release=1.4, bright=1.0):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for cents, ph in ((-7, 0.0), (0, 1.3), (7, 2.1), (-3, 4.0)):
        f = freq * 2 ** (cents / 1200)
        vib = 1 + 0.0028 * np.sin(2 * np.pi * (5.1 + cents * 0.02) * t + ph) * np.clip(t / 0.8, 0, 1)
        phase = 2 * np.pi * np.cumsum(f * vib) / SR + ph
        for h in range(1, 11):
            if f * h > 9000:
                break
            out += np.sin(h * phase) * (1 / h) * np.exp(-h * 0.22 / bright)
    e = env_adsr(n, attack, 0.4, 0.85, release, dur + release)
    return fft_filter(out * e, hi=3800 * bright) * amp * 0.08


def stacc(freq, amp=1.0, length=0.2):
    n = int((length + 0.25) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for cents in (-6, 0, 6):
        f = freq * 2 ** (cents / 1200)
        for h in range(1, 13):
            out += np.sin(2 * np.pi * f * h * t) / h * np.exp(-h * 0.15)
    e = np.minimum(t / 0.006, 1) * np.exp(-t * 9) * (t < length + 0.25)
    return fft_filter(out * e, hi=2600) * amp * 0.12


def brass(freq, dur, amp=1.0, attack=0.7, release=1.2):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    e = env_adsr(n, attack, 0.3, 0.9, release, dur + release)
    out = np.zeros(n)
    for cents in (-5, 5):
        f = freq * 2 ** (cents / 1200)
        phase = 2 * np.pi * f * t
        for h in range(1, 12):
            out += np.sin(h * phase) * (1 / h) ** (1.6 - 0.9 * e)
    return fft_filter(out * e, hi=2200) * amp * 0.07


def pluck(freq, amp=1.0, length=1.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 9):
        out += np.sin(2 * np.pi * freq * h * t) / h * np.exp(-t * (3 + h * 2.2))
    return out * np.minimum(t / 0.003, 1) * amp * 0.1


def piano(freq, amp=1.0, length=3.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    amps = [1, .55, .32, .22, .12, .08, .05, .03]
    for h, a in enumerate(amps, 1):
        fh = freq * h * np.sqrt(1 + 0.00035 * h * h)
        out += a * np.sin(2 * np.pi * fh * t) * np.exp(-t * (0.9 + 0.55 * h))
    ham = fft_filter(rng.standard_normal(n) * np.exp(-t * 60), lo=800, hi=5000) * 0.05
    return (out + ham) * np.minimum(t / 0.004, 1) * amp * 0.16


def boom(amp=1.0, length=4.0, f0=120, f1=30):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 3.2)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.25)
    sub = np.sin(2 * np.pi * 32 * t) * np.exp(-t * 0.9) * np.minimum(t / 0.02, 1)
    hit = fft_filter(rng.standard_normal(n) * np.exp(-t * 7), hi=1400) * 0.6
    air = fft_filter(rng.standard_normal(n) * np.exp(-t * 2.2), lo=3000, hi=12000) * 0.08
    return np.tanh((body * 0.9 + sub * 0.6 + hit + air) * 1.4) * amp * 0.75


def taiko(amp=1.0):
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 52 + 45 * np.exp(-t * 22)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    skin = fft_filter(rng.standard_normal(n) * np.exp(-t * 40), lo=150, hi=2500) * 0.35
    return np.tanh((body + skin) * 1.6) * amp * 0.45


def riser(length, amp=1.0, f0=250, f1=7000):
    """STFT-filtered noise sweep with a rising tonal whine."""
    n = int(length * SR)
    x = rng.standard_normal(n + 2048)
    hop, win = 512, 2048
    w = np.hanning(win)
    out = np.zeros(n + 2048)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    for i, s in enumerate(range(0, n, hop)):
        k = s / n
        fc = f0 * (f1 / f0) ** (k ** 1.6)
        mask = np.exp(-0.5 * (np.log2(np.maximum(freqs, 1) / fc) / 0.7) ** 2)
        seg = np.fft.irfft(np.fft.rfft(x[s:s + win] * w) * mask, win)
        out[s:s + win] += seg * w
    out = out[:n]
    t = np.arange(n) / SR
    k = t / length
    tone = np.sin(2 * np.pi * np.cumsum(180 * 8 ** (k ** 2)) / SR) * 0.08
    e = (k ** 2.2) * (1 - np.clip((k - 0.985) / 0.015, 0, 1))
    return (out / (np.abs(out).max() + 1e-9) * 0.5 + tone) * e * amp


def whoosh(length=0.9, amp=1.0):
    n = int(length * SR)
    r = riser(length, 1.0, 6000, 300)[::-1]
    t = np.arange(n) / SR
    return r * np.sin(np.pi * np.clip(t / length, 0, 1)) * amp


def blip(freq, amp=1.0, length=0.05):
    n = int(length * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 70) * np.minimum(t / 0.001, 1) * amp * 0.12


def metal_click(amp=1.0):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    out = fft_filter(rng.standard_normal(n) * np.exp(-t * 90), lo=2500) * 0.6
    t2 = t - 0.045
    out += fft_filter(rng.standard_normal(n) * np.exp(-np.maximum(t2, 0) * 70) * (t2 > 0), lo=1800) * 0.8
    for f, d in ((2380, 9), (3710, 12), (5150, 16), (1270, 7)):
        out += np.sin(2 * np.pi * f * t) * np.exp(-t * d) * 0.12
    return out * amp


def shimmer(freqs, dur, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = sum(np.sin(2 * np.pi * f * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.3 + i * 0.17) * t)) for i, f in enumerate(freqs))
    e = np.minimum(t / (dur * 0.4), 1) * np.minimum((dur - t) / (dur * 0.3), 1)
    return out * e * amp * 0.02


def drone(freq, dur, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.003 * t) + 0.15 * np.sin(2 * np.pi * freq * 3 * t)
    e = np.minimum(t / (dur * 0.5), 1) * np.minimum((dur - t) / 0.8, 1)
    return out * e * amp * 0.22


def chord(names, t0, dur, amp=1.0, **kw):
    for i, nm in enumerate(names):
        place(strings(midi(n2m(nm)), dur, amp, **kw), t0 + i * 0.015, pan=-0.5 + i / max(1, len(names) - 1), rev=0.5)


# ---------------------------------------------------------------- arrangement
# A · Genesis (0 – 6.95)
place(drone(midi(n2m('D1')), 7.6, 1.0), 0.0, 0, rev=0.1)
place(drone(midi(n2m('A1')), 7.0, 0.5), 0.6, 0, rev=0.1)
place(shimmer([midi(n2m('D6')), midi(n2m('A6')), midi(n2m('E7'))], 7.2, 1.0), 0.2, 0, rev=0.9)
for i, tt in enumerate([1.15, 1.6, 2.3, 3.25, 3.7, 4.4]):
    place(blip(2200 + 600 * (i % 3), 0.7), tt, pan=(-0.6 if i % 2 else 0.6), rev=0.6)
place(piano(midi(n2m('D4')), 0.5), 1.1, -0.2, rev=0.8)
place(piano(midi(n2m('A4')), 0.45), 3.2, 0.2, rev=0.8)
place(riser(1.9, 0.9, 200, 9000), 5.05, 0, rev=0.4)

HITS = [6.95, 15.0, 23.0, 30.25, 54.2]
for h in HITS:
    place(boom(1.0 if h in (6.95, 54.2) else 0.85), h, 0, rev=0.35)

# B · The Silver Fox (6.95 – 15)
chord(['D2', 'A2', 'D3', 'F3', 'A3', 'D4'], 6.95, 4.0, 1.0, attack=0.35)
chord(['Bb1', 'F2', 'D3', 'F3', 'Bb3', 'D4'], 11.0, 4.0, 1.0)
place(brass(midi(n2m('D2')), 3.8, 1.0, attack=0.25), 6.95, -0.1, rev=0.4)
place(brass(midi(n2m('A2')), 3.6, 0.7, attack=0.6), 7.2, 0.15, rev=0.4)
place(brass(midi(n2m('Bb1')), 3.6, 1.0), 11.0, -0.1, rev=0.4)
place(brass(midi(n2m('F2')), 3.5, 0.7), 11.1, 0.1, rev=0.4)
for i, nm in enumerate(['D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'F5', 'D5']):     # violin line
    place(strings(midi(n2m(nm)), 0.95, 0.45, attack=0.25, release=0.9, bright=1.2), 8.0 + i * 0.85, 0.3, rev=0.6)
place(riser(1.6, 0.8), 13.4, 0, rev=0.4)

# C · Global defense (15 – 23): ostinato, taiko, progression Dm Bb F C
prog_c = [('D', ['D3', 'F3', 'A3', 'D4']), ('Bb', ['D3', 'F3', 'Bb3', 'D4']), ('F', ['C3', 'F3', 'A3', 'C4']), ('C', ['C3', 'E3', 'G3', 'C4'])]
roots_c = {'D': 'D2', 'Bb': 'Bb1', 'F': 'F2', 'C': 'C2'}
for k, (r, notes) in enumerate(prog_c):
    t0 = 15.0 + k * 2.0
    chord(notes, t0, 1.9, 0.75)
    for s in range(8):
        tt = t0 + s * 0.25
        place(stacc(midi(n2m(roots_c[r])) * (2 if s % 4 == 3 else 1), 0.9 if s % 2 == 0 else 0.6), tt, pan=-0.2 if s % 2 else 0.2, rev=0.2)
for b in range(16):
    tt = 15.0 + b * 0.5
    place(taiko(0.9 if b % 4 == 0 else 0.5 if b % 2 == 0 else 0.3), tt, pan=0.15 * ((b % 3) - 1), rev=0.3)
for i in range(22):
    place(blip(1800 + (i * 377) % 2600, 0.5), 15.5 + i * 0.33 + (i % 3) * 0.05, pan=((i * 0.37) % 1.6) - 0.8, rev=0.5)

# D · Encryption (23 – 30.25): Gm Bb A, 16th pulse, lock, riser
prog_d = [(23.0, 2.0, 'G1', ['G2', 'D3', 'G3', 'Bb3', 'D4']), (25.0, 2.0, 'Bb1', ['Bb2', 'F3', 'Bb3', 'D4', 'F4']), (27.0, 1.7, 'A1', ['A2', 'E3', 'A3', 'C#4', 'E4'])]
for t0, d, root, notes in prog_d:
    chord(notes, t0, d, 0.8, attack=0.4)
    place(brass(midi(n2m(root)) * 2, d, 0.8, attack=0.3), t0, 0, rev=0.4)
    for s in range(int(d / 0.125)):
        place(stacc(midi(n2m(root)) * 2, 0.75 if s % 4 == 0 else 0.45, 0.1), t0 + s * 0.125, pan=-0.3 if s % 2 else 0.3, rev=0.15)
for b in range(11):
    place(taiko(0.8 if b % 2 == 0 else 0.45), 23.0 + b * 0.5, rev=0.3)
for i in range(16):                                         # timpani-style roll into lock
    place(taiko(0.15 + 0.5 * i / 16), 27.0 + i * 0.1, rev=0.3)
place(metal_click(1.0), 28.68, 0, rev=0.6)
place(boom(0.7, f0=90), 28.7, 0, rev=0.4)
place(strings(midi(n2m('A2')), 1.2, 0.6, attack=0.05, release=1.6), 28.7, 0, rev=0.7)
place(riser(0.85, 0.9, 400, 9000), 29.4, 0, rev=0.3)
place(whoosh(0.9, 0.8), 22.6, 0, rev=0.3)

# E · Web / CRM / Automation (30.25 – 45): F C Dm Bb F C Gm A, plucks
prog_e = [('F2', ['F3', 'A3', 'C4', 'F4'], ['F5', 'A5', 'C6', 'A5']), ('C2', ['E3', 'G3', 'C4', 'E4'], ['E5', 'G5', 'C6', 'G5']),
          ('D2', ['F3', 'A3', 'D4', 'F4'], ['D5', 'F5', 'A5', 'F5']), ('Bb1', ['F3', 'Bb3', 'D4', 'F4'], ['D5', 'F5', 'Bb5', 'F5']),
          ('F2', ['F3', 'A3', 'C4', 'F4'], ['F5', 'A5', 'C6', 'A5']), ('C2', ['E3', 'G3', 'C4', 'E4'], ['E5', 'G5', 'C6', 'G5']),
          ('G1', ['G3', 'Bb3', 'D4', 'G4'], ['D5', 'G5', 'Bb5', 'G5']), ('A1', ['A3', 'C#4', 'E4', 'A4'], ['C#5', 'E5', 'A5', 'E5'])]
starts = [30.25, 32.0, 33.75, 35.5, 37.25, 39.25, 41.2, 43.2]
for k, (root, notes, arp) in enumerate(prog_e):
    t0 = starts[k]
    d = (starts[k + 1] if k + 1 < len(starts) else 45.1) - t0
    chord(notes, t0, d, 0.6, attack=0.5)
    place(strings(midi(n2m(root)), d, 0.8, attack=0.3), t0, 0, rev=0.3)
    steps = int(d / 0.125)
    for s in range(steps):
        nm = arp[s % 4]
        oct_up = 2 if (s // 4) % 2 else 1
        place(pluck(midi(n2m(nm)) * oct_up, 0.55 if s % 4 == 0 else 0.35), t0 + s * 0.125, pan=np.sin(s * 0.7) * 0.7, rev=0.45)
        if s % 2 == 0:
            place(stacc(midi(n2m(root)) * 2, 0.45, 0.12), t0 + s * 0.125, 0, rev=0.15)
for b in range(30):
    tt = 30.25 + b * 0.5
    if tt > 44.9:
        break
    place(taiko(0.55 if b % 4 == 0 else 0.25), tt, rev=0.3)
for h in (37.25, 41.2):
    place(whoosh(0.8, 0.6), h - 0.45, 0, rev=0.3)
    place(boom(0.45, f0=100), h, 0, rev=0.4)
for i in range(30):
    place(blip(2600 + (i * 911) % 2200, 0.35), 37.5 + i * 0.25 + (i % 2) * 0.06, pan=((i * 0.61) % 1.6) - 0.8, rev=0.5)

# F · Founder (45.1 – 52.2): piano motif over warm strings
place(whoosh(0.9, 0.5), 44.5, 0, rev=0.4)
place(boom(0.4, f0=80), 45.1, 0, rev=0.5)
for t0, d, notes in [(45.1, 1.8, ['Bb2', 'F3', 'Bb3', 'D4']), (46.9, 1.8, ['A2', 'F3', 'A3', 'C4']), (48.7, 1.8, ['G2', 'D3', 'G3', 'Bb3']), (50.5, 1.9, ['A2', 'E3', 'A3', 'C#4'])]:
    chord(notes, t0, d, 0.55, attack=0.7, bright=0.8)
melody = [(45.4, 'D5'), (46.0, 'F5'), (46.6, 'A5'), (47.2, 'C6'), (47.8, 'A5'), (48.4, 'F5'), (49.0, 'G5'), (49.6, 'Bb5'), (50.2, 'D6'), (50.8, 'C#6'), (51.6, 'A5')]
for tt, nm in melody:
    place(piano(midi(n2m(nm)), 0.8), tt, 0.15, rev=0.75)
    place(piano(midi(n2m(nm)) / 2, 0.3), tt, -0.15, rev=0.75)

# G · Finale (52.2 – 60): build, D-major resolution, chimes
chord(['G2', 'D3', 'G3', 'Bb3', 'D4'], 52.2, 1.0, 0.7, attack=0.3)
chord(['A2', 'E3', 'A3', 'C#4', 'E4'], 53.2, 1.0, 0.85, attack=0.2)
for i in range(18):
    place(taiko(0.2 + 0.7 * (i / 18) ** 1.5), 52.4 + i * 0.1, rev=0.3)
place(riser(2.0, 1.0, 200, 10000), 52.2, 0, rev=0.4)
chord(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4', 'F#4', 'A4'], 54.2, 4.6, 1.0, attack=0.12, release=2.0)
for nm in ['D1', 'D2', 'A2']:
    place(brass(midi(n2m(nm)), 4.4, 1.0, attack=0.15, release=1.8), 54.2, 0, rev=0.45)
place(brass(midi(n2m('F#3')), 4.0, 0.6, attack=0.6), 54.5, 0.2, rev=0.5)
place(drone(midi(n2m('D1')), 5.6, 0.9), 54.2, 0, rev=0.1)
place(shimmer([midi(n2m('D6')), midi(n2m('F#6')), midi(n2m('A6'))], 5.5, 1.4), 54.4, 0, rev=0.9)
for tt, nm in [(55.0, 'A5'), (55.25, 'D6'), (56.4, 'F#6'), (57.6, 'A6')]:
    place(piano(midi(n2m(nm)), 0.55), tt, 0.1, rev=0.85)

# ---------------------------------------------------------------- reverb + master
def make_ir(seconds=3.4):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.zeros((2, n))
    for c in range(2):
        x = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds)
        bright = fft_filter(x * np.exp(-t * 6), hi=7000)
        dark = fft_filter(x, hi=2200)
        ir[c] = bright * 0.5 + dark
        ir[c, :int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.abs(ir).max()


def convolve(x, h):
    L = len(x) + len(h) - 1
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[:len(x)]


ir = make_ir()
wet = np.vstack([convolve(send[0], ir[0]), convolve(send[1], ir[1])])
wet *= np.abs(dry).max() / (np.abs(wet).max() + 1e-9) * 0.55
mix = dry + wet
# gentle low-shelf weight + glue
mix = np.vstack([fft_filter(ch, lo=24) for ch in mix])
mix = mix / np.abs(mix).max()
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix = mix[:, :int(DUR * SR)]
fade = int(0.5 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix = mix / np.abs(mix).max() * 10 ** (-1 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
pcm = (mix.T * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, mix.shape[1] / SR, 's')
