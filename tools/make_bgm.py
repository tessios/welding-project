#!/usr/bin/env python3
"""wps-d1.1/audio/bgm_terran.mp3 생성기 — 오리지널 '테란풍' 인더스트리얼 루프

스타크래프트 테란 테마의 분위기(단조·행진 리듬·디스토션 기타 리프·신스 브라스·금속 타격)만
참고해 새로 작곡한 오리지널 루프입니다. 샘플·원곡 소재는 사용하지 않습니다.

구성: 96 BPM, 4/4, 16마디(40초) 루프 · Em–C–G–D
악기: 킥/스네어/하이햇, 디스토션 파워코드, 서브 베이스, 브라스 스타브, 패드, 앤빌(금속) 타격
"""
import numpy as np, subprocess, os, imageio_ffmpeg

SR = 44100
BPM = 96.0
BEAT = 60.0 / BPM
BAR = BEAT * 4
BARS = 16
DUR = BAR * BARS
N = int(DUR * SR)
FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio", "bgm_terran.mp3")

rng = np.random.default_rng(11)


# ── 기본 DSP ────────────────────────────────────────────────────────────
def fft_band(x, lo=None, hi=None, soft=0.15):
    """FFT 기반 대역 필터 (정적). lo/hi Hz."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + np.exp(-(f - lo) / (lo * soft + 1e-9)))
    if hi:
        m *= 1 / (1 + np.exp((f - hi) / (hi * soft + 1e-9)))
    return np.fft.irfft(X * m, n)


def env_ad(n, a=0.005, d=0.2, curve=3.0):
    t = np.arange(n) / SR
    at = np.clip(t / max(a, 1e-6), 0, 1)
    return at * np.exp(-np.maximum(0, t - a) * (curve / d))


def note(name):
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    p, octv = name[:-1], int(name[-1])
    midi = 12 * (octv + 1) + names[p]
    return 440.0 * 2 ** ((midi - 69) / 12)


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * freq + phase) % 1.0) - 1


def sine(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t + phase)


def noise(n):
    return rng.normal(0, 1, n)


def add(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def midi_f(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ── 악기 ────────────────────────────────────────────────────────────────
def kick(vel=1.0):
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 118 * np.exp(-t * 22) + 44
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    click = noise(n) * np.exp(-t * 220) * 0.35
    return np.tanh((body + click) * 1.5) * 0.9 * vel


def snare(vel=1.0):
    n = int(0.26 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 186 * t) * np.exp(-t * 26) * 0.6
    nz = fft_band(noise(n), 900, 7200) * np.exp(-t * 17)
    return np.tanh((body + nz * 0.9) * 1.2) * 0.55 * vel


def hat(vel=1.0, open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    nz = fft_band(noise(n), 6500, 15000)
    return nz * np.exp(-t * (14 if open_ else 55)) * 0.32 * vel


def anvil(vel=1.0):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f, a in ((523, .5), (1187, .32), (1760, .22), (2637, .14), (3512, .08)):
        sig += a * np.sin(2 * np.pi * f * t) * np.exp(-t * (5 + f / 900))
    sig += fft_band(noise(n), 2000, 9000) * np.exp(-t * 40) * 0.5
    return np.tanh(sig * 1.3) * 0.3 * vel


def power_chord(root_midi, dur, vel=1.0, palm=False, bright=1.0):
    n = int(dur * SR)
    f0 = midi_f(root_midi)
    sig = np.zeros(n)
    for mult, amp in ((1, 1.0), (2, 0.75), (3, 0.35), (4, 0.18)):
        for det in (-0.004, 0.0, 0.005):
            sig += amp * saw(f0 * mult * (1 + det), n, rng.uniform())
    sig = np.tanh(sig * (2.6 if not palm else 1.9))
    sig = fft_band(sig, 90, (1700 if palm else 2700) * bright)
    a = 0.004 if not palm else 0.002
    e = np.exp(-np.arange(n) / SR * (7 if palm else 2.4))
    e *= np.clip(np.arange(n) / SR / a, 0, 1)
    return sig * e * 0.34 * vel


def bass(root_midi, dur, vel=1.0):
    n = int(dur * SR)
    f = midi_f(root_midi)
    sig = 0.7 * saw(f, n) + 0.5 * sine(f / 2, n) + 0.25 * sine(f, n)
    sig = np.tanh(sig * 1.9)
    sig = fft_band(sig, 35, 320)
    e = np.clip(np.arange(n) / SR / 0.008, 0, 1) * np.exp(-np.arange(n) / SR * 3.4)
    return sig * e * 0.62 * vel


def brass(midi_list, dur, vel=1.0):
    n = int(dur * SR)
    sig = np.zeros(n)
    for m in midi_list:
        f = midi_f(m)
        for det in (-0.006, 0, 0.007):
            sig += saw(f * (1 + det), n, rng.uniform())
    sig = np.tanh(sig * 1.4)
    sig = fft_band(sig, 120, 4200)
    e = np.clip(np.arange(n) / SR / 0.03, 0, 1) * np.exp(-np.arange(n) / SR * 4.2)
    return sig * e * 0.22 * vel


def pad(midi_list, dur, vel=1.0):
    n = int(dur * SR)
    sig = np.zeros(n)
    for m in midi_list:
        f = midi_f(m)
        for det in (-0.008, -0.003, 0.004, 0.009):
            sig += saw(f * (1 + det), n, rng.uniform())
    sig = fft_band(sig, 120, 2600)
    t = np.arange(n) / SR
    trem = 1 + 0.12 * np.sin(2 * np.pi * 0.18 * t)
    e = np.clip(t / 0.6, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return sig * e * trem * 0.09 * vel


# ── 곡 구성 ─────────────────────────────────────────────────────────────
def build():
    drums = np.zeros(N)
    music = np.zeros(N)
    amb = np.zeros(N)

    prog = [  # (bass root midi, chord midi set)
        (40, [52, 55, 59, 64]),   # Em
        (40, [52, 55, 59, 64]),
        (36, [48, 52, 55, 60]),   # C
        (43, [50, 55, 59, 62]),   # G
        (40, [52, 55, 59, 64]),   # Em
        (40, [52, 55, 59, 64]),
        (38, [50, 54, 57, 62]),   # D
        (43, [50, 55, 59, 62]),   # G
    ]

    for bar in range(BARS):
        t0 = bar * BAR
        root, chord = prog[bar % 8]
        section = 'intro' if bar < 4 else ('main' if bar < 12 else 'break')

        # 드럼
        for b in range(4):
            tb = t0 + b * BEAT
            if section != 'break':
                add(drums, kick(1.0 if b in (0, 2) else 0.72), tb)
                if b in (1, 3):
                    add(drums, snare(1.0 if b == 3 else 0.85), tb)
            else:
                if b in (0, 2):
                    add(drums, kick(0.8), tb)
        if section != 'break':
            for i in range(8):
                th = t0 + i * BEAT / 2
                add(drums, hat(0.34 if i % 2 else 0.19, open_=(i == 7)), th)
        if bar % 4 == 0:
            add(drums, anvil(0.9), t0)

        # 베이스 (8분음)
        pattern = [0, 0, 0, 0, 3, 3, 6, 7]
        for i, step in enumerate(pattern):
            tb = t0 + i * BEAT / 2
            m = root - 12 if section == 'break' and i % 2 else root
            add(music, bass(m, BEAT / 2 * 0.92, 1.0 if i % 2 == 0 else 0.72), tb)

        # 리프 (파워코드)
        riff = [0, 0, 0, 0, 5, 5, 7, 7]   # 반음 오프셋: 루트, +5(P4), +7(P5)
        if section != 'break':
            for i, off in enumerate(riff):
                tb = t0 + i * BEAT / 2
                vel = 1.0 if i % 2 == 0 else 0.7
                palm = section == 'intro'
                add(music, power_chord(root + 12 + off, BEAT / 2 * 0.85, vel, palm=palm,
                                       bright=0.8 if palm else 1.0), tb)

        # 브라스 스타브
        if section == 'main' and bar % 2 == 1:
            add(music, brass([c + 12 for c in chord[:3]], BEAT * 0.7, 0.9), t0 + BEAT * 2)

        # 패드 (마디 전체)
        add(music, pad(chord, BAR * 0.98, 1.0 if section != 'break' else 0.7), t0)

        # 금속 타격 액센트
        if bar % 8 == 4:
            add(drums, anvil(0.55), t0 + BEAT * 2)

    # 앰비언스: 저역 럼블 + 미세 노이즈
    t = np.arange(N) / SR
    rumble = fft_band(noise(N), 25, 120) * 0.05
    hiss = fft_band(noise(N), 3000, 12000) * 0.006
    amb = rumble + hiss

    # 사이드체인 (킥 지점에서 패드·기타를 살짝 눌러줌)
    duck = np.ones(N)
    for bar in range(BARS):
        for b in (0, 2):
            at = bar * BAR + b * BEAT
            i = int(at * SR)
            ln = int(0.22 * SR)
            if i + ln < N:
                duck[i:i + ln] *= np.linspace(1.0, 0.62, ln) ** 1.0
                duck[i + ln:i + ln + int(0.12 * SR)] = np.minimum(
                    duck[i + ln:i + ln + int(0.12 * SR)], 0.62)
    music *= duck

    # 간단한 딜레이(테크노 느낌의 넓은 잔향)
    for dly, g in ((0.19, 0.14), (0.37, 0.08)):
        k = int(dly * SR)
        music[k:] += music[:-k] * g
        drums[k:] += drums[:-k] * g * 0.4

    mixL = music * 0.95 + drums * 0.9 + amb
    mixR = np.roll(music, int(0.012 * SR)) * 0.95 + drums * 0.88 + np.roll(amb, 97)

    # 마스터 — 저역 보강 · 고역 정리 (테란풍 묵직한 인더스트리얼 톤)
    def tone(x):
        low = fft_band(x, None, 150)
        mid = fft_band(x, 150, 5200)
        high = x - low - mid
        return np.tanh((low * 1.45 + mid * 0.95 + high * 0.55) * 1.2)
    mixL = tone(mixL)
    mixR = tone(mixR)
    peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
    mixL = mixL / peak * 0.86
    mixR = mixR / peak * 0.86

    # 루프 이음 정리
    fade = int(0.35 * SR)
    for ch in (mixL, mixR):
        ch[:fade] *= np.linspace(0.15, 1.0, fade)
        ch[-fade:] *= np.linspace(1.0, 0.15, fade)

    st = np.stack([mixL, mixR], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    raw = os.path.join(os.path.dirname(OUT), ".bgm_raw.raw")
    pcm.tofile(raw)
    subprocess.run([FF, "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2",
                    "-i", raw, "-b:a", "144k", OUT], check=True)
    os.remove(raw)
    print("wrote", OUT, "dur", DUR, "s")


if __name__ == "__main__":
    build()
