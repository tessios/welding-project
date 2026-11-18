import asyncio
from playwright.async_api import async_playwright

BASE = "https://tessios.github.io/welding-project/"
OUT = "screenshots/live"

ANSWERS = {
  "joint": "T-joint · 양면 필렛",
  "backing": "Backing 없음 · Backgouging 없음",
  "rootGap": "2",
  "filletSize": "6",
  "baseMetal": "KS D 3515 SM275",
  "group": "Table 5.3 미등재",
  "thickRange": "3 mm ~ 제한 없음",
  "process": "FCAW-G",
  "polarity": "DC · DCEP (역극성)",
  "wireCurrent": "Ø1.2 mm · 200 A · 25 V",
  "filler": "E71T-1C (A5.20)",
  "fano": "참고 F-6 / A-1",
  "gas": "100% CO₂ · 15–25 L/min + 방풍",
  "position": "3F · 수직 상진",
  "preheat": "최소 20 °C · 층간 20 °C 이상",
  "heatInput": "1.2",
  "pwht": "없음 (None)",
  "prequal": "Qualified (Clause 6) — PQR-ST-012",
}

async def fill(pg, mapping):
    for fid, val in mapping.items():
        field = pg.locator(f'.field[data-fid="{fid}"]')
        inp = field.locator("input")
        if await inp.count() > 0:
            await inp.fill(val)
        else:
            await field.locator(f'.chip:has-text("{val}")').first.click()
    await pg.wait_for_timeout(300)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1440,"height":900})
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append("PAGEERROR: " + str(e)))
        await pg.goto(BASE, wait_until="load")
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f"{OUT}/01-landing.png")

        await pg.click("#btnStart")
        await pg.wait_for_timeout(1000)
        await pg.screenshot(path=f"{OUT}/02-call-ring.png")
        await pg.wait_for_timeout(12000)
        await pg.screenshot(path=f"{OUT}/03-call-talk.png")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f"{OUT}/04-monologue.png")

        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=f"{OUT}/05-brief.png")
        # 자료함 열기
        await pg.locator('.drawer summary').nth(1).click()
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=f"{OUT}/05b-brief-drawer.png")

        await pg.click("#btnToWps")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=f"{OUT}/06-wps.png")

        await pg.hover('.field[data-fid="preheat"]')
        await pg.wait_for_timeout(450)
        await pg.screenshot(path=f"{OUT}/07-pop-ask.png")
        await pg.hover('.field[data-fid="process"]')
        await pg.wait_for_timeout(450)
        await pg.screenshot(path=f"{OUT}/08-pop-given.png")

        # 정답 제출
        await fill(pg, ANSWERS)
        await pg.mouse.move(10,10)
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=f"{OUT}/09-filled.png", full_page=True)
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(4500)
        await pg.screenshot(path=f"{OUT}/10-pass.png")

        # 다시 → 오답 제출
        await pg.click("#btnRestart2")
        await pg.wait_for_timeout(500)
        await pg.click("#btnStart")
        await pg.wait_for_timeout(600)
        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(900)
        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(300)
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(400)
        bad = dict(ANSWERS)
        bad["preheat"] = "예열 없음"
        bad["filler"] = "E70T-1C (A5.20)"
        bad["position"] = "3F · 수직 하진"
        bad["prequal"] = "Prequalified (Clause 5)"
        await fill(pg, bad)
        await pg.mouse.move(10,10)
        await pg.wait_for_timeout(300)
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1300)
        await pg.screenshot(path=f"{OUT}/11-fracture-mid.png")
        await pg.wait_for_timeout(2600)
        await pg.screenshot(path=f"{OUT}/12-fail.png")

        # 모바일
        m = await b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await m.goto(BASE, wait_until="load")
        await m.wait_for_timeout(500)
        await m.screenshot(path=f"{OUT}/13-mobile-landing.png")
        await m.click("#btnStart")
        await m.wait_for_timeout(800)
        await m.click("#btnSkipCall")
        await m.wait_for_timeout(1200)
        await m.click("#btnToBrief")
        await m.wait_for_timeout(400)
        await m.screenshot(path=f"{OUT}/14-mobile-brief.png")
        await m.click("#btnToWps")
        await m.wait_for_timeout(500)
        await m.locator('.field[data-fid="group"]').tap()
        await m.wait_for_timeout(500)
        await m.screenshot(path=f"{OUT}/15-mobile-pop.png")

        print("ERRORS:", errs[:20])
        await b.close()

asyncio.run(main())
