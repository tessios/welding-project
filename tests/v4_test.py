"""WPS작성 실습 4차 고도화 — 전 구간 Playwright 검증

반영 확인
1) 「이 값 넣기」 버튼 0건 — 선택형(chips/select)과 직접 입력형(input)만 존재
2) 와이어 지름·전류·전압 비필수 + 자유 입력(어떤 유효값/범위든 통과)
3) 입열량은 조건·공식만 제시, 수강생이 직접 계산해 입력
4) 화면·팝오버·해설 어디에도 참조 양식 명칭/‘양식’ 문구 0건
5) 인물 통화 음성 제거 — 아나운서 내레이션 + 효과음(전화벨/성공/파단/붕괴)
6) 모바일(390×844) 근거 팝오버 컴팩트 + 문항 클릭 열림 + 더블탭 닫힘
"""
import asyncio, os, threading, functools, http.server, socketserver, json, sys
from playwright.async_api import async_playwright

FORBIDDEN = "Form " + "J-2"   # 화면에 남아 있으면 안 되는 참조 양식 명칭
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "screenshots", "v4")
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
    # 비필수·자유 입력 — 일부러 다른 유효값을 넣어 감점이 없는지 확인
    "wireDia": "1.6",
    "current": "400",
    "voltage": "31",
    "filler": "E71T-1C (A5.20)",
    "fano": "참고 F-6 / A-1",
    "gas": "100% CO₂ · 15–30 L/min · Nozzle #4",
    "position": "All (F·V·H·OH) · 수직 상진",
    "preheat": "20",
    "heatInput": "1.51",
    "pwht": "없음 (None)",
    "prequal": "Prequalified (Clause 5) — PQR 없음",
}
WRONG = {
    "preheat": "0",
    "filler": "E70T-1C (A5.20)",
    "group": "Group II",
    "position": "1F · 아래보기",
}
FIELD_ORDER = list(ANSWERS.keys())


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.allow_reuse_address = True
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, port


async def set_field(pg, fid, val):
    sel = f'.field[data-fid="{fid}"]'
    await pg.eval_on_selector(sel, "e => e.scrollIntoView({block:'center'})")
    el = pg.locator(sel)
    if await el.locator("select").count():
        await el.locator("select").select_option(value=val)
    elif await el.locator("input").count():
        await el.locator("input").fill(val)
    else:
        chip = el.locator(f'.chip[data-val="{val}"]')
        assert await chip.count() == 1, f"{fid}: 보기 '{val}' 없음"
        await chip.first.click()


async def fill_all(pg):
    for fid in FIELD_ORDER:
        await set_field(pg, fid, ANSWERS[fid])
    return await pg.inner_text("#fillCount")


