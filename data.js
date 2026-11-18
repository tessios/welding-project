/* =========================================================================
   WPS 실습실 — AWS D1.1 · Carbon Steel  (교육용 데이터)
   모든 수치는 교육 목적의 대표값입니다. 실제 제작에는 해당 판본 원문을 적용하세요.
   ========================================================================= */

const APP = {
  title: 'WPS 실습실',
  subtitle: 'AWS D1.1 · Carbon Steel',
  edition: 'AWS D1.1/D1.1M:2020 기준(2025 개정 번호는 병기)',
  watermark: '교육용 — 실제 제작에 사용 금지',
  version: 'v1.0'
};

/* ---------------------------------------------------------------- 1. 코드 사전 */
const GLOSSARY = [
  {
    id: 'g5-6', key: 'Clause 5 / Clause 6', label: '5', title: '사전인정(Clause 5) vs 시험인정(Clause 6)',
    summary: 'Clause 5는 코드가 미리 인정한 조건만 지키면 PQR 없이 WPS를 쓸 수 있고, Clause 6은 시험편으로 인정받는 경로입니다.',
    body: '사전인정 WPS는 모재(Table 5.3)·이음상세(Figure 5.1~5.3)·공정(Table 5.1~5.4)·용가재·예열(Table 5.8)이 모두 코드 범위 안에 있어야 성립합니다. 하나라도 벗어나면 Clause 6으로 시험인정을 받아 PQR을 만들어야 합니다.',
    tag: 'D1.1 5.1, 5.2 / 6.1'
  },
  {
    id: 'g53', key: 'Table 5.3', label: '5.3', title: '승인 모재와 Group I~IV',
    summary: '사전인정 WPS에 쓸 수 있는 강재 목록입니다. 같은 Group 안에서만 추가 시험 없이 모재를 바꿀 수 있습니다.',
    body: 'Group I은 Fy 36 ksi급(예: A36 3/4" 이하, A53 Gr.B), Group II는 50 ksi급(A992, A572 Gr.50, A36 3/4" 초과, A588), Group III는 A572 Gr.60·65, Group IV는 A709 Gr.70W·A852 같은 담금질·뜨임강입니다. A514처럼 목록에 없는 강재는 Clause 6 시험인정 대상입니다. (2025 Edition은 Table 5.6, Group V=A913 Gr.80 신설)',
    tag: 'D1.1 Table 5.3 (2020) / 5.6 (2025)'
  },
  {
    id: 'g58', key: 'Table 5.8', label: '5.8', title: '최소 예열·층간온도',
    summary: '강재 범주(A~D)와 최후 부재 두께로 최소 예열·최소 층간온도를 정합니다. 두 값은 같습니다.',
    body: '범주 A는 비저수소 SMAW(E6010·E6011·E6013), B는 저수소 용접(E7018·FCAW·GMAW·SAW)을 쓰는 일반 구조강, C는 60~70 ksi급, D는 H8 이하 용착금속을 쓰는 제한 강재입니다. 32°F(0°C) 표기는 “강재가 빙점 이상이면 별도 가열 불필요”이며, 빙점 아래에서는 70°F(20°C)까지 예열해 유지합니다. (2025 Edition은 Table 5.11, 범주 E~G 추가)',
    tag: 'D1.1 5.7, Table 5.8 (2020) / 5.11 (2025)'
  },
  {
    id: 'g52', key: 'Table 5.2', label: '5.2', title: '사전인정 WPS의 필수변수',
    summary: '사전인정 WPS에서 지켜야 하는 필수변수 목록입니다. 시험인정 WPS의 필수변수(Table 6.6)와 번호가 다릅니다.',
    body: '사전인정 경로에서는 이 표의 항목이 코드 한계를 벗어나면 사전인정이 깨져 Clause 6 시험인정으로 넘어갑니다. 시험인정 경로의 변경 판정은 Table 6.6(필수)과 Table 6.7(충격시험 보충)으로 합니다. (2025 Edition은 Table 5.5)',
    tag: 'D1.1 Table 5.2 (2020) / 5.5 (2025)'
  },
  {
    id: 'g61', key: 'Table 6.1', label: '6.1', title: '평판 시험 자세 인정 범위',
    summary: '시험한 자세가 생산에서 어느 자세까지 인정되는지 정합니다. 1G 시험은 아래보기(F)만 인정합니다.',
    body: '1G→F, 2G→F·H, 3G→F·V, 4G→F·OH, 3G+4G 또는 2G+3G+4G→전 자세입니다. 필렛은 1F~4F로 따로 시험합니다.',
    tag: 'D1.1 Table 6.1 (2020)'
  },
  {
    id: 'g62', key: 'Table 6.2', label: '6.2', title: 'CJP 그루브 시험의 인정 두께',
    summary: '시험편 두께 T로 생산 모재 두께 범위가 정해집니다. 1"(25 mm) 이상으로 시험하면 두께 제한이 없어집니다.',
    body: 'T가 3~10 mm 또는 10~25 mm 구간이면 인정 두께는 최소 1/8"(3 mm)에서 최대 2T입니다. T가 25 mm 이상이면 최소 3 mm에서 무제한입니다. 백가우징 없이 시험한 스퀘어 그루브는 최대 두께가 시험 두께로 제한됩니다.',
    tag: 'D1.1 Table 6.2 (2020)'
  },
  {
    id: 'g66', key: 'Table 6.6', label: '6.6', title: 'PQR 필수변수 변경(재인정)',
    summary: '공정·모재 Group·용가재 분류·F-No.·자세·그루브 형상·백킹 삭제·전류 종류/극성·입열량 같은 변경은 새 PQR이 필요합니다.',
    body: '필수변수는 강도·연성에 영향을 주는 값입니다. 번호를 헷갈리기 쉬운데, D1.1에서 Table 6.1은 자세 인정표이고 Table 6.6이 재인정이 필요한 필수변수 표입니다. 충격시험(CVN)이 요구되는 공사에서는 Table 6.7의 보충 필수변수가 더해져 입열량·층간온도·패스 방식까지 재인정 사유가 됩니다.',
    tag: 'D1.1 6.8, Table 6.6 / 6.7'
  },
  {
    id: 'g59', key: '5.9', label: '5.9', title: '용접후열처리(PWHT)',
    summary: 'D1.1은 원칙적으로 PWHT를 요구하지 않습니다. 계약·설계가 요구하면 열처리 조건을 절차에 넣고 인정받아야 합니다.',
    body: 'PWHT 여부·조건은 필수변수입니다. 한 번 “없음”으로 인정받은 절차에 PWHT를 넣거나, 반대로 PWHT 절차에서 빼면 재인정 대상입니다.',
    tag: 'D1.1 5.9, 6.8'
  },
  {
    id: 'gfno', key: 'F-Number', label: 'F', title: 'F-No. — 용접 난이도 분류',
    summary: 'F-1 고산화철, F-2 티타니아, F-3 셀룰로오스, F-4 저수소 피복봉, F-5 오스테나이트/듀플렉스, F-6 솔리드·플럭스코어드 와이어.',
    body: 'F-No.가 바뀌면 필수변수입니다. 같은 F-No. 안에서의 분류 변경(예: E7016→E7018, 둘 다 F4)은 WPS 개정으로 처리됩니다. 강도 수준이 올라가는 변경은 F-No.가 같아도 재인정 대상입니다.',
    tag: 'D1.1 Table 6.6, AWS A5.x'
  },
  {
    id: 'gano', key: 'A-Number', label: 'A', title: 'A-No. — 용착금속 화학성분 분류',
    summary: 'A-1 탄소강, A-2 0.5Mo, A-3~A-5 Cr-Mo, A-6 마르텐사이트, A-7 페라이트, A-8·A-9 Cr-Ni, A-10 Ni, A-11·A-12 Mn·Ni계.',
    body: '탄소강 구조물 실습에서는 대부분 A-1입니다. A-No.가 달라지면 용착금속 성분이 달라지므로 필수변수로 취급합니다.',
    tag: 'D1.1, AWS A5.x'
  },
  {
    id: 'gjoint', key: 'Figure 5.1', label: '5.1F', title: '사전인정 이음상세 표기법',
    summary: 'B=맞대기, T=T이음, C=코너, TC=T/코너. 뒤의 U·L·P는 두께 제한 없음·제한 있음·부분용입을 뜻하고, 끝의 -S는 영구 철제 백킹, -GF는 백가우징 후 이면 용접입니다.',
    body: '예: B-U2a-S는 맞대기(B)·두께무제한(U)·상세 2a·철제 백킹 유지(S)입니다. 상세 치수(개선각·루트 개구부)가 Figure의 허용 범위를 벗어나면 사전인정이 아닙니다. 도면·WPS에는 “single-V groove”가 아니라 이 상세 기호를 적어야 합니다.',
    tag: 'D1.1 Figure 5.1~5.3'
  },
  {
    id: 'ghi', key: '입열량', label: 'H', title: '입열량(Heat Input)',
    summary: 'H = (전압 × 전류 × 60) ÷ 이동속도. 단위를 mm·kJ로 맞추면 kJ/mm입니다.',
    body: '예: 26 V × 240 A × 60 ÷ 300 mm/min = 1.25 kJ/mm. 충격시험이 요구되는 공사에서는 인정받은 입열량보다 커지는 변경이 재인정 사유가 됩니다(Table 6.7).',
    tag: 'D1.1 6.8, Table 6.7'
  },
  {
    id: 'gback', key: 'Backing', label: 'BK', title: '백킹(받침)과 백가우징',
    summary: '백킹은 루트 용락을 막는 받침입니다. 백킹을 “빼는” 변경은 재인정, “더하는” 변경은 재인정 사유가 아닙니다.',
    body: '철제 백킹은 모재와 같은 Group을 쓰고 용접 후 제거하지 않는 것이 원칙입니다(제거는 도면이 허용할 때만). 이면 완전용입을 위해 백가우징으로 이면을 파내는 절차는 -GF 계열 상세로 표기합니다.',
    tag: 'D1.1 5.4, Table 6.6'
  },
  {
    id: 'gpos', key: 'Position', label: 'G', title: '자세 1G~4G / 1F~4F',
    summary: '그루브는 1G 아래보기, 2G 수평, 3G 수직, 4G 위보기. 필렛은 1F~4F입니다.',
    body: '수직 자세에서 상진↔하진의 변경은 필수변수입니다. 현장 WPS에는 시험으로 인정받은 자세만 적을 수 있고, 도면이 요구하는 자세가 인정 범위 밖이면 추가 시험이 필요합니다.',
    tag: 'D1.1 Table 6.1, 6.8'
  },
  {
    id: 'gcvn', key: 'CVN', label: 'CVN', title: '충격시험(CVN) 요구 공사',
    summary: '충격시험이 요구되면 Table 6.7의 보충 필수변수가 함께 적용됩니다.',
    body: '입열량 상한, 층간온도 상한, 단층↔다층, 패스당 두께 같은 항목이 이때 재인정 사유가 됩니다. 같은 변경이라도 CVN 요구가 없으면 WPS 개정으로 끝나는 경우가 많습니다.',
    tag: 'D1.1 Table 6.7'
  },
  {
    id: 'gwpq', key: 'WPQ', label: 'W', title: '용접사 자격(WPQ)과 WPS의 구분',
    summary: 'WPS는 “절차”의 자격이고 WPQ는 “사람”의 자격입니다. WPS가 허용해도 용접사가 그 자세·두께를 인정받지 못하면 용접할 수 없습니다.',
    body: '예를 들어 WPS가 전 자세를 허용해도 1G로 시험한 용접사는 아래보기만 용접할 수 있습니다. 절차 변수와 용접사 변수를 섞으면 현장에서 그대로 사고가 됩니다.',
    tag: 'D1.1 6.12'
  },
  {
    id: 'gpre', key: '예열', label: 'PH', title: '예열과 층간온도',
    summary: '예열은 첫 아크 전 모재 온도, 층간온도는 패스 사이에 식어도 유지해야 하는 하한(및 상한)입니다.',
    body: '예열은 저온균열·경화조직·수소 유입을 막습니다. 측정은 용접부에서 가장 두꺼운 부재 두께만큼, 최소 75 mm 떨어진 곳까지 여러 방향에서 합니다. Table 5.8 값보다 낮추는 변경은 재인정 대상입니다.',
    tag: 'D1.1 5.7, 7.6'
  },
  {
    id: 'gveil', key: '교육용', label: '!', title: '이 앱의 성격',
    summary: '강의 실습용입니다. 여기 나오는 WPS·PQR·과제서는 모두 가상 문서이고, 수치는 원문 대조 전 교육용 대표값입니다.',
    body: '실제 제작·검사에는 계약에서 지정한 판본의 AWS D1.1 원문과 발주처 시방서를 적용해야 합니다. 화면의 모든 판정은 “왜 그런지 읽는 법”을 익히기 위한 것입니다.',
    tag: '—'
  }
];

