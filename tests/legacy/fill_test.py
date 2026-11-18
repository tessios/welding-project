import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]
        pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file:///workspace/wps-d1.1/index.html")
        await pg.click("#btnStart"); await pg.wait_for_timeout(300)
        await pg.click("#btnSkipCall"); await pg.wait_for_timeout(900)
        await pg.click("#btnToBrief"); await pg.wait_for_timeout(300)
        await pg.click("#btnToWps"); await pg.wait_for_timeout(400)
        await pg.hover('.field[data-fid="baseMetal"]')
        await pg.wait_for_timeout(400)
        await pg.screenshot(path="shots/16-pop-fill.png")
        await pg.click("#popFill")
        await pg.wait_for_timeout(300)
        val = await pg.locator('input[data-field="baseMetal"]').input_value()
        cnt = await pg.locator("#fillCount").inner_text()
        # 선택 후 트레이 상태
        await pg.locator('.field[data-fid="filler"] .chip:has-text("E71T-1C (A5.20)")').click()
        await pg.wait_for_timeout(200)
        tray = await pg.locator('[data-tray="filler"]').get_attribute("class")
        print("fill value:", val, "| count:", cnt, "| tray:", tray)
        await pg.locator('.field[data-fid="filler"]').screenshot(path="shots/17-field-picked.png")
        print("ERRORS:", errs)
        await b.close()
asyncio.run(main())