async def main():
    httpd, port = serve()
    base = f"http://127.0.0.1:{port}/index.html"
    results = {"checks": []}

    def ok(name, cond, detail=""):
        results["checks"].append((name, bool(cond), detail))
        print(("PASS  " if cond else "FAIL  ") + name + ((" — " + str(detail)) if detail else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        console, pageerr, reqfail, audio = [], [], [], []
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: pageerr.append(str(e)))
        pg.on("requestfailed", lambda r: reqfail.append(r.url + " " + str(r.failure)))
        pg.on("response", lambda r: audio.append(r.url) if "/audio/" in r.url and r.status in (200, 206) else None)

        await pg.goto(base, wait_until="load")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, "01-landing.png"))
        body = await pg.inner_text("body")
        ok("표지 — ASTM A36 표기", "ASTM A36" in body)
        ok("표지 — 참조 양식 명칭 0건", FORBIDDEN not in body)

        # 시작 → 전화 장면 (통화 음성 없음, 벨소리만)
        await pg.click("#btnStart")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, "02-call.png"))
        ok("아나운서 자막 표시", await pg.locator("#narrBar").is_visible())
        ok("전화벨 효과음 재생", any("sfx_ring" in u for u in audio), audio[-3:])
        # 진행 중에는 대사가 일부만 쌓여 있어야 한다(음성 없이 페이싱)
        early = await pg.locator("#scene-call .line").count()

        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(600)
        lines = await pg.locator("#scene-call .line").count()
        ok("통화 대사 10줄(스킵 후 전부)", lines == 10, f"{lines}")
        ok("통화 진행 페이싱(스킵 전 일부만)", early < lines, f"early={early} full={lines}")
        ok("인물 통화 음성 요청 0건", not any("/audio/p0" in u or "/audio/s0" in u or "/audio/f0" in u for u in audio),
           [u for u in audio if "/audio/" in u][:4])
        await pg.screenshot(path=os.path.join(OUT, "03-monologue.png"))

        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(1200)
        title = (await pg.inner_text("#scene-brief .scene-title")).strip()
        ok("브리핑 제목", title == "내일 용접 할 개소", title)
        ok("현장 상황 4항목", await pg.locator("#scene-brief .drawer").count() == 4)
        brief_txt = await pg.inner_text("#scene-brief")
        ok("브리핑 — 참조 양식 명칭 0건", FORBIDDEN not in brief_txt)
        await pg.locator("#scene-brief .drawer").first.click()
        await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(OUT, "04-brief.png"))

        # WPS — 20칸
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(700)
        nfields = await pg.locator(".field").count()
        ok("스무 칸(20) 렌더", nfields == 20, nfields)
        ok("「이 값 넣기」 버튼 0건", await pg.locator(".fill-btn").count() == 0)
        doc = await pg.inner_text("#wpsDoc")
        ok("WPS 머리말 — 참조 양식 명칭 0건", FORBIDDEN not in doc, doc[:80].replace("\n", " / "))
        ok("WPS 머리말 — Clause 5 사전인정", "Clause 5 사전인정" in doc and "None (Prequalified)" in doc)
        badges = await pg.eval_on_selector_all(".field .cat", "els => els.map(e => e.textContent.trim())")
        ok("배지 구성(필수14·추가필수1·비필수5)",
           badges.count("필수") == 14 and badges.count("추가필수") == 1 and badges.count("비필수") == 5,
           {x: badges.count(x) for x in set(badges)})
        ui = await pg.eval_on_selector_all(".field", """els => els.map(e => ({
            id:e.dataset.fid,
            chips:e.querySelectorAll('.chip').length,
            select:e.querySelectorAll('select').length,
            input:e.querySelectorAll('input').length }))""")
        ok("선택형·입력형만 존재(모두 상호작용)", all(r["chips"] or r["select"] or r["input"] for r in ui))
        ok("드롭다운 3개(모재 규격·두께 범위·공정)",
           [r["id"] for r in ui if r["select"]] == ["baseMetal", "thickRange", "process"],
           [r["id"] for r in ui if r["select"]])
        ok("와이어 지름·전류·전압 = 직접 입력",
           all(next(r for r in ui if r["id"] == f)["input"] == 1 for f in ["wireDia", "current", "voltage"]))

        # 모든 근거 팝오버 — 값 넣기 버튼/참조 양식/‘양식’ 문구 0건, 입열량은 공식·조건만
        pop_texts, fillbtns = {}, 0
        for fid in FIELD_ORDER:
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            await pg.click(f'.field[data-fid="{fid}"] .qm')
            await pg.wait_for_selector("#pop.on")
            fillbtns += await pg.locator("#pop .fill-btn").count()
            pop_texts[fid] = await pg.inner_text("#pop")
            await pg.keyboard.press("Escape")
            await pg.wait_for_timeout(20)
        ok("팝오버 「이 값 넣기」 0건", fillbtns == 0, fillbtns)
        bad_form = [k for k, v in pop_texts.items() if FORBIDDEN in v or "제출하신 양식" in v]
        bad_yang = [k for k, v in pop_texts.items() if "양식" in v]
        ok("팝오버 참조 양식·제출 양식 문구 0건", not bad_form, bad_form)
        ok("팝오버 ‘양식’ 문구 0건", not bad_yang, bad_yang)
        heat = pop_texts["heatInput"]
        ok("입열량 팝오버 — 조건 제시", all(s in heat for s in ["29 V", "260 A", "300 mm/min"]))
        ok("입열량 팝오버 — 공식 제시", "H = (60 × E × I) ÷ (1000 × v)" in heat)
        ok("입열량 팝오버 — 정답 미노출", "1.51" not in heat)
        ok("입열량 안내 — 직접 계산", "직접 계산" in heat)

        # 가장 긴 팝오버(입열량)도 제출 바를 가리지 않는다
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

        # 문항 클릭 → 근거 열림 / 더블클릭 → 닫힘
        await pg.eval_on_selector('.field[data-fid="rootGap"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="rootGap"] .lab')
        await pg.wait_for_selector("#pop.on")
        ok("문항 클릭으로 근거 열림", await pg.locator("#pop").is_visible())
        await pg.screenshot(path=os.path.join(OUT, "05-pop-open.png"))
        await pg.dblclick("#pop")
        await pg.wait_for_timeout(250)
        ok("근거 더블클릭으로 닫힘", not await pg.locator("#pop").is_visible())
        # 입력 조작은 팝오버를 열지 않는다
        await pg.fill('.field[data-fid="rootGap"] input', "1.5")
        await pg.wait_for_timeout(200)
        ok("입력 중에는 근거가 열리지 않음", not await pg.locator("#pop").is_visible())

        # 전 칸 채우기 — select/chip/input
        count = await fill_all(pg)
        ok("작성 카운트 20/20", count == "20", count)
        await pg.screenshot(path=os.path.join(OUT, "06-wps-filled.png"))

        # 제출 → 합격 (자유 입력값 1.6/400/31도 감점 없음)
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1500)
        score = await pg.inner_text(".res-score .n")
        ok("합격 100점(자유 입력 감점 없음)", score == "100", score)
        ok("합격 배지", "검사 통과" in await pg.inner_text(".res-badge"))
        ok("합격 화면 — 참조 양식 명칭 0건", FORBIDDEN not in await pg.inner_text("#scene-result"))
        await pg.wait_for_timeout(1200)
        ok("성공 효과음 재생", any("sfx_success" in u for u in audio), audio[-3:])
        await pg.screenshot(path=os.path.join(OUT, "07-pass.png"))
        end_ok = False
        for _ in range(60):
            await pg.wait_for_timeout(700)
            if any("n_end_pass" in u for u in audio):
                end_ok = True
                break
        ok("성공 엔딩 아나운서 내레이션(n_end_pass)", end_ok)
        ok("합격 엔딩 — 인물 통화 음성 0건",
           not any("/audio/s0" in u or "/audio/f0" in u for u in audio))

        # 불합격 시나리오
        await pg.click("#btnAgain")
        await pg.wait_for_timeout(600)
        for fid, val in WRONG.items():
            await set_field(pg, fid, val)
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(4200)
        cls = await pg.get_attribute("#collapseStage", "class") or ""
        ok("붕괴 연출 run", "run" in cls, cls)
        ok("파단 효과음 재생", any("sfx_crack" in u for u in audio) and any("sfx_collapse" in u for u in audio))
        await pg.screenshot(path=os.path.join(OUT, "08-collapse.png"))
        await pg.wait_for_timeout(2800)
        ok("불합격 배지", "부적합" in await pg.inner_text(".res-badge"))
        ok("오류 근거 표시", await pg.locator("#errZone .err").count() >= 1)
        await pg.screenshot(path=os.path.join(OUT, "09-fail.png"))
        end_fail = False
        for _ in range(70):
            await pg.wait_for_timeout(700)
            if any("n_end_fail" in u for u in audio):
                end_fail = True
                break
        ok("파단 엔딩 아나운서 내레이션(n_end_fail)", end_fail)

        ok("콘솔 에러 0", len(console) == 0 and len(pageerr) == 0, f"{console[:3]} {pageerr[:3]}")
        ok("요청 실패 0", len(reqfail) == 0, reqfail[:3])
        await pg.close()

        # ── 모바일 390×844 ───────────────────────────────────
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        merr, mreq = [], []
        m.on("pageerror", lambda e: merr.append(str(e)))
        m.on("console", lambda msg: merr.append(msg.text) if msg.type == "error" else None)
        m.on("requestfailed", lambda r: mreq.append(r.url))
        await m.goto(base, wait_until="load")
        await m.wait_for_timeout(400)
        await m.screenshot(path=os.path.join(OUT, "10-mobile-landing.png"))
        await m.evaluate("window.scrollTo(0,0)")
        await m.evaluate("document.querySelector('#btnMute').click()")
        await m.click("#btnStart")
        await m.wait_for_timeout(900)
        await m.click("#btnSkipCall")
        await m.wait_for_timeout(400)
        await m.click("#btnToBrief")
        await m.wait_for_timeout(500)
        await m.screenshot(path=os.path.join(OUT, "11-mobile-brief.png"))
        await m.click("#btnToWps")
        await m.wait_for_timeout(500)

        await m.eval_on_selector('.field[data-fid="heatInput"]', "e => e.scrollIntoView({block:'center'})")
        await m.click('.field[data-fid="heatInput"] .lab')
        await m.wait_for_selector("#pop.on")
        geo = await m.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            const cs = getComputedStyle(document.querySelector('#pop'));
            return {w:p.width,h:p.height,top:p.top,bottom:p.bottom,vh:innerHeight,
                    barTop:b.top, overlap:p.bottom > b.top + 1,
                    pad:cs.padding, font:cs.fontSize, overflow:cs.overflowY,
                    scrollable: document.querySelector('#pop').scrollHeight > document.querySelector('#pop').clientHeight + 1};
        }""")
        ok("모바일 근거 — 컴팩트 높이(≤ 52vh)", geo["h"] <= 844 * 0.53, json.dumps(geo))
        ok("모바일 근거 — 제출 바 비가림", not geo["overlap"] and geo["top"] >= 0, json.dumps(geo))
        ok("모바일 근거 — 폭이 화면 안", geo["w"] <= 372, geo["w"])
        ok("모바일 근거 — 내부 스크롤", geo["overflow"] == "auto", geo["overflow"])
        await m.screenshot(path=os.path.join(OUT, "12-mobile-pop.png"))
        # 더블탭으로 닫기
        box = await m.locator("#pop").bounding_box()
        x, y = box["x"] + box["width"] / 2, box["y"] + min(40, box["height"] / 2)
        await m.touchscreen.tap(x, y)
        await m.wait_for_timeout(90)
        await m.touchscreen.tap(x, y)
        await m.wait_for_timeout(400)
        ok("모바일 더블탭으로 근거 닫힘", not await m.locator("#pop").is_visible())
        await m.screenshot(path=os.path.join(OUT, "13-mobile-pop-closed.png"))

        # 모바일에서도 칸을 채워 제출까지
        await fill_all(m)
        ok("모바일 20칸 작성", (await m.inner_text("#fillCount")) == "20")
        await m.click("#btnSubmit")
        await m.wait_for_timeout(1400)
        ok("모바일 합격 100점", (await m.inner_text(".res-score .n")) == "100")
        await m.screenshot(path=os.path.join(OUT, "14-mobile-pass.png"))
        ok("모바일 콘솔 에러 0", len(merr) == 0, merr[:3])
        ok("모바일 요청 실패 0", len(mreq) == 0, mreq[:3])

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
