# 사전인정 필렛 WPS 검토 메모 — AWS D1.1/D1.1M:2025 Clause 5 · Annex J J2

> 이 문서는 앱 시나리오(A36 · 12 mm · 보 웨브–브래킷 수직 필렛)의 값과 판정 논리를 코드 조항으로 검증한 기록입니다.
> 대조 기준: **AWS D1.1/D1.1M:2025** — Clause 5(사전인정), Clause 7(제작), **Annex J(Informative) J2**.
> 앱의 회사명·작성자는 `(교육용 샘플)` / `이프로`로 익명 처리했습니다.

---

## 1. 시나리오 값과 코드 대조

| 구획 | 항목 | 앱의 값 | D1.1 대조 |
|---|---|---|---|
| 머리 | WPS No. / Rev. | `WPS-A36-F01` / `0` | — (교육용 가상 번호) |
| 머리 | Supporting PQR(s) | **None (Prequalified)** | Annex J **J2** — “J2 is sufficient for the purpose of documenting prequalified WPSs.” |
| 머리 | CVN Report | **No** | CVN 미요구 → 입열량은 Table 6.8 추가필수 대상 아님 |
| 모재 | Base Material | **ASTM A 36 or Equivalent** (Type or Grade `-`) | Table 5.6 등재 강재 |
| 모재 | AWS Group No. | **Group I** (12 mm) / 75 mm까지 덮을 때 **I, II** | A36은 Group I(**≤ 3/4 in [20 mm]**)과 Group II(**All thicknesses**)에 각각 등재 |
| 모재 | Backing Material | **None** | 필렛은 5.4.1.2(steel backing) 대상 아님 |
| 두께 | Fillet Welds | **< 75 mm** (As-Welded = With PWHT) | 사전인정 필렛은 코드상 두께 상한 없음 → 75 mm는 사내 관리 상한(7.21.1의 75 mm 경계와 일치) |
| 이음 | Joint Type | **Fillet weld (T, Corner joint)** | 5.4.3 · Figure 5.3 사전인정 필렛 상세 · **TC-F12-GF**, ±10° |
| 이음 | Root Opening | 관리 **0 ~ 2 mm** (최대 허용 5 mm) | 7.21.1 — 5 mm 초과 불가, **2 mm 초과 시 초과량만큼 각장 증가** |
| 이음 | Minimum Size of Fillet Weld | T≤6: 3 mm(반복하중 5 mm) / 6&lt;T≤12: 5 mm / 12&lt;T≤20: 6 mm / 20&lt;T: 8 mm | Table 7.7 (7.13) |
| 공정 | Process / Type | **FCAW** / **Semi-auto** | 5.5.1 사전인정 공정 |
| 공정 | Position / Vertical Progression | **All** / **Up Hill** | Table 5.5 (2) · 5.8.1.1 수직 상진 원칙 |
| 용가재 | Filler Metal (AWS Spec.) / Class | **A5.20** / **E71T-1C** | Table 5.7 Group I·II — E7XT-XC 등재 |
| 용가재 | Diameter | **1.2Ø / 1.4Ø** (재고) | Table 5.5 (7) — 사전인정에서는 비필수 취급 |
| 가스 | Shielding Gas / Flow / Nozzle | **100 % CO₂** / **15~30 L/min** / **#4** | 5.6.4 · Table 5.5 (17)(18) — 분류 문자 `C`와 일치 |
| 예열 | Preheat / Interpass | **0 °C (3&lt;T≤20) / 10 °C (20&lt;T≤38) / 65 °C (38&lt;T≤65) / 110 °C (65&lt;T)**, 모재 **&lt;0 °C → 최소 20 °C** | Table 5.11 Category B(저수소 공정) + 주 a |
| 전기 | Current / Amps / Volts | **DCEP** / 1.2Ø **120~300 A**, 1.4Ø **180~350 A** / **28~30 V** | Table 5.5 (10)(11)(13)(14), 허용폭 (22) ±10 % · (23) ±15 % |
| 열처리 | PWHT | **None** | 5.9 · Table 5.5 (21) |

---

## 2. 논리 검토 — 이 절차서가 성립하는 이유

1. **A36이기 때문에 Supporting PQR이 “None”이어도 된다.**
   Clause 5는 Table 5.6 등재 모재 · Table 5.5 필수변수 · Table 5.7 필러 · Table 5.11 예열을 모두 지킨 WPS를 시험 없이 사전인정으로 봅니다(5.1, 5.5.1). A36은 Table 5.6 Group I·II 등재 강재이므로 PQR 없이 사전인정 WPS 한 장으로 발행됩니다. Annex J J2가 “J2 is sufficient for the purpose of documenting prequalified WPSs”라고 못 박고 있습니다.
