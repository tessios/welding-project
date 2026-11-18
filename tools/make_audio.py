#!/usr/bin/env python3
"""WPS작성 실습 — 음성·효과음 생성기

- 아나운서 톤(ko-KR-SunHiNeural): 내레이션·핵심 안내·결과 요약
- 현장 통화 톤(ko-KR-InJoonNeural / ko-KR-HyunsuMultilingualNeural): 전화 대사 + 대역 제한 필터
- 효과음: 전화벨·금속 파단·철골 붕괴 (numpy 합성)

사용: python3 tools/make_audio.py            # 전체 생성
      python3 tools/make_audio.py --verify   # 생성된 파일 전사 검수
출력: audio/*.mp3
"""
import asyncio, json, math, os, random, subprocess, sys, wave
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
LEADER = "ko-KR-InJoonNeural"
ME = "ko-KR-HyunsuMultilingualNeural"

# ── 대본 ────────────────────────────────────────────────────────────────
# 숫자·약어는 한국어 발음 표기로 적는다(발음 뭉개짐 방지).
NARR = {
    "n_call": ("anchor", "11월 18일 아침, 해외 철골 현장 품질 사무소. 내일 첫 아크를 앞두고, 시공팀장의 전화가 걸려 옵니다."),
    "n_summary": ("anchor", "정리하면 이렇습니다. 재질은 에이에스티엠 에이 삼십육입니다. 두께는 십이 밀리미터, 수직 필렛입니다. 에이 삼십육은 사전인정 모재 목록, 그룹 원에 있습니다. 사전인정은 시험을 면제해 주지만, 필러와 가스, 예열, 자세가 규정 조항 오의 범위를 벗어나면 그 순간 시험 인정으로 넘어갑니다. 와이어와 예열, 인정 방식, 세 가지가 비어 있습니다."),
    "n_brief": ("anchor", "내일 아침 일곱 시, 보 웨브에 브래킷을 세워 붙이는 수직 필렛입니다. 재질은 에이에스티엠 에이 삼십육, 두께는 십이 밀리미터, 각장은 육 밀리미터입니다. 오른쪽 현장 상황에 내일 예보와 사내 절차서 목록, 자재 재고가 들어 있습니다."),
    "n_wps": ("anchor", "빈 용접절차서 한 장입니다. 열여덟 칸을 채워야 합니다. 파란 점은 현장 정보, 주황 점은 에이더블유에스 디 원 점 원, 이천이십오년판 근거입니다."),
    "n_pass": ("anchor", "검사 통과입니다. 치명 오류 없이 백 점입니다. 이 절차서 한 장으로 내일 아침 용접이 진행됩니다."),
    "n_fail": ("anchor", "부적합입니다. 브래킷 필렛에서 균열이 발생해 작업이 중지됐습니다."),
    "n_cause_hydrogen": ("anchor", "원인은 예열 부족입니다. 영하의 모재에 용접하면서 수소가 비드 아래에 남았고, 하중이 걸린 뒤 토우에서 균열이 시작됐습니다."),
    "n_cause_throat": ("anchor", "원인은 비드 처짐입니다. 아래보기 전용 와이어를 수직에 사용해 유효 목두께가 모자랐습니다."),
    "n_cause_fusion": ("anchor", "원인은 융합 불량입니다. 용입이 루트까지 들어가지 않아 비드가 껍질처럼 떨어져 나갔습니다."),
    "n_cause_porosity": ("anchor", "원인은 가스 차폐 불량입니다. 방풍 없이 용접해 비드에 기공이 생겼습니다."),
    "n_cause_reject": ("anchor", "원인은 근거 없는 절차서입니다. 사전인정도 시험 인정도 되지 않은 절차서라 감리가 반려했습니다."),
}

