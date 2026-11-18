# Form J-2 (Prequalified WPS) 검토 메모 — 실제 작성본 대조

> 대상: David님이 실제 작성한 `Form J-2` Prequalified WPS 사진 1장(2026-11-18 촬영, `IMG_7128`).
> 대조 기준: **AWS D1.1/D1.1M:2025** — Clause 5(사전인정), Clause 7(제작), **Annex J(Informative) J2 · Form J-2**.
> 앱에는 이 양식의 값과 논리를 그대로 옮기고, 회사명·작성자 실명은 `(교육용 샘플)` / `이프로`로 익명 처리했습니다.

---

## 1. 사진에서 읽은 값

| 구획 | 항목 | 기재값 | D1.1 대조 |
|---|---|---|---|
| 머리 | WPS No. / Rev. / Date | `P-AWS D11-003` / `A` / `Dec. 23. 2024` | — (사내 번호) |
| 머리 | Supporting PQR(s) | **None (Prequalified)** | Annex J **J2** — “J2 is sufficient for the purpose of documenting prequalified WPSs.” |
| 머리 | CVN Report | **No** | CVN 미요구 → 입열량은 Table 6.8 추가필수 대상 아님 |
| 모재 | Base Material / Welded To | **ASTM A 36 or Equivalent** (Type or Grade `-`) | Table 5.6 등재 강재 |
| 모재 | AWS Group No. | **I, II** | A36은 Group I(**≤ 3/4 in [20 mm]**)과 Group II(**All thicknesses**)에 각각 등재 |
| 모재 | Backing Material | **None** | 필렛은 5.4.1.2(steel backing) 대상 아님 |
| 두께 | Fillet Welds | **< 75 mm** (As-Welded = With PWHT) | 사전인정 필렛은 코드상 두께 상한 없음 → 75 mm는 양식의 관리 상한(7.21.1의 75 mm 경계와 일치) |
| 이음 | Groove Type | **Fillet weld (T, Corner joint)** | 5.4.3 · Figure 5.3 사전인정 필렛 상세 |
| 이음 | Root Opening | **0 ~ 5 mm** (Sketch: As detailed R = 0 +2/−0, As fit-up max 5) | 7.21.1 — 5 mm 초과 불가, **2 mm 초과 시 초과량만큼 각장 증가** |
| 이음 | Minimum Size of Fillet Weld | T≤6: 3 mm(반복하중 5 mm) / 6&lt;T≤12: 5 mm / 12&lt;T≤20: 6 mm / 20&lt;T: 8 mm | Table 7.7 (7.13) |
| 이음 | Joint detail / 직각도 | **TC-F12-GF**, “Perpendicularity … withing ±10°” | Figure 5.3 T-joint(다이헤드럴 80~100°) · 5.4.3.3 skewed T 경계 100° |
| 공정 | Process / Type | **FCAW** / **Semi-auto** | 5.5.1 사전인정 공정 |
| 공정 | Position / Vertical Progression | **All** / **Up Hill** | Table 5.5 (2) · 5.8.1.1 수직 상진 원칙 |
| 용가재 | Filler Metal (AWS Spec.) / Class | **A5.20** / **E71T-1C** | Table 5.7 Group I·II — E7XT-XC 등재 |
| 용가재 | Diameter | **1.2Ø, 1.4Ø, 1.6Ø** | Table 5.5 (7) 필수변수 |
| 가스 | Shielding Gas / Flow / Nozzle | **100 % CO₂** / **15~30 L/min** / **#4** | 5.6.4 · Table 5.5 (17)(18) — 분류 문자 `C`와 일치 |
| 예열 | Preheat / Interpass | **0 °C (3&lt;T≤20) / 10 °C (20&lt;T≤38) / 65 °C (38&lt;T≤65) / 110 °C (65&lt;T)**, 모재 **&lt;0 °C → 최소 20 °C** | Table 5.11 Category B(저수소 공정) + 주 a |
| 전기 | Current / Amps / Volts | **DCEP** / 1.2Ø **120~300 A**, 1.4Ø **180~350 A**, 1.6Ø **180~400 A** / **28~30 V** | Table 5.5 (10)(11)(13)(14), 허용폭 (22) ±10 % · (23) ±15 % |
| 기법 | Stringer or Weave / Multi or Single | **Both / Both** | — (기법 변수, WPS 기재 항목) |
| 기법 | CTWD / Interpass Cleaning / Peening | **10~15 mm** / **Wire brush** / **None** | — |
| 열처리 | PWHT | **None** | 5.9 · Table 5.5 (21) |

---

## 2. 논리 검토 — 이 양식이 성립하는 이유

