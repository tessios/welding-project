"""와이어(용접봉) 지름 칸 — 모바일 키보드에서 `/` · `,` · 공백 입력 검증

배경: iOS/모바일에서 지름 칸이 `inputmode="decimal"`(숫자 키패드)이라
      `/`·`,`·스페이스가 아예 입력되지 않던 문제. `type=text` + `inputmode=text`로 바꾸고
      빠른 칩(Ø1.2 / Ø1.4 / Ø1.6)을 붙인 뒤의 동작을 확인한다.

검증 항목
 1) 지름 칸 속성: type=text, inputmode=text (decimal·numeric 아님), autocapitalize=none
 2) 키보드로 직접 입력: "1.2, 1.4/1.6 2.0" — 슬래시·콤마·공백이 값에 그대로 남고 4개 인식
 3) 구분자별 인식: "1.2 1.4"(공백) / "1.2/1.4"(슬래시) / "1,2"(콤마 소수점)
 4) 빠른 칩: 누르면 값에 들어가고 다시 누르면 빠진다 · aria-pressed 동기화 · 근거 팝오버가 열리지 않는다
 5) 범위 밖 값(5.0)은 인식 실패로 표시(오탐 없음)
 6) 모바일 390×844: 같은 속성 · 칩 탭 · 키보드 입력 → 20칸 채워 제출 시 100점
 7) 다른 수치 칸(루트 간격)은 그대로 숫자 키패드(inputmode=decimal)
 8) 콘솔 에러·요청 실패 0

실행:  python3 tests/dia_input_test.py            (로컬 http.server)
      python3 tests/dia_input_test.py --live      (배포본 https://tessios.github.io/welding-project/)
이미지 캡처는 하지 않는다(수능 시간대 이미지 열람 제한 회피).
"""
import asyncio, os, sys, threading, functools, http.server, socketserver
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIVE = "https://tessios.github.io/welding-project/"

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
    "wireDia": "1.2, 1.4/1.6",          # 슬래시·콤마 혼용 — 모바일에서 막히던 문자
    "current": ("260", "300"),
    "voltage": ("28", "30"),
    "filler": "E71T-1C (A5.20)",
    "fano": "참고 F-6 / A-1",
    "gas": "100% CO₂ · 15–30 L/min · Nozzle #4",
    "position": "All (F·V·H·OH) · 수직 상진",
    "preheat": "20",
    "heatInput": "1.51",
    "pwht": "없음 (None)",
    "prequal": "Prequalified (Clause 5) — PQR 없음",
}
FIELD_ORDER = list(ANSWERS.keys())
DIA = '.field[data-fid="wireDia"] input'


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


async def set_field(pg, fid, val):
    sel = f'.field[data-fid="{fid}"]'
    await pg.eval_on_selector(sel, "e => e.scrollIntoView({block:'center'})")
    el = pg.locator(sel)
    if await el.locator("select").count():
        await el.locator("select").select_option(value=val)
    elif await el.locator(".range-input").count():
        await el.locator('input[data-range="min"]').fill(val[0])
        await el.locator('input[data-range="max"]').fill(val[1])
    elif await el.locator("input").count():
        await el.locator("input").fill(val)
    else:
        await el.locator(f'.chip[data-val="{val}"]').first.click()


async def to_wps(pg):
    await pg.click("#btnStart")
    await pg.wait_for_timeout(900)
    await pg.click("#btnSkipCall")
    await pg.wait_for_timeout(500)
    await pg.click("#btnToBrief")
    await pg.wait_for_timeout(700)
    await pg.click("#btnToWps")
    await pg.wait_for_timeout(700)