/* ---------------------------------------------------------------- 2. 참조 데이터 */
const PREHEAT = {
  bands: ['≤ 20 mm (3/4")', '20 ~ 38 mm (3/4"~1½")', '38 ~ 65 mm (1½"~2½")', '> 65 mm (2½" 초과)'],
  cats: {
    A: { name: 'A · 비저수소 SMAW', c: [0, 65, 110, 150], f: [32, 150, 225, 300] },
    B: { name: 'B · 저수소 용접', c: [0, 10, 65, 110], f: [32, 50, 150, 225] },
    C: { name: 'C · 60~70 ksi급', c: [10, 65, 110, 150], f: [50, 150, 225, 300] },
    D: { name: 'D · H8 이하 용착금속', c: [0, 0, 0, 0], f: [32, 32, 32, 32] }
  },
  note: '32°F(0°C)는 “강재가 빙점 이상이면 별도 가열 불필요”를 뜻합니다. 빙점 아래에서는 70°F(20°C)까지 예열해 용접 중 유지합니다. Table 5.8(2020) / Table 5.11(2025)'
};

const BASE_METALS = [
  { spec: 'ASTM A36', grade: 'Gr.36', group: 'I (t ≤ 3/4") / II (t > 3/4")', cat: 'B', fy: '250 MPa (36 ksi)' },
  { spec: 'ASTM A572', grade: 'Gr.42', group: 'II', cat: 'B', fy: '290 MPa (42 ksi)' },
  { spec: 'ASTM A572', grade: 'Gr.50', group: 'II', cat: 'B', fy: '345 MPa (50 ksi)' },
  { spec: 'ASTM A992', grade: 'Gr.50', group: 'II', cat: 'B', fy: '345 MPa (50 ksi)' },
  { spec: 'ASTM A588', grade: 'Gr.A/B', group: 'II', cat: 'B', fy: '345 MPa (50 ksi)' },
  { spec: 'ASTM A709', grade: 'Gr.50W', group: 'II', cat: 'B', fy: '345 MPa (50 ksi)' },
  { spec: 'ASTM A572', grade: 'Gr.60', group: 'III', cat: 'C', fy: '415 MPa (60 ksi)' },
  { spec: 'ASTM A572', grade: 'Gr.65', group: 'III', cat: 'C', fy: '450 MPa (65 ksi)' },
  { spec: 'ASTM A709', grade: 'Gr.70W', group: 'IV', cat: 'C', fy: '485 MPa (70 ksi)' },
  { spec: 'ASTM A514', grade: 'Gr.B', group: '목록 없음', cat: '-', fy: '690 MPa (100 ksi)', blocked: '사전인정 대상이 아닙니다. Table 6.9 계열 강재로 Clause 6 시험인정이 필요합니다.' }
];

