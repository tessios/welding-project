# AWS D1.1/D1.1M:2025 원문 대조표 — WPS작성 실습

대조 대상: David님 Google Drive `AWS D1.1 2025.pdf` (646쪽, AWS D1.1/D1.1M:2025,
Approved by ANSI March 19, 2025, "Revises AWS D1.1/D1.1M:2020").
파일 ID `15vaNLAPc0d_G1eS4dbVraa_gX7yl76wI` → `downloads/AWS_D1.1_2025.pdf` (61.7 MB)로 내려받아
Clause 5·6·7 본문, 해당 표, **Annex J(Informative) 샘플 양식**을 직접 확인했습니다. 아래 인용은 2025년판 원문 발췌입니다.

> 교육용 앱이므로 인물·회사·도면·WPS 번호와 12 mm 두께 등 일부 수치는 익명·가상입니다.
> 조항·표 번호와 규정 문구는 2025년판을 그대로 따랐고, **강종·설계 값은 A36 필렛 WPS 작성 사례와 대조해 옮겼습니다**
> (→ `AnnexJ_사전인정_검토메모.md`).

---

## 1. 판본 번호가 바뀐 참조 (이전 화면 → 2025 원문)

| 이전 화면 표기 | 2025 원문 | 확인한 내용 |
|---|---|---|
| Table 5.3 (모재) | **Table 5.6** | Approved Base Metals for Prequalified WPSs — Group I~V, ASTM·API 강종만 등재 |
| Table 5.4 (필러) | **Table 5.7** | Filler Metals for Matching Strength — FCAW: E7XT-X / E7XT-XC / E7XT-XM |
| Table 5.8 (예열) | **Table 5.11** | Prequalified Minimum Preheat and Interpass Temperature |
| Table 6.1 (자세) | 유지 | WPS Qualification — Production Welding Positions Qualified by Plate Tests |
| Table 6.2 (두께) | 유지 | CJP Groove Welds: Range of Thickness Qualified |
| Table 7.7 (최소 각장) | 유지 | Minimum Fillet Weld Sizes |
| Table 5.1 (FCAW 변수) | **Table 5.5** | Essential Variables for Prequalified WPSs (1)~(31) |
| — | **Annex J · J2** | 사전인정 WPS 기록 요건. J2 — “J2 is sufficient for the purpose of documenting prequalified WPSs.” |

2025년판 Clause 5 구성(5.1 Scope ~ 5.9 PWHT):

- 5.2 General WPS Requirements — Table 5.1(SMAW)·5.2(SAW)·5.3(GMAW)·5.4(FCAW/GMAW metal cored)·5.5(필수변수)
- 5.3 Base Metal — **Table 5.6**
- 5.4 Weld Joints — Figure 5.1(CJP)·5.2(PJP)·5.3(필렛)·5.4·5.5(skewed T)
- 5.5 Welding Processes — 5.5.1 사전인정 공정
- 5.6 Filler Metal and Shielding Gas — **Table 5.7**, 5.6.4 Shielding Gas
- 5.7 Preheat — **Table 5.11**
- 5.8 WPS Requirements — 5.8.1.1 수직 상진
- 5.9 Postweld Heat Treatment

---

## 2. A36의 위치 — Table 5.6에 두 번 나온다

**Table 5.6 (p.73–75) 발췌**

| Group | Steel Specification | 비고 |
|---|---|---|
| **I** | ASTM A36 | **≤ 3/4 in [20 mm]** · Fy 36 ksi [250 MPa] |
| **II** | ASTM A36 | **All thicknesses** |

즉 12 mm A36은 Group I, 20 mm를 넘는 A36은 Group II입니다. 사내 A36 필렛 WPS가 Group No.를
**“I, II”** 로 적는 이유가 이것이며(75 mm까지 한 장으로 덮기 위해), 12 mm 개소만 다룰 때는 Group I로 충분합니다.

---

## 3. 루트 간격 — “2 mm”는 최대치가 아니라 보정 시작선

**2025 원문 7.21.1 Fillet Weld Assembly (p.204):**

> The parts to be joined by fillet welds shall be brought into as close contact as practicable.
> The root opening shall not exceed 3/16 in [5 mm] except in cases involving either shapes or
> plates 3 in [75 mm] or greater in thickness … In such cases, a maximum root opening of
> 5/16 in [8 mm] may be used, provided suitable backing is used. … **If the separation is greater
> than 1/16 in [2 mm], the legs of the fillet weld shall be increased by the amount of the root
> opening**, or the Contractor shall demonstrate that the required effective throat has been obtained.

Commentary C-7.21.1 (p.562): “Any gap 1/16 in [2 mm] or greater in size requires an increase in
size of fillet by the amount of separation.”

**정리(앱에 반영):**

| 실측 간격 | 판정 | 조치 |
|---|---|---|
| 0 ~ 2 mm | 밀착 관리 범위 | 각장 보정 없음 |
| 2 mm 초과 ~ 5 mm | 허용 | 초과량만큼 각장 증가(6 → 8 mm 등) |
| 5 mm 초과 | 용접 불가 | 이음 재조정(후판 75 mm 이상은 받침 사용 시 8 mm까지) |