async def main():
    live = "--live" in sys.argv
    httpd = port = None
    if live:
        base = LIVE
    else:
        httpd, port = serve()
        base = f"http://127.0.0.1:{port}/index.html"

    checks = []

    def ok(name, cond, detail=""):
        checks.append((name, bool(cond), detail))
        print(("PASS  " if cond else "FAIL  ") + name + (f" — {detail}" if detail else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        console, pageerr, reqfail = [], [], []
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: pageerr.append(str(e)))
        pg.on("requestfailed", lambda r: reqfail.append(r.url + " " + str(r.failure)))

        await pg.goto(base, wait_until="load")
        await pg.wait_for_timeout(600)
        await to_wps(pg)

        # 1) 속성
        attrs = await pg.eval_on_selector(DIA, """e => ({
            type: e.type, inputmode: e.getAttribute('inputmode'),
            autocap: e.getAttribute('autocapitalize'), autocorrect: e.getAttribute('autocorrect'),
            tag: e.tagName })""")
        ok("지름 칸 type=text", attrs["type"] == "text", attrs["type"])
        ok("지름 칸 inputmode=text (decimal·numeric 아님)",
           (attrs["inputmode"] or "text") == "text", attrs["inputmode"])
        ok("지름 칸 자동 대문자/교정 끔",
           attrs["autocap"] in ("none", "off") and attrs["autocorrect"] == "off",
           f"{attrs['autocap']} / {attrs['autocorrect']}")

        # 7) 다른 수치 칸은 숫자 키패드 유지
        rg = await pg.eval_on_selector('.field[data-fid="rootGap"] input', "e => e.getAttribute('inputmode')")
        ok("루트 간격 칸은 숫자 키패드 유지(decimal)", rg == "decimal", rg)

        # 2) 키보드로 슬래시·콤마·공백 직접 입력
        await pg.click(DIA)
        await pg.keyboard.type("1.2, 1.4/1.6 2.0", delay=12)
        val = await pg.input_value(DIA)
        ok("키보드 입력값에 / , 공백이 그대로 남음", val == "1.2, 1.4/1.6 2.0", repr(val))
        hint = await pg.inner_text('[data-dia-hint="wireDia"]')
        ok("혼용 구분자 4개 인식", all(x in hint for x in ["Ø1.2", "Ø1.4", "Ø1.6", "Ø2.0"]) and "4개" in hint, hint)

        # 3) 구분자별
        for typed, want in [("1.2 1.4", "2개"), ("1.2/1.4", "2개"), ("1,2", "1개"), ("1.2,1.4,1.6", "3개")]:
            await pg.fill(DIA, "")
            await pg.click(DIA)
            await pg.keyboard.type(typed, delay=8)
            hint = await pg.inner_text('[data-dia-hint="wireDia"]')
            ok(f"'{typed}' → {want} 인식", want in hint and "인식" in hint, hint)

        # 4) 칩
        await pg.fill(DIA, "")
        await pg.click(DIA)
        await pg.keyboard.press("Backspace")
        state = []
        for chip, want_val in [("1.2", "1.2"), ("1.4", "1.2, 1.4")]:
            await pg.click(f'.dchip[data-dia="{chip}"]')
            v = await pg.input_value(DIA)
            state.append((chip, v, want_val, v == want_val))
        ok("칩 누르면 값에 추가", all(s[3] for s in state), state)
        pressed = await pg.eval_on_selector('.dchip[data-dia="1.2"]', "e => e.getAttribute('aria-pressed')")
        ok("칩 aria-pressed 동기화(켜짐)", pressed == "true", pressed)
        ok("칩 누를 때 근거 팝오버가 열리지 않음", not await pg.locator("#pop").is_visible())
        await pg.click('.dchip[data-dia="1.2"]')
        v = await pg.input_value(DIA)
        pressed = await pg.eval_on_selector('.dchip[data-dia="1.2"]', "e => e.getAttribute('aria-pressed')")
        ok("같은 칩 다시 누르면 빠짐", v == "1.4" and pressed == "false", f"{v!r} pressed={pressed}")
        ok("칩 조작 후에도 팝오버 닫힘 상태", not await pg.locator("#pop").is_visible())

        # 5) 범위 밖
        await pg.fill(DIA, "5.0")
        await pg.click(DIA)
        hint = await pg.inner_text('[data-dia-hint="wireDia"]')
        ok("범위 밖(5.0)은 인식하지 않음", "인식" not in hint, hint)

        # 6) 모바일
        m = await b.new_page(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True,
                             user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                                        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
        merr, mreq = [], []
        m.on("console", lambda x: merr.append(x.text) if x.type == "error" else None)
        m.on("requestfailed", lambda r: mreq.append(r.url))
        await m.goto(base, wait_until="load")
        await m.wait_for_timeout(600)
        await to_wps(m)
        mattr = await m.eval_on_selector(DIA, "e => ({type:e.type, mode:e.getAttribute('inputmode')})")
        ok("모바일(iPhone UA) 지름 칸도 일반 텍스트 키보드",
           mattr["type"] == "text" and (mattr["mode"] or "text") == "text", mattr)
        await m.eval_on_selector(DIA, "e => e.scrollIntoView({block:'center'})")
        await m.tap(DIA)
        await m.keyboard.type("1.2, 1.4", delay=10)
        ok("모바일 키보드로 '1.2, 1.4' 입력", (await m.input_value(DIA)) == "1.2, 1.4")
        await m.fill(DIA, "")
        await m.tap('.dchip[data-dia="1.6"]')
        ok("모바일 칩 탭 입력", (await m.input_value(DIA)) == "1.6")
        chip_box = await m.locator('.dchip[data-dia="1.2"]').bounding_box()
        ok("모바일 칩 터치 영역 ≥ 30px", chip_box and chip_box["height"] >= 30,
           chip_box["height"] if chip_box else None)
        last_chip = await m.locator('.dchip[data-dia="1.6"]').bounding_box()
        ok("모바일 칩이 화면 폭 안", last_chip and last_chip["x"] + last_chip["width"] <= 390,
           last_chip and round(last_chip["x"] + last_chip["width"]))

        # 모바일 전 구간 — 슬래시·콤마 섞은 지름으로 100점
        await m.fill(DIA, "")
        for fid in FIELD_ORDER:
            await set_field(m, fid, ANSWERS[fid])
        ok("모바일 20칸 작성", (await m.inner_text("#fillCount")) == "20", await m.inner_text("#fillCount"))
        ok("모바일 지름 값 유지(슬래시 혼용)", (await m.input_value(DIA)) == ANSWERS["wireDia"],
           await m.input_value(DIA))
        await m.click("#btnSubmit")
        await m.wait_for_timeout(1500)
        score = await m.inner_text(".res-score .n")
        ok("모바일 합격 100점", score == "100", score)
        ok("모바일 콘솔 에러 0", not merr, merr[:3])
        ok("모바일 요청 실패 0", not mreq, mreq[:3])

        # 다시 작성으로 돌아왔을 때 지름 값·칩 상태 복원
        r = await b.new_page(viewport={"width": 1280, "height": 900})
        await r.goto(base, wait_until="load")
        await r.wait_for_timeout(600)
        await to_wps(r)
        await r.eval_on_selector(DIA, "e => e.scrollIntoView({block:'center'})")
        await r.fill(DIA, "1.2, 1.4")
        for fid in FIELD_ORDER:
            await set_field(r, fid, ANSWERS[fid])
        await r.eval_on_selector('.field[data-fid="filler"]', "e => e.scrollIntoView({block:'center'})")
        await r.locator('.field[data-fid="filler"] .chip[data-val="E70T-1C (A5.20)"]').first.click()   # 일부러 오답
        await r.wait_for_timeout(200)
        await r.click("#btnSubmit")
        await r.wait_for_timeout(1500)
        if await r.locator("#btnAgain").count():
            await r.click("#btnAgain")
            await r.wait_for_timeout(900)
            hint = await r.inner_text('[data-dia-hint="wireDia"]')
            pressed = await r.eval_on_selector('.dchip[data-dia="1.2"]', "e => e.getAttribute('aria-pressed')")
            ok("다시 작성 후 지름 인식·칩 상태 복원", "Ø1.2" in hint and "Ø1.4" in hint and pressed == "true",
               f"{hint} / pressed={pressed}")
        else:
            ok("다시 작성 버튼 존재", False, "#btnAgain 없음")

        ok("데스크톱 콘솔 에러 0", not console and not pageerr, (console + pageerr)[:3])
        ok("데스크톱 요청 실패 0", not reqfail, reqfail[:3])
        await b.close()

    if httpd:
        httpd.shutdown()
    bad = [c for c in checks if not c[1]]
    print(f"\n=== {'라이브' if live else '로컬'} 요약: {len(checks) - len(bad)}/{len(checks)} 통과 ===")
    for c in bad:
        print("FAIL:", c[0], c[2])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