const FILLERS = [
  { class: 'E6010', process: 'SMAW', f: 3, a: 1, strength: '60 ksi', lowH: false, spec: 'A5.1', note: '셀룰로오스계. 루트 전용, 비저수소' },
  { class: 'E6011', process: 'SMAW', f: 3, a: 1, strength: '60 ksi', lowH: false, spec: 'A5.1', note: '셀룰로오스계. 교류 사용 가능' },
  { class: 'E7016', process: 'SMAW', f: 4, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.1', note: '저수소. DCEP' },
  { class: 'E7018', process: 'SMAW', f: 4, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.1', note: '저수소. 구조물 표준. 보관·건조 관리' },
  { class: 'ER70S-6', process: 'GMAW', f: 6, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.18', note: '솔리드 와이어. CO2/혼합가스' },
  { class: 'ER70S-3', process: 'GMAW', f: 6, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.18', note: '솔리드 와이어. 청정 모재용' },
  { class: 'E71T-1', process: 'FCAW', f: 6, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.20', note: '가스 차폐 플럭스코어드(CO2). 가장 흔한 구조용' },
  { class: 'E71T-8', process: 'FCAW', f: 6, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.20', note: '자기 차폐(가스 불필요). 차폐 방식이 다름' },
  { class: 'ER70S-6 (GMAW-S 제외)', process: 'GMAW', f: 6, a: 1, strength: '70 ksi', lowH: true, spec: 'A5.18', note: '단락이행(GMAW-S)은 사전인정 대상 아님' }
];

const POSITIONS = [
  { test: '1G', kr: '아래보기(Flat)', qualifies: 'F' },
  { test: '2G', kr: '수평(Horizontal)', qualifies: 'F · H' },
  { test: '3G', kr: '수직(Vertical)', qualifies: 'F · V' },
  { test: '4G', kr: '위보기(Overhead)', qualifies: 'F · OH' },
  { test: '3G + 4G', kr: '수직 + 위보기', qualifies: 'F · V · OH (전 자세)' },
  { test: '2G + 3G + 4G', kr: '세 자세 시험', qualifies: '전 자세(All)' }
];

const THICKNESS_RULE = {
  rows: [
    { t: '3 ~ 10 mm (1/8"~3/8")', q: '3 mm ~ 2T' },
    { t: '10 ~ 25 mm (3/8"~1")', q: '3 mm ~ 2T' },
    { t: '25 mm (1") 이상', q: '3 mm ~ 무제한' }
  ],
  calc: function (T) {
    if (!(T > 0)) return null;
    if (T >= 25) return { min: 3, max: Infinity, label: '3 mm ~ 무제한' };
    return { min: 3, max: Math.round(2 * T * 10) / 10, label: '3 mm ~ ' + Math.round(2 * T * 10) / 10 + ' mm (2T)' };
  }
};

/* ---------------------------------------------------------------- 3. 독도용 WPS */
const WPS = {
  no: 'ED-WPS-001', rev: '0', date: '2026-01-05', page: '1 / 1',
  project: '가온 물류센터 신축 (가상)',
  code: 'AWS D1.1/D1.1M:2020',
  route: 'Clause 6 — 시험인정 (Qualified by Testing)',
  pqr: 'ED-PQR-001',
  processes: 'FCAW-G (플럭스코어드 가스차폐) · 반자동',
  joint: 'B-U2a-S · CJP single-V 45° · R 6 mm · Root Face 2 mm · 철제 백킹 6 × 25 mm',
  base: 'ASTM A992 Gr.50 (Group II) to A992 Gr.50 (Group II)',
  baseT: '3 ~ 32 mm',
  filler: 'E71T-1 (A5.20) · F6 / A1 · Ø1.2 mm',
  position: '1G (아래보기) — 상진/하진 해당 없음',
  pwht: '없음 (계약 요구 없음)',
  preheat: '최소 10 °C · 최대 층간 230 °C',
  gas: 'CO2 100 % · 15 ~ 25 L/min',
  elec: 'DCEP · 180~260 A / 22~28 V · CTWD 15~20 mm · 25~35 cm/min',
  tech: '다층 다패스 · 스트링거/위빙(≤ 15 mm) · 패스간 슬래그 제거 · 백가우징 없음 · 피닝 금지',
  hdr: '가온스틸(가상) — 제작: 용접기술자(서명) / 검토: 품질검토자(서명) / 승인: 품질책임자(서명)',
  remark: '1. 본 WPS는 교육용 가상 문서이며 실제 제작에 사용할 수 없습니다.\n2. 충격시험(CVN)이 요구되는 부재에는 이 WPS를 적용하지 않습니다.\n3. 3G·4G 자세는 이 WPS 인정 범위 밖입니다(별도 인정 필요).'
};

const POINTS = [
  {
    n: 1, name: '적용 규격 · 문서 정보', short: '적용규격',
    value: 'AWS D1.1/D1.1M:2020 · Clause 6 시험인정 · 지원 PQR ED-PQR-001',
    clause: 'D1.1 5.1, 5.2 / 6.1', clauseKey: 'g5-6',
    badge: 'base', badgeText: '공통',
    meaning: 'WPS를 읽을 때 가장 먼저 보는 것은 “어느 코드의, 어느 인정 경로로 만든 문서인가”입니다. 사전인정(Clause 5)이면 PQR이 없고, 시험인정(Clause 6)이면 반드시 지원 PQR이 있습니다.',
    logic: '이 WPS는 모재·이음·공정이 Clause 5 사전인정 조건을 그대로 만족하지 않아 Clause 6 시험인정으로 작성됐습니다. 그래서 문서 어디에나 PQR 번호가 따라붙고, 인정 범위도 PQR이 정합니다.',
    field: 'Sec.I·B31.1 같은 제작 코드가 따로 있는 압력용기·배관과 달리, 철골은 AWS D1.1 하나가 설계·제작·검사를 함께 규정합니다. 발주처 시방이 D1.1보다 엄격하면 그쪽이 우선입니다.',
    quiz: { q: '이 WPS에 PQR 번호가 있다는 것은 무엇을 뜻하나?', a: ['Clause 5 사전인정만으로 작성됐다', 'Clause 6 시험인정으로 작성됐다'], correct: 1, why: '사전인정 WPS는 PQR을 요구하지 않습니다. PQR이 적혀 있으면 시험인정 경로입니다.' }
  },
  {
    n: 2, name: '용접 방법(공정)', short: '용접법',
    value: 'FCAW-G · 반자동 · E71T-1 Ø1.2 mm',
    clause: 'D1.1 5.5 (Table 5.1~5.4), Table 6.6', clauseKey: 'g66',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: '공정은 WPS의 뼈대입니다. 같은 “FCAW”라도 가스 차폐(G)와 자기 차폐(SS)는 다른 절차로 봐야 합니다.',
    logic: '공정을 바꾸거나 추가하면 새 PQR이 필요합니다(Table 6.6). E71T-8(자기 차폐)로 바꾸는 것은 가스 유무가 달라지는 변경이라 역시 재인정입니다. 반자동↔자동 같은 작업 형태 변경은 코드상 별도 취급입니다.',
    field: 'FCAW는 바람에 약합니다. 야외에서는 방풍막이 없으면 가스 차폐가 깨져 기공이 생깁니다. 자기 차폐 와이어는 그 대신 충격인성이 불리할 수 있습니다.',
    quiz: { q: 'E71T-1(가스 차폐)을 E71T-8(자기 차폐)로 바꾸면?', a: ['WPS 개정만으로 가능', '새 PQR 필요'], correct: 1, why: '차폐 방식이 바뀌면 가스 관련 필수변수가 달라져 재인정 대상입니다.' }
  },
  {
    n: 3, name: '이음 형상', short: '이음',
    value: 'B-U2a-S · single-V 45° · Root 6 mm · Face 2 mm · 철제 백킹',
    clause: 'D1.1 5.4, Figure 5.1, Table 6.6', clauseKey: 'gjoint',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: '도면과 WPS의 이음 표기가 같은 상세를 가리키는지 확인해야 합니다. “single-V”라는 말만으로는 부족하고 B-U2a-S 같은 상세 기호가 있어야 합니다.',
    logic: '그루브 형상 변경(예: single-V→double-V)과 백킹을 빼는 변경은 재인정 사유입니다. 반대로 백킹을 더하는 변경은 재인정 사유가 아닙니다. -S는 철제 백킹을 용접 후 제거하지 않는다는 뜻이고, -GF는 백가우징 후 이면을 용접한다는 뜻입니다.',
    field: '루트 개구부가 커지면 용입은 쉬워지지만 입열이 늘고 변형이 커집니다. 백킹을 댄 채로 루트를 지나치게 태우면 백킹과 모재 사이에 슬래그가 끼어 UT 지시로 나타납니다.',
    quiz: { q: '백킹을 “빼는” 변경은?', a: ['WPS 개정만', '새 PQR 필요'], correct: 1, why: '백킹 삭제는 재인정, 추가는 재인정 사유가 아닙니다(비대칭 규칙).' }
  },
  {
    n: 4, name: '모재 (Group · 두께)', short: '모재',
    value: 'A992 Gr.50 (Group II) · 인정 두께 3 ~ 32 mm',
    clause: 'D1.1 5.3, Table 5.3, Table 6.2, Table 6.6', clauseKey: 'g62',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: '모재는 “규격+등급”이 아니라 “Group+두께”로 읽습니다. Group이 같으면 강종이 달라도 같은 절차로 용접할 수 있습니다.',
    logic: '지원 PQR은 16 mm 시험편으로 인정받았습니다. Table 6.2에 따라 인정 두께는 최소 3 mm, 최대 2T = 32 mm입니다. A992는 Group II이므로 Group I(A36 3/4" 이하)이나 Group III(A572 Gr.60)로 바꾸면 재인정입니다.',
    field: '도면 두께가 32 mm를 넘으면 이 WPS로는 안 됩니다. 두꺼운 부재는 25 mm 이상 시험편으로 인정받아 두께 제한을 없애 두는 것이 실무 요령입니다.',
    quiz: { q: '이 WPS로 40 mm 부재를 용접할 수 있나?', a: ['가능', '불가'], correct: 1, why: '인정 최대 두께가 2T=32 mm입니다. 40 mm는 범위 밖입니다.' }
  },
  {
    n: 5, name: '용가재', short: '용접봉',
    value: 'E71T-1 (A5.20) · F6 / A1 · Ø1.2 mm',
    clause: 'D1.1 5.6, Table 6.6', clauseKey: 'gfno',
    badge: 'E', badgeText: 'E · 필수변수(F/A-No.)',
    meaning: '분류 기호를 F-No.(난이도)와 A-No.(성분)로 바꿔 읽는 것이 핵심입니다. E71T-1은 인장 70 ksi급, F6, A1입니다.',
    logic: 'F-No.나 A-No.가 바뀌면 재인정입니다. 같은 F6/A1 안에서의 변경(예: ER70S-6↔E71T-1은 공정이 달라 별개)은 공정이 같다면 WPS 개정으로 끝나는 경우가 많습니다. 와이어 직경은 필수변수가 아니지만 WPS에 적어야 합니다.',
    field: 'E71T-1은 흡습합니다. 개봉 후 습한 현장에 방치하면 수소 유입으로 지연균열이 생깁니다. 보관 온도와 개봉 후 사용 시간을 기록해야 합니다.',
    quiz: { q: 'E7018(F4)을 E7016(F4)으로 바꾸면?', a: ['같은 F-No.이므로 WPS 개정', '새 PQR 필요'], correct: 0, why: 'F-No.와 강도 수준이 같으면 WPS 개정으로 처리합니다.' }
  },
  {
    n: 6, name: '자세 · 진행방향', short: '자세',
    value: '1G (아래보기)',
    clause: 'D1.1 Table 6.1, Table 6.6', clauseKey: 'g61',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: 'WPS에 적힌 자세는 “시험으로 인정받은 자세”입니다. 도면이 요구하는 자세가 여기에 없으면 그 WPS로는 용접할 수 없습니다.',
    logic: '이 PQR은 1G로 시험했으므로 Table 6.1에 따라 아래보기(F)만 인정합니다. 3G(수직)를 추가하려면 3G 시험을 더 하거나 2G+3G+4G로 다시 인정받아야 합니다.',
    field: '자세는 절차(WPS)와 사람(WPQ) 양쪽에 걸립니다. WPS가 전 자세를 허용해도, 1G로 시험한 용접사는 수직을 못 합니다.',
    quiz: { q: '1G로 시험한 PQR로 3G 생산 용접이 가능한가?', a: ['가능', '불가'], correct: 1, why: '1G는 F(아래보기)만 인정합니다. 3G는 별도 시험이 필요합니다.' }
  },
  {
    n: 7, name: '용접후열처리(PWHT)', short: 'PWHT',
    value: '없음 — 계약 요구 없음',
    clause: 'D1.1 5.9, 6.8', clauseKey: 'g59',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: 'D1.1은 압력용기 코드처럼 두께로 PWHT를 강제하지 않습니다. 요구가 있으면 계약·설계가 정하고, 절차는 그 조건으로 인정받아야 합니다.',
    logic: 'PWHT 유무와 조건(온도·유지시간·승온속도)은 필수변수입니다. “없음”으로 인정받은 절차에 PWHT를 넣거나 그 반대면 재인정입니다.',
    field: '철골에서 PWHT는 드물지만, 두꺼운 인장부재나 특정 용접부에는 발주처가 요구할 수 있습니다. 요구가 있는데 WPS에 없으면 그 자체가 부적합입니다.',
    quiz: { q: 'D1.1은 두께 기준 PWHT를 강제하나?', a: ['강제한다', '원칙적으로 요구하지 않는다'], correct: 1, why: 'D1.1은 PWHT를 원칙적으로 요구하지 않고, 계약·설계 요구 시 절차에 반영합니다.' }
  },
  {
    n: 8, name: '예열 · 층간온도', short: '예열',
    value: '최소 10 °C · 최대 층간 230 °C',
    clause: 'D1.1 5.7, Table 5.8', clauseKey: 'g58',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: '예열은 Table 5.8의 범주와 두께로 정해지는 “하한”입니다. 이 WPS의 모재는 A992(범주 B)이고 최후 부재 20~38 mm 구간에 해당해 최소 10 °C입니다.',
    logic: 'Table 5.8 값보다 낮추는 변경은 재인정입니다. 층간온도의 상한은 코드가 특정 강재에만 규정하므로, 230 °C 같은 상한은 설계·시방이 정하고 WPS에 기재합니다. 충격시험이 요구되면 상한을 올리는 변경도 재인정 사유가 됩니다.',
    field: '예열 측정은 용접부에서 가장 두꺼운 부재 두께만큼, 최소 75 mm 떨어진 여러 방향에서 합니다. 겨울철 야외에서는 0 °C 기준을 적용할 수 없어 20 °C까지 올려 유지해야 합니다.',
    quiz: { q: 'A992 25 mm 부재, FCAW(E71T-1)의 Table 5.8 최소 예열은?', a: ['10 °C', '65 °C'], correct: 0, why: '범주 B, 20~38 mm 구간은 50°F(10°C)입니다.' }
  },
  {
    n: 9, name: '가스 · 유량', short: '가스',
    value: 'CO2 100 % · 15 ~ 25 L/min',
    clause: 'D1.1 5.6, Table 5.7', clauseKey: 'g66',
    badge: 'E', badgeText: 'E(조성) / N(유량)',
    meaning: '가스는 “무엇을(조성)”과 “얼마나(유량)”를 나눠 봅니다. 조성 변경은 필수변수, 유량은 기재 사항입니다.',
    logic: 'CO2 100 %에서 Ar 혼합(예: 75/25)으로 바꾸면 이행 모드와 입열 특성이 달라져 재인정 대상입니다. 유량은 WPS에 적힌 범위를 벗어나면 현장 부적합이지만 코드상 필수변수는 아닙니다.',
    field: '유량계는 토치에서 15~20 mm 떨어진 콘택트 팁에서 확인하고, 바람이 있는 곳에서는 방풍 조치를 먼저 합니다.',
    quiz: { q: 'CO2 100 %를 Ar/CO2 혼합가스로 바꾸면?', a: ['WPS 개정만', '새 PQR 필요'], correct: 1, why: '차폐가스 조성 변경은 필수변수입니다.' }
  },
  {
    n: 10, name: '전기적 특성', short: '전기',
    value: '180~260 A / 22~28 V · CTWD 15~20 mm · 25~35 cm/min · 입열 ≤ 2.0 kJ/mm',
    clause: 'D1.1 6.8, Table 6.7', clauseKey: 'ghi',
    badge: 'S', badgeText: 'S · CVN 시 필수',
    meaning: '전류·전압·속도는 WPS에 “범위”로 적고, 그 조합이 만드는 입열량이 성질을 좌우합니다.',
    logic: '입열량은 H = 전압×전류×60 ÷ 이동속도입니다. 26 V·240 A·30 cm/min이면 1.25 kJ/mm로, WPS 상한 2.0 kJ/mm 안에 듭니다. 충격시험 요구 공사에서는 인정 입열량을 넘는 변경이 재인정 사유가 됩니다.',
    field: '전류만 올리고 속도를 그대로 두면 입열이 커집니다. 반대로 속도를 올리면 융합 부족이 생길 수 있어, 범위를 벗어난 “속도 올리기”는 현장에서 가장 흔한 이탈입니다.',
    quiz: { q: '26 V, 240 A, 300 mm/min의 입열량은?', a: ['약 1.25 kJ/mm', '약 2.5 kJ/mm'], correct: 0, why: '26×240×60 ÷ 300 = 1,248 J/mm ≈ 1.25 kJ/mm입니다.' }
  },
  {
    n: 11, name: '전류 극성', short: '극성',
    value: 'DCEP (직류 역극성)',
    clause: 'D1.1 Table 6.6, 6.8', clauseKey: 'g66',
    badge: 'E', badgeText: 'E · 필수변수',
    meaning: 'FCAW·SMAW는 DCEP가 표준입니다. 극성이 바뀌면 용입 형상과 입열이 달라집니다.',
    logic: 'DCEP→DCEN 또는 AC↔DC 변경은 필수변수입니다. 특히 FCAW를 DCEN으로 돌리면 아크가 불안정하고 융합이 떨어져 실제로는 결함으로 이어집니다.',
    field: '용접기 단자 표기와 케이블 결선을 작업 전에 눈으로 확인합니다. 케이블을 바꿔 끼운 채 하루를 돌리는 것이 현장 단골 사고입니다.',
    quiz: { q: 'DCEP를 DCEN으로 바꾸면?', a: ['WPS 개정만', '새 PQR 필요'], correct: 1, why: '전류 종류·극성 변경은 필수변수입니다.' }
  },
  {
    n: 12, name: '기술사항(기법)', short: '기법',
    value: '다층 다패스 · 스트링거/위빙 · 패스간 청소 · 백가우징 없음 · 피닝 금지',
    clause: 'D1.1 6.8, Table 6.7', clauseKey: 'gcvn',
    badge: 'N', badgeText: 'N · 비필수(대부분)',
    meaning: '기법 항목은 WPS에 반드시 적지만, 대부분은 코드상 비필수변수입니다. 다만 충격시험이 요구되면 단층↔다층 같은 항목이 재인정 사유가 됩니다.',
    logic: '이 WPS는 -S 상세이므로 백가우징이 없습니다. 피닝은 원칙적으로 금지(코드가 허용하는 경우 제외)이고, 패스간 슬래그 제거는 기재 사항입니다.',
    field: '위빙 폭이 커지면 입열 분포가 달라집니다. 폭을 넓게 잡는 습관은 인성 관리가 필요한 부재에서 특히 조심해야 합니다.',
    quiz: { q: '충격시험이 요구될 때 재인정 사유가 되는 기법 변경은?', a: ['다층→단층', '스트링거→위빙'], correct: 0, why: '단층↔다층 변경은 CVN 요구 시 보충 필수변수입니다.' }
  }
];

const QUESTS = [
  {
    id: 'Q1',
    q: '도면에 40 mm 두께 A992 부재가 나왔다. 이 WPS로 용접할 수 있나?',
    need: [4],
    answer: 1,
    options: ['가능 — Group이 같으므로', '불가 — 인정 두께를 넘는다'],
    why: '지원 PQR은 16 mm 시험편입니다. Table 6.2에 따라 인정 최대 두께는 2T = 32 mm이므로 40 mm는 범위 밖입니다.'
  },
  {
    id: 'Q2',
    q: '현장에 E71T-1이 없어 자기 차폐 와이어 E71T-8로 바꾸려 한다. 재인정이 필요한가?',
    need: [2, 9],
    answer: 0,
    options: ['재인정 필요 — 차폐 방식이 바뀐다', '불필요 — F6/A1은 같다'],
    why: 'F-No.가 같아도 차폐가스 유무가 달라지면 공정 조건이 바뀝니다. 필수변수 변경으로 새 PQR이 필요합니다.'
  },
  {
    id: 'Q3',
    q: '같은 이음이 3G(수직) 자세로 바뀌었다. 이 WPS로 가능한가?',
    need: [6],
    answer: 1,
    options: ['가능 — WPS는 자세에 묶이지 않는다', '불가 — 1G 시험은 아래보기만 인정한다'],
    why: 'Table 6.1에서 1G 시험은 F만 인정합니다. 3G는 별도 시험이 필요합니다.'
  }
];

/* ---------------------------------------------------------------- 4. 시뮬레이터 시나리오 */
const PQR = {
  no: 'ED-PQR-001', date: '2026-01-05',
  process: 'FCAW-G', filler: 'E71T-1', f: 6, a: 1, dia: '1.2 mm',
  base: 'ASTM A992 Gr.50', group: 'II', T: 16,
  joint: 'B-U2a-S', position: '1G',
  preheat: 10, interpass: 200,
  pwht: '없음', cvn: '없음 (충격시험 미적용)',
  gas: 'CO2 100 %', polarity: 'DCEP',
  tests: '인장 2 · 굽힘 2 — 합격 (교육용 예시)',
  qualified: '두께 3 ~ 32 mm · 자세 F(아래보기) · Group II · F6/A1'
};

const SCENARIOS = [
  {
    id: 'SC1', q: '충전·캡을 FCAW에서 GMAW(ER70S-6, 분무이행)로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '공정 변경은 대표적인 필수변수입니다. 용가재가 F6/A1으로 같아도 공정이 다르면 새 PQR이 필요합니다.'
  },
  {
    id: 'SC2', q: '모재를 A992(Group II)에서 A572 Gr.60(Group III)으로 바꾼다.', clause: 'Table 6.6 / Table 5.3',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '모재 Group 변경은 필수변수입니다. 같은 ASTM 계열이라도 Group이 다르면 재인정입니다.'
  },
  {
    id: 'SC3', q: '생산 부재 두께가 45 mm다 (PQR 시험편 16 mm).', clause: 'Table 6.2',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '16 mm 시험편의 인정 최대 두께는 2T = 32 mm입니다. 45 mm는 범위 밖이므로 25 mm 이상으로 다시 인정받아야 합니다.'
  },
  {
    id: 'SC4', q: 'E71T-1을 E71T-8(자기 차폐)로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: 'F6/A1은 같지만 차폐가스 유무가 달라져 공정 조건이 바뀝니다. 재인정 대상입니다.'
  },
  {
    id: 'SC5', q: '예열을 10 °C에서 5 °C로 낮춘다 (A992 25 mm).', clause: '5.7, Table 5.8',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: 'Table 5.8의 최소 예열(10 °C)보다 낮추는 것은 코드 위반이자 필수변수 변경입니다. 인정이 필요합니다.'
  },
  {
    id: 'SC6', q: '층간온도 상한을 200 °C에서 230 °C로 올린다 (CVN 없음).', clause: 'Table 6.7',
    cls: ['E', 'S', 'N'], clsAns: 1, actAns: 1,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '충격시험이 요구되지 않으면 층간온도 상한 상향은 WPS 개정으로 처리할 수 있습니다. CVN 요구 공사였다면 재인정입니다.'
  },
  {
    id: 'SC7', q: '이음을 single-V에서 double-V로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '그루브 형상 변경은 필수변수입니다. 단, 인정받은 CJP가 조건을 만족하는 다른 CJP 상세를 포괄하는 경우는 별도 검토입니다.'
  },
  {
    id: 'SC8', q: '철제 백킹을 빼고 백가우징으로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '백킹 “삭제”는 필수변수 변경입니다. 반대로 백킹을 더하는 변경은 재인정 사유가 아닙니다.'
  },
  {
    id: 'SC9', q: 'DCEP를 DCEN으로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '전류 종류·극성 변경은 필수변수입니다. FCAW에서 DCEN은 융합에도 불리합니다.'
  },
  {
    id: 'SC10', q: '차폐가스를 CO2 100 %에서 Ar 75 %/CO2 25 %로 바꾼다.', clause: '5.6, Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 0, actAns: 0,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '차폐가스 조성 변경은 필수변수입니다. 이행 모드·입열 특성이 달라집니다.'
  },
  {
    id: 'SC11', q: '와이어 직경을 Ø1.2에서 Ø1.4로 바꾼다.', clause: 'Table 6.6',
    cls: ['E', 'S', 'N'], clsAns: 2, actAns: 1,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '직경은 필수변수가 아니므로 새 PQR은 필요 없습니다. WPS에 기재값을 고쳐 개정합니다.'
  },
  {
    id: 'SC12', q: '유량을 20 L/min에서 28 L/min으로 올린다.', clause: '5.6, Table 5.7',
    cls: ['E', 'S', 'N'], clsAns: 2, actAns: 1,
    acts: ['새 PQR 필요(재인정)', 'WPS 개정만', '변경 불필요'],
    why: '유량은 비필수 기재 항목입니다. 다만 WPS 범위를 벗어난 운전은 현장 부적합입니다.'
  }
];

/* ---------------------------------------------------------------- 5. 과제서 · 작성 답안 */
const TASK = {
  id: 'T01',
  project: '가온 물류센터 신축공사 (가상)',
  part: '기둥 스플라이스 플랜지 CJP 이음 — 제작장 아래보기(1G) 용접',
  base: 'ASTM A992 Gr.50 (Group II), 판두께 25 mm',
  joint: 'B-U2a-S 상세 · single-V 45° · 철제 백킹 · 완전용입(CJP)',
  process: 'FCAW-G, E71T-1 Ø1.2, CO2 100 %, DCEP',
  req: [
    '최소 예열은 Table 5.8 이상으로 기재',
    '최대 층간온도 230 °C 이하',
    'PWHT 없음 (계약 요구 없음)',
    '충격시험(CVN) 미적용',
    '최대 입열량 2.0 kJ/mm 이하',
    '지원 PQR은 ED-PQR-001만 사용 가능'
  ]
};

const ANSWER = {
  pqr: 'ED-PQR-001',
  route: 'clause6',
  process: 'FCAW-G',
  method: 'semi',
  joint: 'B-U2a-S',
  groove: 45,
  root: 6,
  backing: 'steel',
  bspec: 'A992',
  bgrade: 'Gr.50',
  group: 'II',
  tMin: 3,
  tMax: 32,
  fclass: 'E71T-1',
  fno: 6,
  ano: 1,
  dia: 1.2,
  pos: ['1G'],
  pwht: 'none',
  preheat: 10,
  interpass: 230,
  gas: 'CO2',
  flow: 20,
  polarity: 'DCEP',
  ampMin: 180,
  ampMax: 260,
  voltMin: 22,
  voltMax: 28,
  ctWd: 18,
  hi: 1.25,
  passes: 'multi',
  backgouge: 'none',
  peening: false
};

const CARDS = [
  {
    id: 'C1', title: 'WPS는 어디서 나오는가', tag: '흐름',
    lead: '사전인정(Clause 5)이면 PQR 없이, 아니면 시험인정(Clause 6)으로.',
    body: [
      'D1.1에서 WPS를 만드는 길은 두 갈래입니다. 모재(Table 5.3)·이음상세(Figure 5.1~5.3)·공정(Table 5.1~5.4)·용가재·예열(Table 5.8)이 모두 코드가 미리 인정한 범위 안이면 <b>사전인정 WPS</b>로 바로 쓸 수 있습니다.',
      '하나라도 벗어나면 시험편을 용접해 <b>PQR</b>을 만들고, 그 PQR이 지원하는 범위 안에서 WPS를 씁니다. 이때 PQR이 “어디까지 되는지”를 정합니다.',
      '현장에서 WPS를 읽는다는 것은 결국 <b>이 값이 어디서 왔는지</b>(사전인정 조항인지, PQR의 인정 범위인지)를 되짚는 일입니다.'
    ],
    diagram: 'flow'
  },
  {
    id: 'C2', title: '변경은 세 층으로 판단한다', tag: '필수변수',
    lead: 'E(재인정) · S(CVN 요구 시 재인정) · N(WPS 개정).',
    body: [
      'D1.1에는 ASME식 E/S/N 표기가 없지만, 같은 원리로 세 층으로 나눠 읽으면 판단이 빨라집니다.',
      '<b>E — 필수변수</b>: 강도·연성에 영향. 공정, 모재 Group, 용가재 F/A-No., 자세, 그루브 형상, 백킹 삭제, 극성, 예열 하향. → 새 PQR (Table 6.6)',
      '<b>S — 충격시험 보충</b>: 인성에 영향. 입열량 상한, 층간온도 상한, 단층↔다층, 패스당 두께. CVN 요구 공사에서만 재인정 (Table 6.7)',
      '<b>N — 비필수</b>: 직경, 유량, 전류·전압 범위, 청소 방법. WPS만 개정.'
    ],
    diagram: 'esn'
  },
  {
    id: 'C3', title: '숫자는 두 표에서 나온다', tag: '인정범위',
    lead: '두께는 Table 6.2, 예열은 Table 5.8.',
    body: [
      '<b>두께</b>: 시험편 T가 25 mm(1") 미만이면 인정 두께는 3 mm ~ 2T입니다. 16 mm로 시험하면 32 mm까지, 25 mm 이상으로 시험하면 두께 제한이 없어집니다.',
      '<b>예열</b>: 강재 범주(A~D)와 최후 부재 두께로 최소 예열·층간온도가 정해집니다. A992·A572 Gr.50은 범주 B, 20~38 mm 구간이면 50°F(10°C)입니다.',
      '이 두 표만 손에 익으면 WPS의 모재·예열 칸은 거의 읽은 것이나 다름없습니다.'
    ],
    diagram: 'tables'
  },
  {
    id: 'C4', title: '12포인트 지도', tag: '독도',
    lead: '슬라이드 순서 그대로 1~12번을 클릭해 읽습니다.',
    body: [
      '① 적용규격 ② 용접법 ③ 이음 ④ 모재 ⑤ 용가재 ⑥ 자세 ⑦ PWHT ⑧ 예열·층간 ⑨ 가스 ⑩ 전기 ⑪ 극성 ⑫ 기법.',
      '각 칸에서 확인할 것은 세 가지입니다. <b>값</b>, <b>어느 조항에서 왔는지</b>, <b>현장에서 무엇을 조심할지</b>.',
      '다음 단계에서 이 12개를 직접 눌러 보세요. 다 돌면 시뮬레이터가 열립니다.'
    ],
    diagram: 'map'
  }
];