사전인정 필렛 WPS의 Sketch도 **As detailed R = 0 (+2/−0), As fit-up max 5** 로 같은 구조입니다.
앱은 현장 실측 1.5 mm를 기본값으로 두고, 정답 범위 0~2 mm, 해설에서 2~5 mm 보정 규칙을 설명합니다.

---

## 4. 20칸 — 원문 근거와 변수 분류

| 칸 | 원문 근거 | 분류 | 핵심 문구 / 앱 정답 |
|---|---|---|---|
| 이음 형식 | 5.4.3 · Figure 5.3 · Table 5.5 (19) | 필수 | 필렛 상세(Figure 5.3) · **Fillet weld (T, Corner joint)**, TC-F12-GF, ±10° |
| 받침판·백가우징 | 5.4.1.2 · 5.4.3 | 필수 | CJP만 steel backing 요구 — 필렛은 대상 아님 · **None / None** |
| 루트 간격 | 7.21.1 | 비필수(제작 치수) | 위 3절 · 실측 1.5 mm (관리 0~2 mm) |
| 필렛 각장 | 7.13 · Table 7.7 | 필수 | “minimum … as shown in Table 7.7 … unless the design drawings specify welds of a larger size.” · **6 mm** |
| 모재 규격 | 5.3 · Table 5.6 | 필수 | “Only base metals listed in Table 5.6 may be used in prequalified WPSs.” · **ASTM A36 or Equivalent** |
| 모재 Group | 5.3 · Table 5.6 | 필수(치명) | A36 = Group I(≤20 mm) / Group II(전 두께) · **Group I** |
| 인정 두께 범위 | Annex J J2 · Table 5.6 · 7.21.1 | 필수 | **Fillet Welds < 75 mm** (사내 관리 상한) |
| 용접 공정 | 5.5.1 | 필수 | FCAW 사전인정 · **FCAW (Semi-auto)** |
| 전류·극성 | Table 5.5 (13)(14) · Table 6.6 (12) | 필수(치명) | 극성 변경 = 재인정 · **DC · DCEP** |
| 와이어 Ø / 전류 / 전압 | Table 5.5 (7)(10)(11)(22)(23) | 비필수(허용폭) | 세 칸 모두 **직접 입력** · 어떤 유효값/범위든 통과 · 참고 1.2Ø 120–300 A · 28–30 V |
| 필러 분류 | 5.6 · Table 5.7 | 필수(치명) | E7XT-XC 등재, E70T-1C는 수직 부적합 · **E71T-1C (A5.20)** |
| F-No./A-No. | Table 5.5 (5) | 비필수 | D1.1은 AWS A5.X 분류 사용 · 참고 F-6 / A-1 또는 N/A |
| 차폐가스 | 5.6.4 · Table 5.5 (17)(18) | 필수(치명) | C = 100 % CO₂ · **100 % CO₂ · 15–30 L/min · Nozzle #4** |
| 자세·진행 | 5.8.1.1 · Table 5.5 (2) | 필수(치명) | “progression … shall be upward” · **All · 수직 상진** |
| 예열 온도 | 5.7.1 · Table 5.11 주 a | 필수(치명) | 모재 0 °C 미만 → 20 °C 예열, 층간 유지 · **직접 입력 20 °C** |
| 입열량 | Table 6.8 (10) · 6.8.5 | **추가필수** | CVN 시에만 재인정 대상, H = 60·E·I ÷ v · **1.51 kJ/mm** |
| PWHT | 5.9 · Table 5.5 (21) | 필수 | 도면·계약 요구 없으면 None · **없음 (None)** |
| 인정 방식 | 5.1 · 6.2.1 · Annex J J2 | 필수 | Table 5.6 등재 → 시험 면제 · **Prequalified (Clause 5) — PQR 없음** |

### 보조 근거

- **Table 5.11 주 a**: “When the base metal temperature is below 32 °F [0 °C], the base metal shall be
  preheated to a minimum of 70 °F [20 °C] and the minimum interpass temperature shall be maintained
  during welding.” → 내일 07시 −3 °C 시나리오의 정답 20 °C.
- **Table 5.11 Category B(저수소 공정 · FCAW)**: 3~20 mm **0 °C** / 20~38 mm **10 °C** / 38~65 mm **65 °C** /
  65 mm 초과 **110 °C**. 사내 A36 필렛 WPS의 예열 기재값과 일치.
- **최소 각장**: Table 7.7 — T<6 mm 3 mm(반복하중 5 mm), 6~12 mm 5 mm, 12~20 mm 6 mm, 20 mm 초과 8 mm.
  본 시나리오 12 mm는 6 mm 구간이므로 도면 지시 6 mm가 최소치를 만족. (7.13: 도면이 더 큰 값을 지시하면 도면을 따름)
- **수직 상진**: 5.8.1.1 — “The progression for all passes in vertical position welding shall be upward …”
  All 자세를 적어도 수직에서는 상진만 인정됩니다.
