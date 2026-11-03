"""SILVERFOXNS — shared synthesis toolkit (instruments, busses, reverb helpers).

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