PHONE = {
    "p01": ("leader", "어, 이프로. 바빠? 바쁘지. 금방 끝낼게."),
    "p02": ("leader", "내일 보 브래킷 필렛 용접을 해야 되는데, 더블유 피 에스가 없어. 감리에서 더블유 피 에스 없으면 아크 한 번도 못 띄운대. 내일 오전 가능할까?"),
    "p00": ("me", "네 팀장님, 말씀하세요."),
    "p03": ("me", "오전이요? 일단 정보 좀 주세요. 재질이랑 두께요."),
    "p04": ("leader", "에이에스티엠 에이 삼십육입니다. 두께는 십이 밀리. 보 웨브에 브래킷 세워서 붙이는 거라 세로로 올라가야 돼. 장비는 씨 오 투 반자동이고, 와이어는 늘 쓰던 거……"),
    "p05": ("me", "팀장님, 와이어 뭐라고요? 잘 안 들렸어요."),
    "p06": ("leader", "아, 여기 크레인 소리 때문에…… 암튼 늘 쓰던 거! 그리고 내일 아침에 춥다던데, 그거 뭐 예열? 해야 되나? 작년엔 그냥 했는데."),
    "p07": ("me", "예열 말씀하시는 거죠? 기온이 몇 도입니까?"),
    "p08": ("leader", "몰라, 그건 니가 찾아봐. 그리고 이거 그 뭐냐, 시험 안 하고 바로 쓰는 더블유 피 에스 있잖아. 그걸로 하면 되지? 나 지금 타워 올라가야 돼. 끊는다!"),
    "p09": ("me", "팀장님? 팀장님……!"),
    "s01": ("leader", "이프로! 어제 그 절차서, 용접사가 그대로 보고 했어. 오전에 깔끔하게 끝났어."),
    "s02": ("leader", "감리가 더블유 피 에스를 보더니, 사전인정 근거까지 딱 맞네, 하더라. 아침에 예열 안 했으면 큰일 날 뻔했어."),
    "s03": ("leader", "고마워, 이프로. 덕분에 중요한 용접 잘 마무리했어. 역시 최고."),
    "f01": ("alarm", "이프로! 브래킷 필렛에서 금이 갔어! 지금 작업 중지했어. 감리가 더블유 피 에스 다시 보재!"),
    "f02": ("alarm", "빨리 와!"),
}

VOICE_PARAMS = {
    "anchor": dict(voice=ANCHOR, rate="-6%", pitch="-2Hz"),
    "leader": dict(voice=LEADER, rate="+2%", pitch="-3Hz"),
    "me": dict(voice=ME, rate="+0%", pitch="-1Hz"),
    "alarm": dict(voice=LEADER, rate="+12%", pitch="+4Hz"),
}

FILTERS = {
    # 전화기 대역 제한 + 살짝 압축 (현장 수화기 느낌)
    "leader": "highpass=f=200,lowpass=f=3900,acompressor=threshold=-18dB:ratio=3:attack=6:release=120,volume=1.05",
    "me": "highpass=f=200,lowpass=f=4200,acompressor=threshold=-20dB:ratio=2.4:attack=8:release=140,volume=1.0",
    "alarm": "highpass=f=220,lowpass=f=4000,acompressor=threshold=-16dB:ratio=4:attack=4:release=90,volume=1.12",
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


def polish(raw, out, key, kind):
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


def dur(path):
    out = run([FFMPEG, "-i", path, "-f", "null", "-"])
    # duration from stderr not available (captured); use ffprobe-free approach
    return None


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
    # 살짝 거친 스피커 느낌
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
    # 저역 통과(간단 이동평균) 럼블
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


def build(only=None):
    if not only:
        gen_sfx()
    jobs = []
    for k, (kind, text) in {**NARR, **PHONE}.items():
        if only and k not in only:
            continue
        jobs.append((k, kind, text))
    for k, kind, text in jobs:
        raw = os.path.join(TMP, k + ".mp3")
        p = VOICE_PARAMS[kind]
        try:
            tts(text, p["voice"], p["rate"], p["pitch"], raw)
        except Exception as e:
            print("TTS retry", k, e)
            tts(text, p["voice"], p["rate"], p["pitch"], raw)
        polish(raw, os.path.join(OUT, k + ".mp3"), k, kind)
        print("ok", k, kind)


def load_audio16k(path):
    raw = run([FFMPEG, "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()


def verify():
    from faster_whisper import WhisperModel
    m = WhisperModel(os.path.join(os.path.dirname(ROOT), "models", "small-int8"),
                     device="cpu", compute_type="int8", cpu_threads=1)
    files = sorted(f for f in os.listdir(OUT) if f.endswith(".mp3") and not f.startswith(("sfx_", "bgm_")))
    report = {}
    for f in files:
        path = os.path.join(OUT, f)
        audio_in = load_audio16k(path)
        segs, info = m.transcribe(audio_in, language="ko", beam_size=1, vad_filter=True)
        text = " ".join(s.text.strip() for s in segs)
        report[f] = {"text": text, "dur": round(float(len(audio_in)) / 16000, 2)}
        print("%-26s %5.2fs  %s" % (f, report[f]["dur"], text))
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
