"""배포본(https://tessios.github.io/welding-project/) 실습형 v4 라이브 검증

- 「이 값 넣기」 0건 / 참조 양식 명칭 0건(화면·팝오버 전수)
- 선택형·직접 입력형 동작, 입열량 직접 계산 입력, 와이어·전류·전압 자유 입력 통과
- 문항 클릭 열기 / 더블클릭 닫기, 모바일 390×844 근거 크기·더블탭 닫기
- 성공/파단 엔딩(효과음·내레이션), 콘솔 에러 0
- 캡처: screenshots/live_v4/
"""
import asyncio, os, time, json, sys
from playwright.async_api import async_playwright

BASE = "https://tessios.github.io/welding-project/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "screenshots", "live_v4")
os.makedirs(OUT, exist_ok=True)

ANSWERS = {
    "joint": "Fillet weld (T, Corner joint)",
    "backing": "Backing 없음 · Backgouging 없음",
    "rootGap": "1.5",
    "filletSize": "6",
    "baseMetal": "ASTM A36 or Equivalent",
    "group": "Group I",
    "thickRange": "Fillet Welds < 75 mm",
    "process": "FCAW (Semi-auto)",
    "polarity": "DC · DCEP (역극성)",
    "wireDia": "1.4",
    "current": "280",
    "voltage": "30",
    "filler": "E71T-1C (A5.20)",
    "fano": "참고 F-6 / A-1",
    "gas": "100% CO₂ · 15–30 L/min · Nozzle #4",
    "position": "All (F·V·H·OH) · 수직 상진",
    "preheat": "20",
    "heatInput": "1.51",
    "pwht": "없음 (None)",
    "prequal": "Prequalified (Clause 5) — PQR 없음",
}
WRONG = {"preheat": "0", "filler": "E70T-1C (A5.20)", "group": "Group II", "position": "1F · 아래보기"}


async def set_field(pg, fid, val):
    sel = f'.field[data-fid="{fid}"]'
    await pg.eval_on_selector(sel, "e => e.scrollIntoView({block:'center'})")
    el = pg.locator(sel)
    if await el.locator("select").count():
        await el.locator("select").select_option(value=val)
    elif await el.locator("input").count():
        await el.locator("input").fill(val)
    else:
        await el.locator(f'.chip[data-val="{val}"]').first.click()


async def fill_all(pg):
    for fid, val in ANSWERS.items():
        await set_field(pg, fid, val)
    return await pg.inner_text("#fillCount")