1. **A36이기 때문에 Supporting PQR이 “None”이어도 된다.**
   Clause 5는 Table 5.6 등재 모재 · Table 5.5 필수변수 · Table 5.7 필러 · Table 5.11 예열을 모두 지킨 WPS를 시험 없이 사전인정으로 봅니다(5.1, 5.5.1). A36은 Table 5.6 Group I·II 등재 강재이므로 PQR 없이 Form J-2 한 장으로 발행됩니다. Annex J J2가 “J2 is sufficient for the purpose of documenting prequalified WPSs”라고 못 박고 있습니다.
2. **Group No. “I, II”는 오기가 아니라 두께 때문입니다.**
   Table 5.6은 ASTM A36을 **Group I에 “≤ 3/4 in [20 mm]”**, **Group II에 “All thicknesses”** 로 두 번 싣습니다. 20 mm 이하만 쓸 때는 Group I, 75 mm까지 한 장으로 덮으려면 Group II를 함께 적어야 합니다. 사진의 “I, II”는 이 이중 등재를 반영한 표기입니다.
3. **E71T-1C + 100 % CO₂ + DCEP + All 은 Table 5.7·5.5 안에 있습니다.**
   필러 분류의 끝문자 `C`가 CO₂를 뜻하므로 가스 변경(Ar 혼합, `M`)은 곧 분류·필수변수 변경입니다. 극성(DCEP)과 자세(All, 수직 상진)도 사전인정 범위입니다.
4. **CVN “No”이므로 입열량은 추가필수가 아닙니다.**
   입열량은 충격시험이 계약에 요구될 때만 재인정 대상입니다(Table 6.8 (10)). 그래도 시공 기록으로 계산해 두는 것이 좋습니다 — H = 60·E·I ÷ (1000·v).

---

## 3. 그대로 쓰기 전에 손볼 것 · 주의할 것

| # | 항목 | 내용 | 조치 |
|---|---|---|---|
| 1 | 오타 | “Perpendicularity of the members shall be **withing** ±10°” | **within** ±10° 로 수정 |
| 2 | 표기 | “Semi-auto” | D1.1·AWS 표기는 **Semiautomatic**. 사내 양식 표기로 굳혔다면 유지해도 되지만, 감리 대조 시 통일 |
| 3 | 최소 각장 경계 | 양식은 **T≤6 → 3 mm**, Table 7.7은 6 mm를 5 mm 구간으로 읽는 표기 | **정확히 6 mm 부재는 큰 값(5 mm) 적용**이 안전. 반복하중 구조는 5 mm(주 c) |
| 4 | 필러 수소 | `E71T-1C`에 확산성 수소 지시자(H4/H8 등) 없음 | 저수소 관리 대상 현장이면 **A5.20 지시자를 붙인 제품**으로 발주하고 WPS에도 함께 기재 |
| 5 | 루트 간격 | 양식 “0~5 mm”는 **최대 허용**값 | 관리 목표는 **0~2 mm**. 2 mm 초과분은 각장 증가(7.21.1), 5 mm 초과는 재조정 |
| 6 | 전류 범위 | 1.2Ø **120~300 A**는 매우 넓은 포락선 | 개소별 실제값을 WPS에 함께 적고, 변경은 Table 5.5 (22) ±10 % 안에서 |
| 7 | 자세 | Position **All** | 수직은 **상진 한정**(5.8.1.1). All은 F·V·H·OH를 포괄하는 관행 표기이며, 하진·수직 하향은 불가 |
| 8 | 직각도 | ±10° | Figure 5.3 T-joint 범위. **100°(다이헤드럴)를 넘으면 skewed T**(5.4.3.2·5.4.3.3)로 별도 상세 필요 |
| 9 | 두께 상한 | “Fillet Welds < 75 mm” | 75 mm 이상은 7.21.1 예외(받침 사용 시 8 mm)와 예열 110 °C 구간 → **별도 WPS로 분리** 권장 |
| 10 | 바람 | 15~30 L/min | 야외 3~4 m/s 이상이면 **방풍 필수**. 양식에 방풍 조건을 각주로 추가 |
| 11 | 서명·회사 | 회사명·작성자 실명·도장 | 공개 자료에는 넣지 않음(앱은 `(교육용 샘플)` / `이프로`) |

---

## 4. 앱 반영 결과

- 강종 `SM275` → **`ASTM A36`** 로 전면 교체(대사·자막·음성 n_summary/n_brief/p04/s02 재합성 · faster-whisper 전사 확인).
- 18칸의 정답·근거를 위 표 값으로 교체. 핵심 판정은 **사전인정(Clause 5, PQR 없음)**.
- WPS 화면 머리말에 **`WPS-A36-F01` / `Supporting PQR(s) None (Prequalified)` / `CVN No` / `양식 Form J-2`** 를 표시.
- 자세 정답을 **`All (F·V·H·OH) · 수직 상진`** 으로 인정(단일 자세만 정답 처리하지 않음).
- 팝오버에 Form J-2의 값(TC-F12-GF · ±10° · 두께표 · 지름별 전류 · Nozzle #4 · CTWD)을 근거와 함께 수록.
