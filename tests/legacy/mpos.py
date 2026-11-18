import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        m = await b.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
        await m.goto("file:///workspace/wps-d1.1/index.html")
        await m.wait_for_timeout(600)
        r = await m.evaluate("""() => { const el=document.querySelector('.hero-cta'); const cs=getComputedStyle(el);
          return {pos:cs.position, bottom:cs.bottom, rect:el.getBoundingClientRect().toJSON(),
                  docH:document.documentElement.scrollHeight, mm: matchMedia('(max-width:760px)').matches}; }""")
        print(r)
        await m.screenshot(path="shots/m-landing.png")
        await b.close()
asyncio.run(main())
