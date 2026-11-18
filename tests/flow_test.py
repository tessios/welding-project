#!/usr/bin/env python3
"""WPS 실습실 — 로컬 브라우저 검증 (5단계 클릭 · 계산 · 마법사 · 채점 · 콘솔 에러 0)"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "file://" + os.path.abspath("wps-d1.1/index.html"))
SHOT = os.path.abspath("wps-d1.1/screenshots")
os.makedirs(SHOT, exist_ok=True)

errors, console_errors = [], []


def check(cond, label, detail=""):
    print(("  OK   " if cond else "  FAIL ") + label + ((" :: " + str(detail)) if detail and not cond else ""))
    if not cond:
        errors.append(label + " " + str(detail))


def run(p, url):
    print("== target:", url)
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1280, "height": 900}, locale="ko-KR")
    page = ctx.new_page()
    page.on("pageerror", lambda e: console_errors.append("pageerror: " + str(e)))
    page.on("console", lambda m: console_errors.append("console." + m.type + ": " + m.text) if m.type in ("error",) else None)
    page.goto(url, wait_until="load")
    page.wait_for_timeout(400)

    # ---------- S0
    check(page.locator("h1").first.inner_text().strip() != "", "S0 홈 렌더")
    page.screenshot(path=f"{SHOT}/01-home.png", full_page=True)
    page.fill("#nameIn", "테스트수강생")
    page.click('[data-start="full"]')
    page.wait_for_timeout(250)
    check(page.locator("#s1.on").count() == 1, "S1 이론카드 진입")

    # ---------- S1
    for _ in range(4):
        page.click("#cardNext")
        page.wait_for_timeout(120)
    check(page.locator("#s2.on").count() == 1, "카드 4장 → S2 독도 진입")

    # ---------- S2 : 12포인트 클릭
    for n in range(1, 13):
        page.click(f'[data-point="{n}"]')
        page.wait_for_timeout(70)
    visited = page.evaluate("window.__WPS.state.readVisited.length")
    check(visited == 12, "12포인트 전부 방문", visited)
    panel = page.locator(".panel").inner_text()
    check("근거 풀이" in panel and "현장 주의" in panel, "해설 패널(근거·주의) 표시")
    page.screenshot(path=f"{SHOT}/02-reader.png", full_page=True)

    # 퀘스트 : 필드 방문 후 정답
    page.click('[data-mode="quest"]')
    page.wait_for_timeout(150)
    quests = page.evaluate("QUESTS.map(q=>({id:q.id,need:q.need,answer:q.answer}))")
    for q in quests:
        page.click(f'[data-quest="{q["id"]}"][data-opt="{q["answer"]}"]')
        page.wait_for_timeout(120)
    rights = page.evaluate("QUESTS.filter(q=>window.__WPS.state.quest[q.id]===q.answer).length")
    check(rights == 3, "퀘스트 3/3 정답 반영", rights)
    check(page.locator("#toSim").is_enabled(), "독도 완료 → 시뮬레이터 버튼 활성")
    page.click("#toSim")
    page.wait_for_timeout(250)

    # ---------- S3 계산기
    check(page.locator("#s3.on").count() == 1, "S3 진입")
    body = page.locator("#simBody").inner_text()
    check("10 °C (50 °F)" in body, "Table 5.8 예열 = 10 °C (A992, 25 mm)", body[:400])
    check("3 mm ~ 32 mm" in body, "Table 6.2 인정 두께 3~32 mm", body[:400])
    check("1.25 kJ/mm" in body, "입열량 계산 1.25 kJ/mm", body[:400])
    # 비저수소 → 범주 A 확인
    page.select_option("#cFiller", "E6010")
    page.wait_for_timeout(200)
    body2 = page.locator("#simBody").inner_text()
    check("65 °C (150 °F)" in body2, "E6010(비저수소) → 범주 A 65 °C", body2[:400])
    page.select_option("#cFiller", "E71T-1")
    page.wait_for_timeout(150)
    # 시험 두께 25 mm → 무제한
    page.fill("#cPT", "25")
    page.locator("#cPT").dispatch_event("change")
    page.wait_for_timeout(200)
    check("무제한" in page.locator("#simBody").inner_text(), "T=25 mm → 두께 무제한")
    page.fill("#cPT", "16")
    page.locator("#cPT").dispatch_event("change")
    page.wait_for_timeout(150)
    page.screenshot(path=f"{SHOT}/03-simulator.png", full_page=True)

    # ---------- S3 시나리오
    page.click('[data-tab="scen"]')
    page.wait_for_timeout(200)
    asked = page.evaluate("window.__WPS.state.sim.asked")
    check(len(asked) == 3, "시나리오 3문제 출제", asked)
    answers = page.evaluate("window.__WPS.state.sim.asked.map(id=>{const s=SCENARIOS.find(x=>x.id===id);return {id:id,cls:s.clsAns,act:s.actAns};})")
    for a in answers:
        page.click(f'[data-sc="{a["id"]}"][data-kind="cls"][data-i="{a["cls"]}"]')
        page.wait_for_timeout(80)
        page.click(f'[data-sc="{a["id"]}"][data-kind="act"][data-i="{a["act"]}"]')
        page.wait_for_timeout(120)
    check(page.locator("#toWrite").is_enabled(), "시나리오 3/3 → 작성 버튼 활성")
    page.click("#toWrite")
    page.wait_for_timeout(250)

    # ---------- S4 마법사
    check(page.locator("#s4.on").count() == 1, "S4 진입")
    A = page.evaluate("window.__WPS.ANSWERS")

    def set_field(key, value, kind="select"):
        sel = f'[data-f="{key}"]'
        if kind == "select":
            page.select_option(sel, value)
        else:
            page.fill(sel, str(value))
        page.wait_for_timeout(40)

    # step1
    set_field("hdrNo", "GA-WPS-201", "text")
    set_field("rev", "0", "text")
    set_field("pqr", "ED-PQR-001")
    set_field("route", "clause6")
    page.click("#wNext"); page.wait_for_timeout(150)
    # step2
    set_field("process", A["process"]); set_field("method", A["method"])
    page.click("#wNext"); page.wait_for_timeout(150)
    # step3
    set_field("joint", A["joint"]); set_field("groove", A["groove"], "text")
    set_field("root", A["root"], "text"); set_field("backing", A["backing"])
    page.click("#wNext"); page.wait_for_timeout(150)
    # step4
    set_field("bspec", A["bspec"]); set_field("bgrade", A["bgrade"]); set_field("group", A["group"])
    set_field("tMin", A["tMin"], "text"); set_field("tMax", A["tMax"], "text")
    page.click("#wNext"); page.wait_for_timeout(150)
    # step5
    set_field("fclass", A["fclass"])
    page.wait_for_timeout(200)
    fno = page.locator('[data-f="fno"]').input_value()
    check(fno == "6", "F-No. 자동 제안(F6)", fno)
    set_field("dia", A["dia"], "text")
    page.screenshot(path=f"{SHOT}/04-wizard.png", full_page=True)
    page.click("#wNext"); page.wait_for_timeout(150)
    # step6 : 자세 1G 만
    page.check('[data-pos="1G"]')
    page.wait_for_timeout(80)
    page.click("#wNext"); page.wait_for_timeout(150)
    # step7 PWHT
    set_field("pwht", A["pwht"])
    page.click("#wNext"); page.wait_for_timeout(150)
    # step8 예열
    set_field("preheat", A["preheat"], "text"); set_field("interpass", A["interpass"], "text")
    page.click("#wNext"); page.wait_for_timeout(150)
    # step9 가스
    set_field("gas", A["gas"]); set_field("flow", A["flow"], "text")
    page.click("#wNext"); page.wait_for_timeout(150)
    # step10 전기·기법
    set_field("polarity", A["polarity"])
    set_field("ampMin", A["ampMin"], "text"); set_field("ampMax", A["ampMax"], "text")
    set_field("voltMin", A["voltMin"], "text"); set_field("voltMax", A["voltMax"], "text")
    set_field("ctWd", A["ctWd"], "text"); set_field("speed", 30, "text")
    set_field("hi", A["hi"], "text")
    set_field("passes", A["passes"]); set_field("backgouge", A["backgouge"])
    page.click("#wNext"); page.wait_for_timeout(200)
    # step11 검토
    check(page.locator("#wSubmit").is_enabled(), "검토 — 필수항목 완료로 제출 가능")
    page.screenshot(path=f"{SHOT}/05-review.png", full_page=True)
    page.click("#wSubmit")
    page.wait_for_timeout(350)

    # ---------- S5 결과
    check(page.locator("#s5.on").count() == 1, "S5 채점 결과 진입")
    text = page.locator("#s5").inner_text()
    check("100" in text and "합격" in text, "정답 입력 → 100점 합격", text[:300])
    check("치명 오류" not in text.split("합격")[0], "치명 오류 없음")
    page.screenshot(path=f"{SHOT}/06-result.png", full_page=True)

    # ---------- S6 리뷰
    page.click("#toReview"); page.wait_for_timeout(250)
    check("오답이 없습니다" in page.locator("#s6").inner_text(), "S6 리뷰 — 오답 0건")

    # ---------- 사전 / 강사모드
    page.click("#btnHome"); page.wait_for_timeout(200)
    page.click("#btnGlossary"); page.wait_for_timeout(200)
    page.fill("#glossSearch", "5.8"); page.wait_for_timeout(200)
    gtxt = page.locator("#glossBody").inner_text()
    check("최소 예열" in gtxt, "사전 검색(5.8)")
    page.keyboard.press("Escape"); page.wait_for_timeout(150)
    check(page.locator("#overlay").is_hidden(), "사전 ESC 닫기")
    page.click("#btnInstructor"); page.wait_for_timeout(250)
    ins = page.locator("#glossBody").inner_text()
    check("점수 추이" in ins, "강사 모드 열림")
    page.keyboard.press("Escape"); page.wait_for_timeout(150)

    # ---------- 오답 경로 검증 : 최대 두께를 인정범위 밖으로
    page.click('[data-go="s4"]'); page.wait_for_timeout(250)
    page.evaluate("""() => { const s = window.__WPS.state; s.draft.tMax = '45'; s.wstep = 11; }""")
    page.click('[data-wstep="11"]'); page.wait_for_timeout(200)
    page.click("#wSubmit"); page.wait_for_timeout(300)
    t2 = page.locator("#s5").inner_text()
    check("불합격" in t2, "인정범위 초과(tMax 45) → 불합격", t2[:300])
    check("치명 오류" in t2, "치명 오류 표시")
    page.screenshot(path=f"{SHOT}/07-fail.png", full_page=True)

    # ---------- 모바일 뷰
    page.set_viewport_size({"width": 390, "height": 844})
    page.click('[data-go="s2"]'); page.wait_for_timeout(300)
    page.screenshot(path=f"{SHOT}/08-mobile.png", full_page=True)
    check(page.locator('[data-point="3"]').is_visible(), "모바일에서 독도 필드 보임")

    # ---------- 저장 확인 (http 에서만)
    if url.startswith("http"):
        page.reload(wait_until="load"); page.wait_for_timeout(400)
        score = page.evaluate("window.__WPS.state.attempts.length")
        check(score >= 2, "새로고침 후 기록 유지(localStorage)", score)

    browser.close()


with sync_playwright() as p:
    run(p, BASE)

print("\n== 콘솔 에러:", len(console_errors))
for e in console_errors:
    print("   ", e)
check(len(console_errors) == 0, "콘솔·페이지 에러 0건")

print("\n== 결과:", "PASS" if not errors else f"FAIL ({len(errors)})")
sys.exit(0 if not errors else 1)