- **SWPS**: 6.2.1.2 “AWS B2.1-X-XXX Series on Standard Welding Procedure Specifications may, in
  this manner, be accepted for use in this code.” — A36은 사전인정이 가능하므로 SWPS 구매는 필수가 아닙니다.

### 변수 분류 표기 기준(앱 범례)

- **필수(Essential)** — 바꾸면 새 WPS/재인정. Table 5.5 (1)~(21) 및 Table 6.6.
- **추가필수(Supplementary Essential)** — 충격시험(CVN)이 계약에 요구될 때만 재인정 대상. Table 6.8.
- **비필수(Nonessential)** — WPS에 적지만 허용폭 안에서 변경 가능. Table 5.5 (22)~(31).

> 참고: D1.1에서 전류·전압은 “필수변수 + 허용폭” 구조입니다(Table 5.5 (10)(11), (22)(23)).
> 앱은 “비필수(허용폭 내 변경 가능)”로 표기하고, 팝오버에 허용폭(전류 ±10 %, 전압 ±15 %)을 함께 적어 두었습니다.

---

## 5. 음성·효과음 (audio/)

| 파일 | 내용 | 생성 |
|---|---|---|
| `bgm_terran.mp3` | 인더스트리얼 루프 40초(BPM 96, Em–C–G–D). 테란풍 분위기만 참고한 **오리지널** 작곡 | `tools/make_bgm.py` (numpy 합성) |
| `n_call`, `n_summary`, `n_brief`, `n_wps`, `n_pass`, `n_end_pass`, `n_fail`, `n_end_fail`, `n_cause_*` | 아나운서 톤 내레이션·핵심 안내·사고 원인·엔딩 정리 | `ko-KR-SunHiNeural`, `tools/make_audio.py` |
| — | 인물 통화 음성(p/s/f)은 **전부 제거** — 대화는 화면 자막·말풍선으로만 진행 | — |
| `sfx_ring` | 전화벨(440+480 Hz, 1초 울림/2초 정지 ×3) | numpy 합성 |
| `sfx_crack` | 금속 파단 크랙 | numpy 합성 |
| `sfx_collapse` | 철골 붕괴 럼블·파편 4.6초 | numpy 합성 |
| `sfx_hangup` | 수화기 내려놓기 | numpy 합성 |
| `sfx_success` | 합격 차임(두 음 상승 + 금속 잔향 1.9초) | numpy 합성 |

**발음·톤 검수**: 모든 대본은 숫자·약어를 한국어 발음으로 적고(`WPS`→“더블유 피 에스”, `PQR`→“피 큐 알”,
`ASTM A36`→“에이에스티엠 에이 삼십육”, `CO₂`→“씨 오 투”, `AWS D1.1`→“에이더블유에스 디 원 점 원”), 앞뒤 무음을 제거한 뒤
페이드·톤 필터·loudnorm(-16 LUFS)을 적용했습니다.

2026-11-18 4차 개편에서 아나운서 대본 13개를 새로 합성하고 **faster-whisper small-int8**(CPU 1스레드, `CT2_USE_MKL=0`)로
전수 전사해 문장 일치율(`match`)을 함께 남겼습니다(→ `docs/audio_transcript.json`). 13개 중 10개가 0.92 이상,
나머지 3개(n_brief 0.81 · n_wps 0.84 · n_summary 0.85)는 ‘웨브·브래킷·A36’ 같은 고유명사를 전사기가 다르게 받아쓴 차이입니다.

---

## 6. 앱 동작

- `[시작 →]` 클릭 → 배경음악 시작(0.15) → 전화벨 + 아나운서 안내(음성 중 0.04로 덕킹) → 통화 10줄이 자막으로 순차 표시.
- 상단 바: `BGM` 켜기/끄기, `소리 켜짐/꺼짐`(전체 음소거). 설정은 localStorage에 유지.
- 주황 점(규격 근거) 팝오버: 아이보리 규격서 카드(2025 판본·조항·쪽 표기 + 영문 원문 + 표 발췌) 아래에
  **한글 해석**과 **현장 의미**를 배치.
- WPS 화면 머리말: `WPS-A36-F01` · **Supporting PQR(s) None (Prequalified)** · **CVN No** · **Clause 5 사전인정**.
- 선택형(chips 14칸·select 3칸)과 직접 입력형(input 3칸+수치 3칸)으로만 구성 — 값을 대신 넣어 주는 버튼은 없습니다.
- 근거는 **문항 카드/라벨을 누르면** 열리고, **더블클릭(모바일 더블탭)·× 버튼**으로 닫힙니다. 입력·선택 조작 중에는 열리지 않습니다.
- 모바일(390×844)에서는 근거가 화면 높이의 약 46 % 이하 컴팩트 시트로 열리고 내부 스크롤되며, 제출 바를 가리지 않습니다.
- 불합격: 기둥 좌굴 → 보·브래킷 낙하 → 파단 스파크 → 화면 진동 → 먼지 → 잔해·붕괴 스탬프,
  크랙·붕괴 효과음과 원인·엔딩 내레이션이 함께 재생됩니다(인물 음성 없음).
