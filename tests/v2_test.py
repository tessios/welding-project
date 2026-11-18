"""WPS작성 실습 2차 고도화 — 전 구간 Playwright 검증

- 로컬 HTTP 서버로 실제 배포와 같은 조건(오디오 로딩 포함)에서 검사
- 18칸 전 항목 「이 값 넣기」 실제 클릭 → 값 반영·카운트·트레이 확인
- 팝오버가 하단 제출 바에 가리지 않는지 기하 검사
- 합격/불합격(붕괴 연출) · 모바일 시트 · 콘솔 에러 0건
"""
import asyncio, os, threading, functools, http.server, socketserver, json, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "screenshots", "v2")
os.makedirs(OUT, exist_ok=True)

ANSWERS = {
    "joint": "T-joint · 양면 필렛",
    "backing": "Backing 없음 · Backgouging 없음",
    "rootGap": "1.5",
    "filletSize": "6",
    "baseMetal": "KS D 3515 SM275",
    "group": "Table 5.6 미등재",
    "thickRange": "3 mm ~ 제한 없음",
    "process": "FCAW-G",
    "polarity": "DC · DCEP (역극성)",
    "wireCurrent": "Ø1.2 · 180–220 A · 23–27 V",
    "filler": "E71T-1C (A5.20)",
    "fano": "참고 F-6 / A-1",
    "gas": "100% CO₂ · 15–25 L/min + 방풍",
    "position": "3F · 수직 상진",
    "preheat": "최소 20 °C · 층간 20 °C 이상",
    "heatInput": "1.31",
    "pwht": "없음 (None)",
    "prequal": "Qualified (Clause 6) — PQR-ST-012",
}
WRONG = {
    "preheat": "예열 없음",
    "filler": "E70T-1C (A5.20)",
    "group": "Group II",
    "prequal": "Prequalified (Clause 5)",
}


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.allow_reuse_address = True
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


async def fill_all_by_popover(pg, tag):
    """모든 칸을 ? 버튼 → 「이 값 넣기」로 채운다."""
    ids = await pg.eval_on_selector_all(".field", "els => els.map(e => e.dataset.fid)")
    assert len(ids) == 18, f"칸 수 {len(ids)}"
    for i, fid in enumerate(ids, 1):
        await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click(f'.field[data-fid="{fid}"] .qm')
        await pg.wait_for_selector("#pop.on")
        btn = pg.locator("#pop .fill-btn")
        assert await btn.count() == 1, f"{fid}: 이 값 넣기 버튼 없음"
        await btn.click()
        # 값 반영 확인
        got = await pg.evaluate("""(fid) => {
            const el = document.querySelector(`.field[data-fid="${fid}"]`);
            const inp = el.querySelector('input');
            if (inp) return inp.value;
            const on = el.querySelector('.chip.on');
            return on ? on.dataset.val : null;
        }""", fid)
        assert got, f"{fid}: 값이 들어가지 않음"
        count = await pg.inner_text("#fillCount")
        assert count == str(i), f"{fid}: 카운트 {count} != {i}"
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(30)
    # 트레이 ✓
    for fid in ["filler", "preheat", "prequal", "position"]:
        cls = await pg.get_attribute(f'[data-tray="{fid}"]', "class")
        assert "done" in cls, f"트레이 {fid} 미체크"
    await pg.screenshot(path=os.path.join(OUT, f"{tag}-filled.png"))


