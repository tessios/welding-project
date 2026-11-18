#!/usr/bin/env python3
"""WPS작성 실습 — 음성·효과음 생성기 (v4)

- 아나운서 단일 톤(ko-KR-SunHiNeural): 상황 안내·핵심 정리·결과·사고 원인·엔딩
  · 전화 대사(p*/s*/f*)와 인물 음성은 제거했습니다. 장면의 대화는 화면 자막·말풍선으로만 진행합니다.
- 효과음: 전화벨 · 금속 파단 · 철골 붕괴 · 수화기 · 성공 차임 (numpy 합성)

사용: python3 tools/make_audio.py            # 전체 생성
      python3 tools/make_audio.py --only n_pass,n_end_pass
      python3 tools/make_audio.py --verify   # 생성된 파일 전사 검수 (faster-whisper)
출력: audio/*.mp3
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "audio")
TMP = os.path.join(ROOT, ".audio_tmp")
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

import imageio_ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

ANCHOR = "ko-KR-SunHiNeural"

# ── 대본 ────────────────────────────────────────────────────────────────
# 숫자·약어는 한국어 발음 표기로 적는다(발음 뭉개짐 방지).
# data.js의 SCENARIO.narr.text와 같은 문장이어야 자막과 음성이 일치한다.
NARR = {
    "n_call": ("anchor", "11월 18일 아침, 해외 철골 현장의 품질 사무소입니다. 내일 아침 첫 아크를 앞두고 시공팀장이 전화를 겁니다. 보 웨브에 브래킷을 붙이는 수직 필렛, 그런데 아직 용접절차서가 없습니다."),
    "n_summary": ("anchor", "받은 정보를 정리해 보겠습니다. 재질은 에이에스티엠 에이 삼십육, 두께는 십이 밀리미터, 자세는 세로로 올라가는 수직 필렛입니다. 에이 삼십육은 사전인정 모재 목록인 테이블 오 점 육, 그룹 원에 올라 있습니다. 그래서 시험 없이 사전인정으로 갈 수 있습니다. 다만 필러와 가스, 예열, 자세가 규정 조항 오의 조건을 하나라도 벗어나면 그 순간 시험 인정으로 넘어갑니다. 지금 비어 있는 것은 와이어와 예열, 그리고 인정 방식, 세 가지입니다."),
    "n_brief": ("anchor", "내일 아침 일곱 시, 보 웨브에 브래킷을 세워 붙이는 수직 필렛입니다. 재질은 에이에스티엠 에이 삼십육, 두께는 십이 밀리미터, 각장은 육 밀리미터입니다. 오른쪽 현장 상황 네 가지를 직접 열어 확인하세요. 내일 예보와 측정 기록, 사내 절차서 목록, 그리고 자재 재고가 여러분의 판단을 기다립니다."),
    "n_wps": ("anchor", "빈 용접절차서 한 장입니다. 모두 스무 칸을 채워야 합니다. 선택할 수 있는 칸은 보기 중에서 고르고, 수치와 코드는 직접 계산해 적으세요. 파란 점은 현장 정보, 주황 점은 에이더블유에스 디 원 점 원, 이천이십오년판 원문 근거입니다. 각 칸의 물음표를 누르면 조항과 해설이 열립니다."),
    "n_pass": ("anchor", "검사 통과입니다. 치명 오류 없이 백 점입니다. 인정 근거와 필수변수가 모두 규정 안에 들어왔습니다. 이 한 장으로 내일 아침 용접이 진행됩니다."),
    "n_end_pass": ("anchor", "다음 날 오후, 시공팀장에게서 연락이 왔습니다. 용접은 오전에 끝났고, 감리는 절차서의 사전인정 근거가 정확하다고 확인했습니다. 영하의 아침이었지만 예열을 지킨 덕분에 결함 없이 마무리됐습니다. 오늘 남는 것은 세 가지입니다. 모재와 두께로 인정 방식을 먼저 정하고, 필수변수는 근거 조항으로 확인하고, 현장 조건은 숫자로 적어 남긴다."),
    "n_fail": ("anchor", "부적합입니다. 제출한 절차서의 필수변수가 현장 조건과 맞지 않아 브래킷 필렛에서 균열이 발생했습니다. 작업은 즉시 중지됐고, 감리는 원인 조항과 함께 재작성을 지시했습니다."),
    "n_end_fail": ("anchor", "철골은 절차서 한 장의 빈칸에서 무너졌습니다. 다시 작성할 때는 틀린 칸만 비워집니다. 근거를 확인하고 수치를 직접 계산해 채우면 다음 판은 통과할 수 있습니다. 오늘의 실패를 그대로 두지 마세요."),
    "n_cause_hydrogen": ("anchor", "원인은 예열입니다. 영하 삼 도의 모재에 예열 없이 용접하면 용접부가 급랭하고 수소가 비드 아래에 머뭅니다. 하중이 걸린 뒤 토우에서 지연 균열이 시작됩니다. 테이블 오 점 일일은 모재가 영하일 때 최소 이십 도 예열과 층간 유지를 요구합니다."),
    "n_cause_throat": ("anchor", "원인은 필러 선택입니다. 이 칠십 티 원 시는 아래보기와 수평 전용이라 수직에서 비드가 흘러내립니다. 유효 목두께가 모자라자 전단으로 파단됐습니다."),
    "n_cause_fusion": ("anchor", "원인은 자세와 용입입니다. 수직 하진이나 아래보기 조건으로는 십이 밀리 판의 루트까지 용입이 들어가지 않습니다. 루트 경계에서 비드가 껍질처럼 박리됐습니다."),
    "n_cause_porosity": ("anchor", "원인은 가스 차폐입니다. 분류 문자와 다른 가스를 쓰거나, 초속 삼에서 사 미터의 바람 속에서 방풍 없이 용접하면 차폐가 깨집니다. 비드 안에 기공이 벌집처럼 생겼습니다."),
    "n_cause_reject": ("anchor", "원인은 근거 문서입니다. 모재 그룹이나 인정 방식이 규정과 맞지 않으면 사전인정도 시험 인정도 성립하지 않습니다. 감리는 근거 문서를 요구하며 절차서를 반려했습니다."),
}

VOICE_PARAMS = {
    "anchor": dict(voice=ANCHOR, rate="-4%", pitch="-2Hz"),
}

FILTERS = {
    "anchor": "highpass=f=90,lowpass=f=13000,acompressor=threshold=-20dB:ratio=2:attack=10:release=180,volume=1.02",
}


def run(cmd, **kw):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw)
    if p.returncode != 0:
        raise RuntimeError("ffmpeg failed: %s\n%s" % (" ".join(cmd), p.stderr.decode()[-1500:]))
    return p.stdout


def tts(text, voice, rate, pitch, raw):
    async def go():
        import edge_tts
        c = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await c.save(raw)
    asyncio.run(go())


def polish(raw, out, kind):
    """앞뒤 무음 제거 → 페이드 → 톤 필터 → 음량 정규화 → mp3"""
    chain = (
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
        + FILTERS[kind] + ","
        "afade=t=in:st=0:d=0.02,"
        "loudnorm=I=-16:TP=-1.5:LRA=10"
    )
    run([FFMPEG, "-y", "-loglevel", "error", "-i", raw, "-af", chain,
         "-ar", "44100", "-ac", "1", "-b:a", "72k", out])


def wav_write(path, data, sr=44100):
    data = np.clip(data, -1, 1)
    pcm = (data * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def gen_sfx():
    sr = 44100
    rng = np.random.default_rng(7)

    # 1) 전화벨 (수신음: 1초 울림 + 2초 정지 × 2)
    t = np.linspace(0, 1.0, int(sr * 1.0), False)
    tone = 0.30 * np.sin(2 * np.pi * 440 * t) + 0.22 * np.sin(2 * np.pi * 480 * t)
    env = np.minimum(1, np.minimum(t / 0.02, (1.0 - t) / 0.06))
    ring = tone * env
    ring = np.tanh(ring * 1.6) * 0.55
    gap = np.zeros(int(sr * 2.0))
    seq = np.concatenate([ring, gap, ring, gap, ring])
    seq = np.concatenate([seq, np.zeros(int(sr * 0.2))])
    wav_write(os.path.join(TMP, "ring.wav"), seq, sr)
    run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(TMP, "ring.wav"),
         "-af", "highpass=f=250,lowpass=f=4000,afade=t=out:st=%.2f:d=0.15" % (len(seq) / sr - 0.15),
         "-ar", "44100", "-ac", "1", "-b:a", "72k", os.path.join(OUT, "sfx_ring.mp3")])

    # 2) 금속 파단 (짧은 크랙 + 금속 링)
    n = int(sr * 1.1)
    tt = np.arange(n) / sr
    noise = rng.normal(0, 1, n)
    burst = noise * np.exp(-tt * 26)
    ping = (0.5 * np.sin(2 * np.pi * 1780 * tt) + 0.3 * np.sin(2 * np.pi * 2630 * tt)) * np.exp(-tt * 7)
    crack = 0.55 * burst + 0.35 * ping
    crack = np.tanh(crack * 1.8) * 0.8
    wav_write(os.path.join(TMP, "crack.wav"), crack, sr)
    run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(TMP, "crack.wav"),
         "-af", "highpass=f=90,afade=t=out:st=0.9:d=0.2", "-b:a", "72k",
         os.path.join(OUT, "sfx_crack.mp3")])

    # 3) 철골 붕괴 (저주파 럼블 + 파편 + 먼지)
    n = int(sr * 4.6)
    tt = np.arange(n) / sr
    rumble = rng.normal(0, 1, n)
    k = 120
    rumble = np.convolve(rumble, np.ones(k) / k, mode="same")
    rumble = rumble / (np.max(np.abs(rumble)) + 1e-9)
    env = np.minimum(1, tt / 0.25) * np.exp(-np.maximum(0, tt - 1.2) * 0.75)
    sub = 0.5 * np.sin(2 * np.pi * (52 - 18 * np.minimum(tt, 2.2) / 2.2) * tt) * np.exp(-tt * 0.9)
    debris = np.zeros(n)
    for i in range(70):
        st = int(rng.uniform(0.4, 3.6) * sr)
        ln = int(rng.uniform(0.03, 0.16) * sr)
        if st + ln >= n:
            continue
        amp = rng.uniform(0.05, 0.4) * (1 - st / n)
        seg = rng.normal(0, 1, ln) * np.exp(-np.arange(ln) / (ln * 0.35))
        debris[st:st + ln] += amp * seg
    metal = np.zeros(n)
    for f in (180, 320, 470, 690, 980):
        metal += 0.05 * np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * np.exp(-tt * 1.6)
    mix = 1.15 * rumble * env + 0.55 * sub + 0.9 * debris + metal * 0.4
    mix = np.tanh(mix * 1.5) * 0.82
    wav_write(os.path.join(TMP, "collapse.wav"), mix, sr)
    run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(TMP, "collapse.wav"),
         "-af", "lowpass=f=6000,afade=t=in:d=0.05,afade=t=out:st=4.2:d=0.4", "-b:a", "80k",
         os.path.join(OUT, "sfx_collapse.mp3")])

    # 4) 수화기 내려놓기 (짧은 클릭)
    n = int(sr * 0.5)
    tt = np.arange(n) / sr
    click = rng.normal(0, 1, n) * np.exp(-tt * 70)
    click += 0.4 * np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 30)
    wav_write(os.path.join(TMP, "hang.wav"), np.tanh(click * 2) * 0.7, sr)
    run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(TMP, "hang.wav"),
         "-af", "highpass=f=200", "-b:a", "72k", os.path.join(OUT, "sfx_hangup.mp3")])

    # 5) 성공 차임 (두 음 상승 + 금속 잔향) — 합격 엔딩용
    n = int(sr * 1.9)
    tt = np.arange(n) / sr
    def bell(f, start, amp, decay=2.1):
        i0 = int(start * sr)
        seg = np.zeros(n)
        local = tt[i0:] - start
        seg[i0:] = amp * (np.sin(2 * np.pi * f * local) + 0.35 * np.sin(2 * np.pi * f * 2.01 * local)) \
            * np.exp(-local * decay) * np.minimum(1, local / 0.012)
        return seg
    chime = bell(784, 0.0, 0.46) + bell(1175, 0.16, 0.40) + bell(1568, 0.32, 0.30)
    shimmer = rng.normal(0, 1, n) * np.exp(-np.maximum(0, tt - 0.32) * 6.5) * 0.05
    shimmer = np.convolve(shimmer, np.ones(24) / 24, mode="same")
    chime = np.tanh((chime + shimmer) * 1.15) * 0.72
    chime *= np.minimum(1, (n - np.arange(n)) / (0.2 * sr))
    wav_write(os.path.join(TMP, "success.wav"), chime, sr)
    run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(TMP, "success.wav"),
         "-af", "highpass=f=120,afade=t=out:st=1.7:d=0.2", "-b:a", "80k",
         os.path.join(OUT, "sfx_success.mp3")])


def build(only=None):
    if not only:
        gen_sfx()
    for k, (kind, text) in NARR.items():
        if only and k not in only:
            continue
        raw = os.path.join(TMP, k + ".mp3")
        p = VOICE_PARAMS[kind]
        try:
            tts(text, p["voice"], p["rate"], p["pitch"], raw)
        except Exception as e:
            print("TTS retry", k, e)
            tts(text, p["voice"], p["rate"], p["pitch"], raw)
        polish(raw, os.path.join(OUT, k + ".mp3"), kind)
        print("ok", k, kind)


def load_audio16k(path):
    raw = run([FFMPEG, "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()


def verify():
    # 2GB 환경에서 small-int8을 올리려면 MKL 할당을 끈다
    os.environ.setdefault("OMP_NUM_THREADS", "1")
    os.environ.setdefault("MKL_NUM_THREADS", "1")
    os.environ.setdefault("CT2_USE_MKL", "0")
    from faster_whisper import WhisperModel
    import difflib, re
    model_dir = os.path.join(os.path.dirname(ROOT), "models", "small-int8")
    used = "small-int8"
    if not os.path.isdir(model_dir):
        model_dir = os.path.join(os.path.dirname(ROOT), "models", "models--Systran--faster-whisper-tiny", "snapshots", "d90ca5fe260221311c53c58e660288d3deb8d356")
        used = "tiny-int8"
    try:
        m = WhisperModel(model_dir, device="cpu", compute_type="int8", cpu_threads=1, num_workers=1)
    except Exception as e:
        print("small 모델 로드 실패 — tiny로 대체:", e)
        model_dir = os.path.join(os.path.dirname(ROOT), "models", "models--Systran--faster-whisper-tiny", "snapshots", "d90ca5fe260221311c53c58e660288d3deb8d356")
        m = WhisperModel(model_dir, device="cpu", compute_type="int8", cpu_threads=1, num_workers=1)
        used = "tiny-int8"
    files = sorted(f for f in os.listdir(OUT) if f.endswith(".mp3") and not f.startswith(("sfx_", "bgm_")))
    report = {"__note": "%s 전사. 인물 통화 음성은 제거되어 아나운서 내레이션만 검수합니다." % used}
    norm = lambda s: re.sub(r"[^0-9A-Za-z가-힣]", "", s)
    for f in files:
        path = os.path.join(OUT, f)
        audio_in = load_audio16k(path)
        segs, info = m.transcribe(
            audio_in, language="ko", beam_size=3, vad_filter=True,
            initial_prompt="용접절차서 WPS, 에이에스티엠 에이 삼십육, 예열, 입열량, 필렛, 사전인정")
        text = " ".join(s.text.strip() for s in segs)
        key = f[:-4]
        expected = NARR.get(key, ("", ""))[1]
        ratio = round(difflib.SequenceMatcher(None, norm(text), norm(expected)).ratio(), 3) if expected else None
        report[f] = {"text": text, "dur": round(float(len(audio_in)) / 16000, 2), "match": ratio}
        print("%-26s %5.2fs  match=%s  %s" % (f, report[f]["dur"], ratio, text))
    with open(os.path.join(ROOT, "docs", "audio_transcript.json"), "w") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    if "--verify" in sys.argv:
        verify()
    else:
        only = None
        for i, a in enumerate(sys.argv):
            if a == "--only" and i + 1 < len(sys.argv):
                only = {x.strip() for x in sys.argv[i + 1].split(",") if x.strip()}
        build(only)