async def main():
    stamp = int(time.time())
    url = f"{BASE}?v={stamp}"
    results = []

    def ok(name, cond, detail=""):
        results.append((name, bool(cond), detail))
        print(("PASS  " if cond else "FAIL  ") + name + ((" — " + str(detail)) if detail else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        console, pageerr, reqfail, audio = [], [], [], []
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: pageerr.append(str(e)))
        pg.on("requestfailed", lambda r: reqfail.append(r.url + " " + str(r.failure)))
        pg.on("response", lambda r: audio.append(r.url) if "/audio/" in r.url and r.status in (200, 206) else None)

        await pg.goto(url, wait_until="load")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "01-landing.png"))
        body = await pg.inner_text("body")
        ok("라이브 표지 — ASTM A36", "ASTM A36" in body)
        ok("라이브 표지 — 참조 양식 명칭 0건", "Form J-2" not in body)

        await pg.click("#btnStart")
        await pg.wait_for_timeout(2600)
        ok("전화벨 효과음", any("sfx_ring" in u for u in audio), audio[-3:])
        ok("아나운서 자막", await pg.locator("#narrBar").is_visible())
        await pg.screenshot(path=os.path.join(OUT, "02-call.png"))
        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(600)
        ok("통화 10줄(자막)", await pg.locator("#scene-call .line").count() == 10)
        ok("인물 통화 음성 0건", not any("/audio/p0" in u or "/audio/s0" in u or "/audio/f0" in u for u in audio))

        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(1000)
        await pg.locator("#scene-brief .drawer").first.click()
        await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(OUT, "03-brief.png"))

        await pg.click("#btnToWps")
        await pg.wait_for_timeout(800)
        ok("라이브 20칸", await pg.locator(".field").count() == 20, await pg.locator(".field").count())
        ok("「이 값 넣기」 0건", await pg.locator(".fill-btn").count() == 0)
        doc = await pg.inner_text("#wpsDoc")
        ok("WPS 머리말 — 참조 양식 명칭 0건", "Form J-2" not in doc)
        ok("WPS 머리말 — Clause 5 사전인정", "Clause 5 사전인정" in doc)
        badges = await pg.eval_on_selector_all(".field .cat", "els => els.map(e => e.textContent.trim())")
        ok("배지(필수14·추가필수1·비필수5)",
           badges.count("필수") == 14 and badges.count("추가필수") == 1 and badges.count("비필수") == 5,
           {x: badges.count(x) for x in set(badges)})
        await pg.screenshot(path=os.path.join(OUT, "04-wps.png"))

        # 팝오버 전수 — 값 넣기/양식 문구 0건, 입열량 정답 미노출
        bad = []
        for fid in ANSWERS:
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            await pg.click(f'.field[data-fid="{fid}"] .qm')
            await pg.wait_for_selector("#pop.on")
            txt = await pg.inner_text("#pop")
            if "Form J-2" in txt or "양식" in txt or await pg.locator("#pop .fill-btn").count():
                bad.append(fid)
            if fid == "heatInput":
                ok("입열량 — 조건·공식·정답 미노출",
                   all(s in txt for s in ["29 V", "260 A", "300 mm/min", "H = (60 × E × I)"]) and "1.51" not in txt)
                await pg.screenshot(path=os.path.join(OUT, "05-pop-heat.png"))
            await pg.keyboard.press("Escape")
            await pg.wait_for_timeout(20)
        ok("팝오버 전수 — 참조 양식·값 넣기 0건", not bad, bad)

        await pg.eval_on_selector('.field[data-fid="heatInput"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="heatInput"] .qm')
        await pg.wait_for_selector("#pop.on")
        hgeo = await pg.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            return {popBottom:p.bottom, barTop:b.top, overlap:p.bottom > b.top + 1, vh:innerHeight};
        }""")
        ok("긴 팝오버도 제출 바 비가림", (not hgeo["overlap"]) and hgeo["popBottom"] <= hgeo["vh"], json.dumps(hgeo))
        await pg.keyboard.press("Escape")

        # 클릭 열기 / 더블클릭 닫기
        await pg.eval_on_selector('.field[data-fid="rootGap"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="rootGap"] .lab')
        await pg.wait_for_selector("#pop.on")
        await pg.screenshot(path=os.path.join(OUT, "06-pop-open.png"))
        await pg.dblclick("#pop")
        await pg.wait_for_timeout(250)
        ok("문항 클릭 열기 / 더블클릭 닫기", not await pg.locator("#pop").is_visible())

        count = await fill_all(pg)
        ok("라이브 20/20 작성", count == "20", count)
        await pg.screenshot(path=os.path.join(OUT, "07-filled.png"))
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1600)
        ok("라이브 합격 100점(자유 입력 1.4·280·30)", (await pg.inner_text(".res-score .n")) == "100")
        ok("성공 효과음", any("sfx_success" in u for u in audio))
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, "08-pass.png"))
        end_ok = False
        for _ in range(60):
            await pg.wait_for_timeout(700)
            if any("n_end_pass" in u for u in audio):
                end_ok = True; break
        ok("성공 엔딩 내레이션(n_end_pass)", end_ok)

        await pg.click("#btnAgain")
        await pg.wait_for_timeout(600)
        for fid, val in WRONG.items():
            await set_field(pg, fid, val)
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(4200)
        ok("붕괴 연출", "run" in (await pg.get_attribute("#collapseStage", "class") or ""))
        await pg.screenshot(path=os.path.join(OUT, "09-collapse.png"))
        await pg.wait_for_timeout(2800)
        ok("부적합 배지", "부적합" in await pg.inner_text(".res-badge"))
        await pg.screenshot(path=os.path.join(OUT, "10-fail.png"))
        end_fail = False
        for _ in range(70):
            await pg.wait_for_timeout(700)
            if any("n_end_fail" in u for u in audio):
                end_fail = True; break
        ok("파단 엔딩 내레이션(n_end_fail)", end_fail)
        ok("콘솔 에러 0", not console and not pageerr, f"{console[:2]} {pageerr[:2]}")
        ok("요청 실패 0", not reqfail, reqfail[:2])
        await pg.close()

        # 모바일
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        merr = []
        m.on("pageerror", lambda e: merr.append(str(e)))
        m.on("console", lambda msg: merr.append(msg.text) if msg.type == "error" else None)
        await m.goto(url, wait_until="load")
        await m.wait_for_timeout(400)
        await m.screenshot(path=os.path.join(OUT, "11-mobile-landing.png"))
        await m.evaluate("window.scrollTo(0,0)")
        await m.evaluate("document.querySelector('#btnMute').click()")
        await m.click("#btnStart")
        await m.wait_for_timeout(900)
        await m.click("#btnSkipCall")
        await m.wait_for_timeout(400)
        await m.click("#btnToBrief")
        await m.wait_for_timeout(500)
        await m.click("#btnToWps")
        await m.wait_for_timeout(500)
        await m.eval_on_selector('.field[data-fid="heatInput"]', "e => e.scrollIntoView({block:'center'})")
        await m.click('.field[data-fid="heatInput"] .lab')
        await m.wait_for_selector("#pop.on")
        geo = await m.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            return {w:p.width, h:p.height, top:p.top, bottom:p.bottom, barTop:b.top,
                    overlap:p.bottom > b.top + 1, vh:innerHeight,
                    overflow:getComputedStyle(document.querySelector('#pop')).overflowY};
        }""")
        ok("모바일 근거 — 높이 ≤ 45vh", geo["h"] <= 844 * 0.45, json.dumps(geo))
        ok("모바일 근거 — 제출 바 비가림", not geo["overlap"])
        await m.screenshot(path=os.path.join(OUT, "12-mobile-pop.png"))
        box = await m.locator("#pop").bounding_box()
        x, y = box["x"] + box["width"] / 2, box["y"] + min(40, box["height"] / 2)
        await m.touchscreen.tap(x, y)
        await m.wait_for_timeout(90)
        await m.touchscreen.tap(x, y)
        await m.wait_for_timeout(400)
        ok("모바일 더블탭 닫기", not await m.locator("#pop").is_visible())
        ok("모바일 콘솔 에러 0", not merr, merr[:2])
        await m.screenshot(path=os.path.join(OUT, "13-mobile-closed.png"))
        await b.close()

    bad = [c for c in results if not c[1]]
    print("\n=== 라이브 요약 ===")
    print(f"{len(results) - len(bad)}/{len(results)} 통과")
    for c in bad:
        print("FAIL:", c[0], c[2])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
