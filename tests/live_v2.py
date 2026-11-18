"""배포본(https://tessios.github.io/welding-project/) 최종 검증 — 데스크톱 · 모바일"""
import asyncio, os
from playwright.async_api import async_playwright

BASE = "https://tessios.github.io/welding-project/"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "screenshots", "v2")
os.makedirs(OUT, exist_ok=True)


async def main():
    ok_all = True
    checks = []

    def ok(name, cond, detail=""):
        nonlocal ok_all
        checks.append((name, cond, detail))
        ok_all = ok_all and bool(cond)
        print(("PASS  " if cond else "FAIL  ") + name + ((" — " + detail) if detail else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        console, pageerr, audio = [], [], []
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: pageerr.append(str(e)))
        pg.on("response", lambda r: audio.append((r.url, r.status)) if ("/audio/" in r.url) else None)

        resp = await pg.goto(BASE, wait_until="load")
        ok("HTTP 200", resp.status == 200, str(resp.status))
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "live-01-landing.png"))

        await pg.click("#btnStart")
        await pg.wait_for_timeout(3500)
        await pg.screenshot(path=os.path.join(OUT, "live-02-call.png"))
        ok("내레이션 자막", await pg.locator("#narrBar").is_visible())
        ok("BGM 요청 정상", any("bgm_terran" in u and st in (200, 206) for u, st in audio), str(audio[:4]))
        await pg.click("#btnMute")
        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(600)
        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(800)
        ok("현장 상황 · 내일 용접 할 개소", "내일 용접 할 개소" in await pg.inner_text("#scene-brief"))
        await pg.screenshot(path=os.path.join(OUT, "live-03-brief.png"))
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(600)
        ok("배지 18개", await pg.locator(".field .cat").count() == 18)
        await pg.screenshot(path=os.path.join(OUT, "live-04-wps.png"))

        # 팝오버 원문 카드
        await pg.eval_on_selector('.field[data-fid="group"]', "e => e.scrollIntoView({block:'center'})")
        await pg.click('.field[data-fid="group"] .qm')
        await pg.wait_for_selector("#pop.on")
        ok("원문 카드 헤더", "AWS D1.1/D1.1M:2025" in await pg.inner_text("#pop .spec-head"))
        ok("SWPS 문구", "SWPS" in await pg.inner_text("#pop .pop-ko"), (await pg.inner_text("#pop .pop-ko"))[:60])
        await pg.screenshot(path=os.path.join(OUT, "live-05-pop.png"))
        await pg.keyboard.press("Escape")

        # 18칸 채우기 (이 값 넣기)
        ids = await pg.eval_on_selector_all(".field", "els => els.map(e => e.dataset.fid)")
        for i, fid in enumerate(ids, 1):
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            await pg.click(f'.field[data-fid="{fid}"] .qm')
            await pg.wait_for_selector("#pop.on")
            await pg.click("#pop .fill-btn")
            await pg.keyboard.press("Escape")
        ok("18/18 채움", (await pg.inner_text("#fillCount")) == "18")
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1500)
        ok("100점 합격", (await pg.inner_text(".res-score .n")) == "100")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, "live-06-pass.png"))
        ok("콘솔 에러 0", len(console) == 0 and len(pageerr) == 0, f"{console[:2]} {pageerr[:2]}")

        # 모바일
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        merr = []
        m.on("pageerror", lambda e: merr.append(str(e)))
        await m.goto(BASE, wait_until="load")
        await m.wait_for_timeout(500)
        await m.screenshot(path=os.path.join(OUT, "live-07-mobile-landing.png"))
        await m.click("#btnStart")
        await m.wait_for_timeout(1200)
        await m.click("#btnMute")
        await m.click("#btnSkipCall")
        await m.wait_for_timeout(400)
        await m.click("#btnToBrief")
        await m.wait_for_timeout(600)
        await m.click("#btnToWps")
        await m.wait_for_timeout(500)
        await m.eval_on_selector('.field[data-fid="preheat"]', "e => e.scrollIntoView({block:'center'})")
        await m.click('.field[data-fid="preheat"] .qm')
        await m.wait_for_timeout(400)
        geo = await m.evaluate("""() => {
            const p = document.querySelector('#pop').getBoundingClientRect();
            const b = document.querySelector('.submit-bar').getBoundingClientRect();
            return {overlap: p.bottom > b.top + 1, top: p.top, bottom: p.bottom, barTop: b.top};
        }""")
        ok("모바일 시트가 제출 바 위", not geo["overlap"], str(geo))
        await m.screenshot(path=os.path.join(OUT, "live-08-mobile-pop.png"))
        ok("모바일 페이지 에러 0", len(merr) == 0, str(merr[:2]))
        await b.close()

    print("\n=== 요약:", sum(1 for c in checks if c[1]), "/", len(checks), "통과 ===")
    return 0 if ok_all else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
