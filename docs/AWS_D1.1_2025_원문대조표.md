# AWS D1.1/D1.1M:2025 원문 대조표 — WPS작성 실습 (2차)

대조 대상: David님 Google Drive `AWS D1.1 2025.pdf` (646쪽, AWS D1.1/D1.1M:2025,
Approved by ANSI March 19, 2025, "Revises AWS D1.1/D1.1M:2020").
파일 ID `15vaNLAPc0d_G1eS4dbVraa_gX7yl76wI` → `downloads/AWS_D1.1_2025.pdf` (61.7 MB)로 내려받아
Clause 5·6·7 본문과 해당 표를 직접 확인했습니다. 아래 인용은 2025년판 원문 발췌입니다.

> 교육용 앱이므로 인물·회사·도면·PQR 번호와 일부 수치(SM275, 12 mm, PQR 기록값)는 가상 시나리오입니다.
> 조항·표 번호와 규정 문구는 2025년판을 그대로 따랐습니다.

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

## 2. 루트 간격 — 이전 화면의 오류를 바로잡음 (사용자 지적 “루트간격은 저거 맞아?”)

**이전 화면(잘못):** “원칙적으로 2 mm 이하, 2 mm 초과~5 mm는 각장 증가, 5 mm 초과 용접 불가.”

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

→ **2 mm는 “최대 허용치”가 아니라 “각장 보정이 시작되는 선”**입니다. 최대 허용은 3/16 in(5 mm)입니다.
앱은 현장 실측 1.5 mm를 기본값으로 두고, 정답 범위 0~2 mm, 해설에서 2~5 mm 보정 규칙을 설명합니다.

---

## 3. 18칸 — 원문 근거와 변수 분류

| 칸 | 원문 근거 | 분류 | 핵심 문구 |
|---|---|---|---|
| 이음 형식 | 5.4.3 · Figure 5.3 · Table 5.5 (19) | 필수 | “See Table 7.7 for minimum fillet weld sizes and Figure 5.3 for prequalified fillet weld joint details.” |
| 받침판·백가우징 | 5.4.1.2 · 5.4.3 | 필수 | CJP만 steel backing 요구 — 필렛은 대상 아님 |
| 루트 간격 | 7.21.1 | 비필수(제작 치수) | 위 2절 |
| 필렛 각장 | 7.13 · Table 7.7 | 필수 | “minimum … as shown in Table 7.7 … unless the design drawings specify welds of a larger size.” |
| 모재 규격 | 5.3 · Table 5.6 | 필수 | “Only base metals listed in Table 5.6 may be used in prequalified WPSs.” |
| 모재 Group | 5.3 · Table 5.6 · 6.2.1 | 필수(치명) | SM275(KS D 3515)는 Table 5.6 미등재 → 사전인정 불가 |
| 인정 두께 범위 | Table 6.2 · 6.11.1(3) | 필수 | 25 mm 이상 시험 → 3 mm~Unlimited, 필렛은 두께 무관 |
| 용접 공정 | 5.5.1 | 필수 | FCAW-G 사전인정 |
| 전류·극성 | Table 5.5 (13)(14) · Table 6.6 (12) | 필수(치명) | 극성 변경 = 재인정 |
| 와이어 Ø·전류·전압 | Table 5.5 (7)(22)(23) · Table 6.6 (11)(15) | 비필수(허용폭) | 사전인정 ±10 %/±15 %, PQR 재인정 10 %/7 % |
| 필러 분류 | 5.6 · Table 5.7 | 필수(치명) | E7XT-XC 등재, E70T-1C는 수직 부적합 |
| F-No./A-No. | Table 5.5 (5) | 비필수 | D1.1은 AWS A5.X 분류 사용 |
| 차폐가스 | 5.6.4 · Table 5.5 (17)(18) | 필수(치명) | C = 100 % CO₂, M = 혼합가스 |
| 자세·진행 | 5.8.1.1 · Table 6.1 | 필수(치명) | “progression … shall be upward” |
| 예열·층간 | 5.7.1 · Table 5.11 주 a | 필수(치명) | 모재 0 °C 미만 → 20 °C 예열, 층간 유지 |
| 입열량 | Table 6.8 (10) · 6.8.5 | **추가필수** | CVN 시에만 재인정 대상, H = 60·E·I ÷ v |
| PWHT | 5.9 · Table 5.5 (21) | 필수 | 도면·계약 요구 없으면 None |
| 인정 방식 | 5.1 · 6.2.1 | 필수(치명) | Clause 5 불충족 → Clause 6 시험 인정 |

### 보조 근거

- **Table 5.11 주 a**: “When the base metal temperature is below 32 °F [0 °C], the base metal shall be
  preheated to a minimum of 70 °F [20 °C] and the minimum interpass temperature shall be maintained
  during welding.” → 내일 07시 −3 °C 시나리오의 정답 20 °C.
