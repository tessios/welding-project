import asyncio
from playwright.async_api import async_playwright
ANSWERS = {
  "joint":"T-joint · 양면 필렛","backing":"Backing 없음 · Backgouging 없음","rootGap":"2","filletSize":"6",
  "baseMetal":"KS D 3515 SM275","group":"Table 5.3 미등재","thickRange":"3 mm ~ 제한 없음","process":"FCAW-G",
  "polarity":"DC · DCEP (역극성)","wireCurrent":"Ø1.2 mm · 200 A · 25 V","filler":"E71T-1C (A5.20)",
  "fano":"참고 F-6 / A-1","gas":"100% CO₂ · 15–25 L/min + 방풍","position":"3F · 수직 상진",
  "preheat":"최소 20 °C · 층간 20 °C 이상","heatInput":"1.2","pwht":"없음 (None)",
  "prequal":"Qualified (Clause 6) — PQR-ST-012"}
async def fill(pg, m):
    for k,v in m.items():
        f = pg.locator(f'.field[data-fid="{k}"]')
        if await f.locator("input").count(): await f.locator("input").fill(v)
        else: await f.locator(f'.chip:has-text("{v}")').first.click()
async def go(pg, bad=None):
    await pg.click("#btnStart"); await pg.wait_for_timeout(300)
    await pg.click("#btnSkipCall"); await pg.wait_for_timeout(900)
    await pg.click("#btnToBrief"); await pg.wait_for_timeout(200)
    await pg.click("#btnToWps"); await pg.wait_for_timeout(300)
    m = dict(ANSWERS); m.update(bad or {})
    await fill(pg, m); await pg.mouse.move(5,5); await pg.wait_for_timeout(200)
    await pg.click("#btnSubmit")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1440,"height":900})
        await pg.goto("file:///workspace/wps-d1.1/index.html")
        await go(pg); await pg.wait_for_timeout(4200)
        await pg.screenshot(path="shots/10-pass.png")
        await pg.click("#btnRestart2"); await pg.wait_for_timeout(400)
        await go(pg, {"preheat":"예열 없음","filler":"E70T-1C (A5.20)","prequal":"Prequalified (Clause 5)"})
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path="shots/11-fracture-mid.png")
        await pg.wait_for_timeout(2600)
        await pg.screenshot(path="shots/12-fail.png")
        await b.close()
asyncio.run(main())