2. **Group No.는 두께에 따라 달라집니다.**
   Table 5.6은 ASTM A36을 **Group I에 “≤ 3/4 in [20 mm]”**, **Group II에 “All thicknesses”** 로 두 번 싣습니다. 12 mm 개소만 다루면 Group I, 75 mm까지 한 장으로 덮으려면 두 Group을 함께 적어야 합니다.
3. **E71T-1C + 100 % CO₂ + DCEP + All 은 Table 5.7·5.5 안에 있습니다.**
   필러 분류의 끝문자 `C`가 CO₂를 뜻하므로 가스 변경(Ar 혼합, `M`)은 곧 분류·필수변수 변경입니다. 극성(DCEP)과 자세(All, 수직 상진)도 사전인정 범위입니다.
4. **CVN “No”이므로 입열량은 추가필수가 아닙니다.**
   입열량은 충격시험이 계약에 요구될 때만 재인정 대상입니다(Table 6.8 (10)). 그래도 시공 기록으로 계산해 두는 것이 좋습니다 — H = 60·E·I ÷ (1000·v).

---

## 3. 그대로 쓰기 전에 손볼 것 · 주의할 것

| # | 항목 | 내용 | 조치 |
|---|---|---|---|
| 1 | 표기 | “Semi-auto” | D1.1·AWS 표기는 **Semiautomatic**. 사내 서식 표기로 굳혔다면 유지해도 되지만, 감리 대조 시 통일 |
| 2 | 최소 각장 경계 | T≤6 → 3 mm, Table 7.7은 6 mm를 5 mm 구간으로 읽는 표기 | **정확히 6 mm 부재는 큰 값(5 mm) 적용**이 안전. 반복하중 구조는 5 mm(주 c) |
| 3 | 필러 수소 | `E71T-1C`에 확산성 수소 지시자(H4/H8 등) 없음 | 저수소 관리 대상 현장이면 **A5.20 지시자를 붙인 제품**으로 발주하고 WPS에도 함께 기재 |
| 4 | 루트 간격 | “0~5 mm”는 **최대 허용**값 | 관리 목표는 **0~2 mm**. 2 mm 초과분은 각장 증가(7.21.1), 5 mm 초과는 재조정 |
| 5 | 전류 범위 | 1.2Ø **120~300 A**는 매우 넓은 포락선 | 개소별 실제값을 WPS에 함께 적고, 변경은 Table 5.5 (22) ±10 % 안에서 |
| 6 | 자세 | Position **All** | 수직은 **상진 한정**(5.8.1.1). 하진·수직 하향은 불가 |
| 7 | 직각도 | ±10° | Figure 5.3 T-joint 범위. **100°(다이헤드럴)를 넘으면 skewed T**(5.4.3.2·5.4.3.3)로 별도 상세 필요 |
| 8 | 두께 상한 | “Fillet Welds < 75 mm” | 75 mm 이상은 7.21.1 예외(받침 사용 시 8 mm)와 예열 110 °C 구간 → **별도 WPS로 분리** 권장 |
| 9 | 바람 | 15~30 L/min | 야외 3~4 m/s 이상이면 **방풍 필수**. WPS에 방풍 조건을 각주로 추가 |

---

## 4. 앱 반영 결과 (v4 실습형)

- 강종 `SM275` → **`ASTM A36`** 로 전면 교체(대사·자막·음성 재합성 · faster-whisper 전사 확인).
- **20칸**의 정답·근거를 위 표 값으로 교체. 핵심 판정은 **사전인정(Clause 5, PQR 없음)**.
- 화면 머리말에 **`WPS-A36-F01` / `Supporting PQR(s) None (Prequalified)` / `CVN No` / `Clause 5 사전인정`** 표시.
- 자세 정답을 **`All (F·V·H·OH) · 수직 상진`** 으로 인정(단일 자세만 정답 처리하지 않음).
- 「이 값 넣기」 버튼을 전부 제거하고 **선택형(chips·select) / 직접 입력형(input)** 으로 분리.
  예열 온도·와이어 지름·전류·전압은 직접 입력이고, 와이어 지름·전류·전압은 **비필수**로 두어 어떤 유효값/범위든 감점 없이 통과.
- 입열량은 조건(29 V · 260 A · 300 mm/min)과 공식만 보여 주고, 수강생이 계산해 입력.
- 인물 통화 음성(p/s/f)을 제거하고 자막·말풍선 + 효과음(전화벨·성공 차임·파단·붕괴)으로 대체.
- 근거 팝오버는 문항 클릭으로 열고 더블클릭(모바일 더블탭)·×로 닫으며, 모바일에서는 화면 높이 약 46 % 이하로 제한.