- **테란/보온 조건**: 7.11·7.6 (Clause 7) — 주변 온도와 모재 온도 요구.
- **필렛 최소 각장**: Table 7.7 — 6 ≤ T < 12 mm → 5 mm, 12 ≤ T < 20 mm → 6 mm.
  본 시나리오 12 mm는 1/2 in 미만이므로 최소 5 mm, 도면 지시 6 mm가 이를 만족.
- **SWPS**: 6.2.1.2 “AWS B2.1-X-XXX Series on Standard Welding Procedure Specifications may, in
  this manner, be accepted for use in this code.” → SM275는 Table 5.6 미등재이므로
  “사전인정이 되는 SWPS 대상이 아니다”로 서술.

### 변수 분류 표기 기준(앱 범례)

- **필수(Essential)** — 바꾸면 새 WPS/재인정. Table 5.5 (1)~(21) 및 Table 6.6.
- **추가필수(Supplementary Essential)** — 충격시험(CVN)이 계약에 요구될 때만 재인정 대상. Table 6.8.
- **비필수(Nonessential)** — WPS에 적지만 허용폭 안에서 변경 가능. Table 5.5 (22)~(31).

> 참고: D1.1에서 전류·전압은 “필수변수 + 허용폭” 구조입니다(Table 5.5 (10)(11), (22)(23)).
> 앱은 사용자 요청대로 “비필수(허용폭 내 변경 가능)”로 표기하고, 팝오버에 Table 6.6의 재인정 기준
> (±10 %, ±7 %)을 함께 적어 두었습니다.

---

## 4. 음성·효과음 (audio/)

| 파일 | 내용 | 생성 |
|---|---|---|
| `bgm_terran.mp3` | 인더스트리얼 루프 40초(BPM 96, Em–C–G–D). 테란풍 분위기만 참고한 **오리지널** 작곡 | `tools/make_bgm.py` (numpy 합성: 킥·스네어·하이햇·디스토션 파워코드·서브베이스·브라스·패드·앤빌) |
| `n_call`, `n_summary`, `n_brief`, `n_wps`, `n_pass`, `n_fail`, `n_cause_*` | 아나운서 톤 내레이션·핵심 안내·사고 원인 요약 | `ko-KR-SunHiNeural`, `tools/make_audio.py` |
| `p00`~`p09` | 현장 시공팀장·이프로 통화 (전화기 대역 제한) | `ko-KR-InJoonNeural` / `ko-KR-HyunsuMultilingualNeural` + highpass·lowpass·compressor |
| `s01`~`s03` | 합격 다음 날 통화 | 상동 |
| `f01`, `f02` | 불합격 급박 대사 | 상동(속도 +12 %, 피치 +4 Hz) |
| `sfx_ring` | 전화벨(440+480 Hz, 1초 울림/2초 정지 ×3) | numpy 합성 |
| `sfx_crack` | 금속 파단 크랙 | numpy 합성 |
| `sfx_collapse` | 철골 붕괴 럼블·파편 4.6초 | numpy 합성 |
| `sfx_hangup` | 수화기 내려놓기 | numpy 합성 |

**발음·톤 검수**: 모든 대본은 숫자·약어를 한국어 발음으로 적고(`WPS`→“더블유 피 에스”, `PQR`→“피 큐 알”,
`SM275`→“에스엠 이칠오”, `CO₂`→“씨 오 투”, `AWS D1.1`→“에이더블유에스 디 원 점 원”), 앞뒤 무음을 제거한 뒤
페이드·톤 필터·loudnorm(-16 LUFS)을 적용했습니다. `tools/make_audio.py --verify`로 **faster-whisper(small-int8)
전사**와 파일별 선행 무음(0.02~0.03초)·피크(0.6~0.83)·RMS(0.13~0.16)를 확인했고, 전사문에서 WPS·PQR·SM275·
CO₂·AWS D1.1이 모두 정상 표기되는 것을 확인했습니다(전사 결과: `docs/audio_transcript.json`).

---

## 5. 앱 동작

- `[시작 →]` 클릭 → 배경음악 시작(0.15) → 아나운서 안내(음성 중 0.04로 덕킹) → 전화벨 → 통화 10줄 순차 재생.
- 상단 바: `BGM` 켜기/끄기, `소리 켜짐/꺼짐`(전체 음소거). 설정은 localStorage에 유지.
- 주황 점(규격 근거) 팝오버: 아이보리 규격서 카드(2025 판본·조항·쪽 표기 + 영문 원문 + 표 발췌) 아래에
  **한글 해석**과 **현장 의미**를 배치.
- 「이 값 넣기」: input·chip 모두 실제 반영, 작성 카운트·트레이(✓) 즉시 갱신.
- 팝오버는 칸 좌/우에 붙고, 좁은 화면에서는 제출 바 위 시트로 열립니다(제출 바를 가리지 않음).
- 불합격: 기둥 좌굴 → 보·브래킷 낙하 → 파단 스파크 → 화면 진동 → 먼지 → 잔해·붕괴 스탬프,
  크랙·붕괴 효과음과 급박 대사·원인 내레이션이 함께 재생됩니다.
