import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        m = await b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await m.goto("file:///workspace/wps-d1.1/index.html", wait_until="load")
        await m.wait_for_timeout(900)
        await m.screenshot(path="screenshots/live/13-mobile-landing-local.png")
        h = await m.evaluate("document.querySelector('#btnStart').getBoundingClientRect().bottom")
        print("start button bottom:", h, "viewport 844")
        await b.close()
asyncio.run(main())