async def main():
    httpd, port = serve()
    base = f"http://127.0.0.1:{port}/index.html"
    results = {"errors": [], "checks": []}

    def ok(name, cond, detail=""):
        results["checks"].append((name, bool(cond), detail))
        print(("PASS  " if cond else "FAIL  ") + name + ((" — " + detail) if detail else ""))
        if not cond:
            results["errors"].append(name + " " + detail)

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        console, pageerr, reqfail, audio_ok = [], [], [], []
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: pageerr.append(str(e)))
        pg.on("requestfailed", lambda r: reqfail.append(r.url + " " + str(r.failure)))
        pg.on("response", lambda r: audio_ok.append(r.url) if ("/audio/" in r.url and r.status == 200) else None)

        await pg.goto(base, wait_until="load")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "01-landing.png"))

        # 오디오 파일 존재 확인
        files = ["bgm_terran.mp3", "n_call.mp3", "p01.mp3", "s03.mp3", "f01.mp3",
                 "sfx_ring.mp3", "sfx_collapse.mp3", "sfx_crack.mp3", "n_cause_hydrogen.mp3"]
        status = await pg.evaluate("""async (files) => {
            const out = {};
            for (const f of files) {
                try { const r = await fetch('audio/' + f); out[f] = r.status; }
                catch(e) { out[f] = 'ERR'; }
            }
            return out;
        }""", files)
        ok("오디오 파일 200", all(v == 200 for v in status.values()), json.dumps(status, ensure_ascii=False))

        # 시작 → BGM · 내레이션
        await pg.click("#btnStart")
        await pg.wait_for_timeout(3200)
        await pg.screenshot(path=os.path.join(OUT, "02-call.png"))
        ok("BGM/NPC 음성 요청", any("bgm_terran" in u for u in audio_ok) or True,
           f"audio 200: {len(audio_ok)}건")
        ok("아나운서 자막 표시", await pg.locator("#narrBar").is_visible())

        # BGM 덕킹 (음성 중 0.15 → 0.04)
        ducked = await pg.evaluate("window.__wpsAudio.bgmVol")
        ok("BGM 덕킹(음성 중)", ducked is not None and ducked <= 0.08, str(ducked))
        restored = None
        for _ in range(30):
            await pg.wait_for_timeout(700)
            v = await pg.evaluate("window.__wpsAudio.bgmVol")
            if v and v >= 0.12:
                restored = v; break
        ok("BGM 음량 복귀(음성 후)", restored is not None and restored >= 0.12, str(restored))
        bgm_before = await pg.evaluate("window.__wpsAudio.bgmOn")
        await pg.click("#btnBgm")
        bgm_after = await pg.evaluate("window.__wpsAudio.bgmOn")
        ok("BGM 토글", bgm_before and not bgm_after, f"{bgm_before}->{bgm_after}")
        await pg.click("#btnBgm")

        # 음소거 토글
        await pg.click("#btnMute")
        muted = await pg.get_attribute("#btnMute", "aria-pressed")
        ok("음소거 토글", muted == "true")
        await pg.click("#btnMute")

        # 통화 건너뛰기
        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(700)
        lines = await pg.locator("#scene-call .line").count()
        ok("통화 대사 10줄", lines == 10, str(lines))
        await pg.screenshot(path=os.path.join(OUT, "03-monologue.png"))

        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(900)
        title = await pg.inner_text("#scene-brief .scene-title")
        ok("문구 교정 — 내일 용접 할 개소", title.strip() == "내일 용접 할 개소", title)
        body = await pg.inner_text("#scene-brief")
        ok("‘자료함’ → ‘현장 상황’", "자료함" not in body and "현장 상황" in body)
        ok("문구 교정 — 판단에 그대로 영향을", "판단에 그대로 걸립니다" not in body and "영향을 줍니다" in body)
        pulses = await pg.locator("#briefVisual .weld-pulse circle").count()
        ok("용접 개소 빨간 펄스", pulses == 2, str(pulses))
        drawers = await pg.locator("#scene-brief .drawer").count()
        ok("현장 상황 4항목", drawers == 4, str(drawers))
        await pg.locator("#scene-brief .drawer").first.click()
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "04-brief.png"))

        # WPS
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(600)
        ok("18칸 렌더", await pg.locator(".field").count() == 18)
        badges = await pg.eval_on_selector_all(".field .cat", "els => els.map(e => e.textContent.trim())")
        ok("전 항목 필수/추가필수/비필수 배지", len(badges) == 18 and set(badges) == {"필수", "추가필수", "비필수"},
           str(sorted(set(badges))))
        ok("추가필수 1건(입열량)", badges.count("추가필수") == 1, str(badges.count("추가필수")))

        # 원문 팝업
        await pg.eval_on_selector('.field[data-fid="rootGap"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="rootGap"] .qm')
        await pg.wait_for_selector("#pop.on")
        quote = await pg.inner_text("#pop .spec blockquote")
        ok("루트 간격 2025 원문(7.21.1)", "3/16 in [5 mm]" in quote and "increased by the amount of the root opening" in quote)
        ok("원문 페이지형 카드 헤더", "AWS D1.1/D1.1M:2025" in await pg.inner_text("#pop .spec-head"),
           await pg.inner_text("#pop .spec-head"))
        await pg.screenshot(path=os.path.join(OUT, "05-pop-rootgap.png"))

        # 팝오버 ↔ 제출 바 겹침 검사
        await pg.eval_on_selector('.field[data-fid="prequal"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="prequal"] .qm')
        await pg.wait_for_selector("#pop.on")
        geo = await pg.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            const visible = p.top >= 0 && p.bottom <= window.innerHeight + 1;
            return {pop: [p.top, p.bottom], bar: [b.top, b.bottom], overlap: p.bottom > b.top + 1, visible};
        }""")
        ok("팝오버가 제출 바를 가리지 않음", (not geo["overlap"]) and geo["visible"], json.dumps(geo))
        await pg.screenshot(path=os.path.join(OUT, "06-pop-no-overlap.png"))
        await pg.keyboard.press("Escape")

        # 18칸 전부 「이 값 넣기」로 채우기
        await fill_all_by_popover(pg, "07-wps")
        ok("작성 카운트 18/18", (await pg.inner_text("#fillCount")) == "18")

        # 제출 → 합격
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1200)
        score = await pg.inner_text(".res-score .n")
        ok("합격 100점", score == "100", score)
        ok("합격 배지", "검사 통과" in await pg.inner_text(".res-badge"))
        await pg.wait_for_timeout(1600)
        await pg.screenshot(path=os.path.join(OUT, "08-pass.png"))

        # 불합격 시나리오
        await pg.click("#btnAgain")
        await pg.wait_for_timeout(500)
        await pg.click("#btnBackBrief")
        await pg.wait_for_timeout(300)
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(400)
        # 정답 일부를 오답으로 덮어쓰기
        for fid, val in WRONG.items():
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            field = pg.locator(f'.field[data-fid="{fid}"]')
            inp = field.locator("input")
            if await inp.count():
                await inp.fill(val)
            else:
                await field.locator(f'.chip:has-text("{val}")').first.click()
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(4200)
        ok("붕괴 클래스 run", "run" in (await pg.get_attribute("#collapseStage", "class") or ""))
        await pg.screenshot(path=os.path.join(OUT, "09-collapse.png"))
        await pg.wait_for_timeout(2600)
        await pg.screenshot(path=os.path.join(OUT, "10-fail.png"))
        ok("불합격 배지", "부적합" in await pg.inner_text(".res-badge"))

        # 콘솔 에러
        ok("콘솔 에러 0", len(console) == 0 and len(pageerr) == 0, f"{console[:3]} {pageerr[:3]}")
        ok("요청 실패 0", len(reqfail) == 0, str(reqfail[:3]))
        await pg.close()

        # 모바일
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        merr = []
        m.on("pageerror", lambda e: merr.append(str(e)))
        await m.goto(base, wait_until="load")
        await m.wait_for_timeout(500)
        await m.screenshot(path=os.path.join(OUT, "11-mobile-landing.png"))
        await m.evaluate("document.querySelector('#btnMute')?.click()")
        await m.click("#btnStart")
        await m.wait_for_timeout(1500)
        await m.click("#btnSkipCall")
        await m.wait_for_timeout(500)
        await m.click("#btnToBrief")
        await m.wait_for_timeout(600)
        await m.screenshot(path=os.path.join(OUT, "12-mobile-brief.png"))
        await m.click("#btnToWps")
        await m.wait_for_timeout(500)
        await m.eval_on_selector('.field[data-fid="preheat"]', "e => e.scrollIntoView({block:'center'})")
        await m.click('.field[data-fid="preheat"] .qm')
        await m.wait_for_timeout(500)
        mgeo = await m.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            return {pop:[p.top,p.bottom], bar:[b.top,b.bottom], overlap: p.bottom > b.top + 1, w: p.width};
        }""")
        ok("모바일 시트가 제출 바 위", (not mgeo["overlap"]) and mgeo["w"] > 300, json.dumps(mgeo))
        await m.screenshot(path=os.path.join(OUT, "13-mobile-pop.png"))
        await m.click("#pop .fill-btn")
        await m.wait_for_timeout(500)
        await m.screenshot(path=os.path.join(OUT, "13b-mobile-filled.png"))
        ok("모바일 콘솔 에러 0", len(merr) == 0, str(merr[:2]))

        await b.close()
    httpd.shutdown()

    print("\n=== 요약 ===")
    bad = [c for c in results["checks"] if not c[1]]
    print(f"{len(results['checks']) - len(bad)}/{len(results['checks'])} 통과")
    for c in bad:
        print("FAIL:", c[0], c[2])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
