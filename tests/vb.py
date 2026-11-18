import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1440,"height":900})
        await pg.goto("file:///workspace/wps-d1.1/index.html")
        await pg.click("#btnStart"); await pg.wait_for_timeout(200)
        await pg.click("#btnSkipCall"); await pg.wait_for_timeout(700)
        await pg.click("#btnToBrief"); await pg.wait_for_timeout(300)
        print("brief:", await pg.locator("#briefVisual svg").get_attribute("viewBox"))
        await pg.screenshot(path="shots/check-brief.png")
        await b.close()
asyncio.run(main())
