"""배포본(라이브 URL) 검증 — A36 · Form J-2 반영 확인

- https://tessios.github.io/welding-project/ 에 실제로 접속해 확인
- ASTM A36 표기 / 이전 강종 잔여 0건 / Position All / Form J-2 머리말
- 18칸 전부 「이 값 넣기」 → 100점 합격, 오답 → 붕괴 연출
- 콘솔 에러 0 · 요청 실패 0
- 캡처: screenshots/live_v3/
"""
import asyncio, os
from playwright.async_api import async_playwright

BASE = "https://tessios.github.io/welding-project/index.html"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "screenshots", "live_v3")
os.makedirs(OUT, exist_ok=True)


async def main():
    res = []

    def ok(n, c, d=""):
        res.append((n, bool(c), d))
        print(("PASS " if c else "FAIL ") + n + ((" — " + d) if d else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        con, err, fail = [], [], []
        pg.on("console", lambda m: con.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: err.append(str(e)))
        pg.on("requestfailed", lambda r: fail.append(r.url))

        await pg.goto(BASE, wait_until="load")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, "01-live-landing.png"))
        body = await pg.inner_text("body")
        ok("라이브 표지 ASTM A36", "ASTM A36" in body)
        ok("라이브 표지 이전 강종 없음", "SM275" not in body)

        await pg.click("#btnStart")
        await pg.wait_for_timeout(1200)
        await pg.click("#btnMute")
        await pg.wait_for_timeout(300)
        await pg.click("#btnSkipCall")
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "02-live-call.png"))

        await pg.click("#btnToBrief")
        await pg.wait_for_timeout(800)
        brows = await pg.inner_text("#scene-brief")
        ok("브리핑 ASTM A36", "ASTM A36" in brows)
        ok("브리핑 이전 강종 없음", "SM275" not in brows)
        await pg.screenshot(path=os.path.join(OUT, "03-live-brief.png"))

        await pg.click("#btnToWps")
        await pg.wait_for_timeout(700)
        head = await pg.inner_text("#wpsDoc .doc-head")
        ok("WPS 머리말 None (Prequalified) · Form J-2",
           "None (Prequalified)" in head and "Form J-2" in head)
        opts = await pg.eval_on_selector_all('.field[data-fid="position"] .chip', "e => e.map(x => x.dataset.val)")
        ok("Position All 옵션", any(o.startswith("All") for o in opts), str(opts))
        await pg.screenshot(path=os.path.join(OUT, "04-live-wps.png"))

        ids = await pg.eval_on_selector_all(".field", "e => e.map(x => x.dataset.fid)")
        for i, fid in enumerate(ids, 1):
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            await pg.click(f'.field[data-fid="{fid}"] .qm')
            await pg.wait_for_selector("#pop.on")
            await pg.click("#pop .fill-btn")
            got = await pg.evaluate("""(fid) => {
                const el = document.querySelector(`.field[data-fid="${fid}"]`);
                const inp = el.querySelector('input');
                if (inp) return inp.value;
                const on = el.querySelector('.chip.on');
                return on ? on.dataset.val : null;
            }""", fid)
            cnt = await pg.inner_text("#fillCount")
            assert got and cnt == str(i), f"{fid} {got} {cnt}"
            await pg.keyboard.press("Escape")
            await pg.wait_for_timeout(40)
        ok("18칸 이 값 넣기 18/18", (await pg.inner_text("#fillCount")) == "18")
        await pg.screenshot(path=os.path.join(OUT, "05-live-filled.png"))

        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(1200)
        ok("합격 100점", (await pg.inner_text(".res-score .n")) == "100")
        ok("합격 배지", "검사 통과" in await pg.inner_text(".res-badge"))
        await pg.wait_for_timeout(1800)
        await pg.screenshot(path=os.path.join(OUT, "06-live-pass.png"))

        await pg.click("#btnAgain")
        await pg.wait_for_timeout(400)
        await pg.click("#btnBackBrief")
        await pg.wait_for_timeout(300)
        await pg.click("#btnToWps")
        await pg.wait_for_timeout(400)
        for fid, val in {"preheat": "예열 없음", "filler": "E70T-1C (A5.20)", "position": "1F · 아래보기"}.items():
            await pg.eval_on_selector(f'.field[data-fid="{fid}"]', "e => e.scrollIntoView({block:'center'})")
            f = pg.locator(f'.field[data-fid="{fid}"]')
            if await f.locator("input").count():
                await f.locator("input").fill(val)
            else:
                await f.locator(f'.chip:has-text("{val}")').first.click()
        await pg.click("#btnSubmit")
        await pg.wait_for_timeout(4500)
        ok("붕괴 연출", "run" in (await pg.get_attribute("#collapseStage", "class") or ""))
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, "07-live-fail.png"))
        ok("불합격 배지", "부적합" in await pg.inner_text(".res-badge"))
        ok("콘솔 에러 0", len(con) == 0 and len(err) == 0, f"{con[:2]} {err[:2]}")
        ok("요청 실패 0", len(fail) == 0, str(fail[:3]))
        await b.close()

    print("\n=== 요약", sum(1 for r in res if r[1]), "/", len(res))
    return 0 if all(r[1] for r in res) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
