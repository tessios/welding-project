/* =========================================================================
   WPS작성 실습 — 시나리오 · WPS 칸 정의 · 채점 데이터
   기준: AWS D1.1/D1.1M:2020 · 탄소강 필렛 (교육용)
   · 팝오버의 AWS 문구는 원문 인용이 아닌 요약입니다.
   · [확인 필요] 표시 값은 배포 전 판본 원문 대조 대상입니다.
   · 인물·회사·도면·PQR 번호는 모두 가상입니다.
   ========================================================================= */

const SCENARIO = {
  meta: {
    site: '해외 철골 현장 · 시공팀',
    time: '07:42',
    place: '철골 현장 품질 사무소',
    caller: '박 팀장',
    callerRole: '시공팀 · 철골',
    me: '이프로',
    meRole: '품질관리자'
  },

  /* ── 장면 1: 전화 (지직— = 끊긴 정보) ─────────────────── */
  call: [
    { who:'박', t:'어, 이프로! 바빠? 바쁘지. 금방 끝낼게.' },
    { who:'이', t:'네 팀장님, 말씀하세요.', me:true },
    { who:'박', t:'내일 보–브래킷 필렛 용접을 해야 되는데 <b>WPS가 없어</b>. 감리에서 WPS 없으면 아크 한 번도 못 띄운대. 내일 오전 가능할까?', strong:true },
    { who:'이', t:'오전이요…? 일단 정보 좀 주세요. 재질이랑 두께요.', me:true },
    { who:'박', t:'SM275, 12미리. 보 웨브에 브래킷 세워서 붙이는 거라 세로로 올라가야 돼. 장비는 CO₂ 반자동, 와이어는 늘 쓰던 <i class="glitch">[지직—]</i>…' },
    { who:'이', t:'팀장님, 와이어 뭐라고요? 잘 안 들렸어요.', me:true },
    { who:'박', t:'아 여기 크레인 소리 때문에… 암튼 늘 쓰던 거! 그리고 내일 아침에 춥다던데 그거 뭐 <i class="glitch">[지직—]</i> 해야 되나? 작년엔 그냥 했는데.' },
    { who:'이', t:'예열이요? 기온 몇 도래요?', me:true },
    { who:'박', t:'몰라, 그건 니가 찾아봐. 그리고 이거 그 뭐냐, <b>시험 안 하고 바로 쓰는 WPS</b> 있잖아. 그걸로 하면 되지? <i class="glitch">[지직—]</i>… 나 지금 타워 올라가야 돼. 끊는다!', strong:true },
    { who:'이', t:'팀장님? 팀장님…!', me:true }
  ],

  monologue: [
    '재질은 <span class="q">SM275</span>, 두께 12, 세로 필렛. 받은 건 이게 전부입니다.',
    '와이어는 “늘 쓰던 거”, 예열은 “작년엔 그냥 했다”, 그리고 “시험 안 하는 WPS로 하면 되지?”…',
    'SM275가 그 “시험 안 하는 WPS” 목록에 있던가. 없으면 근거가 되는 <span class="q">PQR</span>이 있어야 합니다.',
    '내일 아침 첫 아크 전까지, 빈칸을 근거로 다 채워야 합니다.'
  ],

  /* ── 장면 4: 성공 엔딩 통화 ─────────────────────────────── */
  successCall: [
    { who:'박', t:'이프로! 어제 그 절차서, 용접사가 그대로 보고 했어. 오전에 깔끔하게 끝났어.' },
    { who:'박', t:'감리가 WPS 보더니 “PQR 근거까지 딱 붙어 있네” 하더라. 아침에 예열 안 했으면 큰일 날 뻔했어.' },
    { who:'박', t:'고마워 이프로. 덕분에 중요한 용접 잘 마무리했어. 역시 최고.', strong:true }
  ],

  failCall: { who:'박', t:'이프로… 브래킷 필렛에서 금 갔대. 감리가 작업 중지 걸고 WPS 다시 보재.' }
};

/* ── 장면 2: 브리핑 ─────────────────────────────────────── */
const BRIEF = {
  code: 'ST-401',
  detail: 'B-12',
  material: 'SM275',
  materialNote: 'KS D 3515 · Fy 275 MPa',
  thickness: '12 mm',
  thicknessNote: '웨브·브래킷 동일',
  joint: '보 웨브 – 브래킷',
  jointNote: 'T-joint · 수직 필렛 3F',
  leg: '6 mm 연속 · 양면',
  process: 'FCAW-G · CO₂ 반자동',
  date: '익일 07:00 착수',
  env: '오늘 현장 8 °C · 습도 62 %',
  // 자료함 — 직접 열어야 보이는 단서
  drawer: [
    { icon:'🌡', title:'내일 날씨 예보', short:'07시 −3 °C · 서풍 3~4 m/s',
      body:'내일 07시 기온 <b>−3 °C</b>, 서풍 3~4 m/s, 습도 68 %. 오전에는 서리가 예상됩니다. (강수 없음)' },
    { icon:'📁', title:'사내 PQR 목록', short:'PQR-ST-012 · SM275 확인',
      body:'<b>PQR-ST-012</b> — SM275, 시험판 25 mm, FCAW-G, E71T-1C(100 % CO₂), DCEP, <b>3G 상진</b> CJP 맞대기, 합격 (2년 전).<br>기록값: Ø1.2 mm · <b>210 A · 26 V · 250 mm/min</b> · CO₂ 20 L/min · 예열 20 °C.<br>이 밖에 PQR-A36-04(A36), PQR-SS400-07(SS400)이 있습니다.' },
    { icon:'🧰', title:'현장 장비·자재 재고', short:'E71T-1C Ø1.2 / E70T-1C Ø1.6',
      body:'CO₂ 반자동 용접기(DC). 와이어 재고: <b>E71T-1C Ø1.2 mm</b>, E70T-1C Ø1.6 mm.<br><span style="color:#ffbd83">E70T-1C는 아래보기·수평 전용 분류</span>입니다. 수직에 쓰면 비드가 흘러내립니다.' }
  ]
};

/* ── 장면 3: 공백 WPS 칸 ────────────────────────────────
   kind: given(현장 정보 키인) | ask(규격을 보고 판단)
   ------------------------------------------------------------------ */
const FIELDS = [

  /* 01 이음 */
  { id:'joint', sec:1, label:'이음 형식', en:'Joint Type', kind:'given', ui:'chips',
    options:['T-joint · 양면 필렛','Butt · V-groove (CJP)','Corner · 편면 필렛'],
    pop:{ title:'도면 ST-401 / B-12', ref:'도면 지시',
      body:'보 웨브에 브래킷을 직각으로 세워 붙입니다. 개선 없이 양면 필렛 6 mm 연속.', fill:'T-joint · 양면 필렛' },
    answer:'T-joint · 양면 필렛', weight:3,
    fb:'단면도를 다시 보세요. 웨브에 브래킷을 세운 T자 접합이므로 맞대기(Butt)가 아닙니다.' },

  { id:'backing', sec:1, label:'받침판 · 뒷면 따내기', en:'Backing / Backgouging', kind:'ask', ui:'chips',
    options:['Backing 없음 · Backgouging 없음','철제 백킹 · Backgouging 없음','Backing 없음 · Backgouging 실시'],
    pop:{ title:'필렛에는 백킹도 백가우징도 없다', ref:'D1.1 5.4 · Figure 5.1~5.3',
      body:'받침판과 뒷면 따내기는 완전용입(CJP)·부분용입 그루브의 변수입니다. 필렛은 루트가 열려 있지 않아 대상이 아닙니다.',
      quote:'Backing과 backgouging은 그루브 용접의 이음 상세 변수로 다룬다. 필렛 이음에는 적용되지 않는다. (Clause 5 사전인정 이음 상세 — 확인 필요)' },
    answer:'Backing 없음 · Backgouging 없음', weight:3,
    fb:'필렛에는 받침판도 백가우징도 쓰지 않습니다. 그루브 용접 변수와 혼동했습니다.' },

  { id:'rootGap', sec:1, label:'루트 간격', en:'Root Opening (Fit-up)', kind:'ask', ui:'number',
    ph:'2', unit:'mm',
    pop:{ title:'부재 사이 간격의 허용치', ref:'D1.1 7.21.1 (확인 필요)',
      body:'브래킷과 웨브 사이 간격은 원칙적으로 2 mm 이하입니다. 넘으면 초과분만큼 각장을 늘려 보정하고, 5 mm를 넘으면 용접할 수 없습니다.',
      quote:'Fillet 부재 간격은 최대 1/16 in(2 mm). 2 mm 초과~5 mm까지는 초과량만큼 각장을 증가시켜야 한다.' },
    answer:{ min:0, max:2 }, weight:5,
    fb:'간격은 0~2 mm로 관리합니다. 커지면 유효 목두께가 줄어 각장 보정이 필요합니다.' },

  { id:'filletSize', sec:1, label:'필렛 각장', en:'Fillet Weld Size', kind:'given', ui:'number',
    ph:'6', unit:'mm',
    pop:{ title:'도면 지시 각장', ref:'도면 · 7.7 (확인 필요)',
      body:'설계 각장은 6 mm입니다. 두꺼운 쪽 모재 6~13 mm에서 요구되는 최소 필렛 크기(5 mm)를 만족합니다.', fill:'6' },
    answer:6, weight:4,
    fb:'도면 지시는 6 mm입니다. 최소 크기(5 mm) 미만이거나 도면 값과 다르면 안 됩니다.' },

  /* 02 모재 */
  { id:'baseMetal', sec:2, label:'모재 규격', en:'Base Metal Spec', kind:'given', ui:'text',
    ph:'예: KS D 3515 SM275',
    pop:{ title:'자재 성적서 (입고분)', ref:'자재 성적서',
      body:'KS D 3515 SM275, 판 두께 12 mm. 항복강도 275 MPa급 탄소강 구조용 강재입니다. SS275(KS D 3503)와 다른 강종입니다.', fill:'KS D 3515 SM275' },
    accept:['ksd3515sm275','sm275','ksd3515','sm275ksd3515'], weight:3,
    fb:'규격 번호와 강종을 함께 적습니다. SS275(KS D 3503)와 혼동하지 마세요.' },

  { id:'group', sec:2, label:'모재 Group', en:'Table 5.3 Group', kind:'ask', ui:'chips', key:true,
    options:['Group I','Group II','Table 5.3 미등재'],
    pop:{ title:'승인 모재 목록에 있는가', ref:'D1.1 5.3 · Table 5.3',
      body:'사전인정 WPS에 쓸 수 있는 모재는 Table 5.3에 나열된 규격뿐입니다. 목록은 주로 ASTM·API 강종이고, 강도에 따라 Group I~IV로 나뉩니다.',
      quote:'Table 5.3 — Group I은 Fy 36 ksi급, Group II는 42~50 ksi급(A572 Gr.42/50, A992, A588 등). 표에 없는 강재는 사전인정 대상이 아니다.' },
    answer:'Table 5.3 미등재', weight:10, crit:true,
    fb:'SM275는 A36과 비슷해 보여도 Table 5.3에 없습니다. “비슷하다”는 규격 근거가 아닙니다.' },

  { id:'thickRange', sec:2, label:'인정 두께 범위', en:'Thickness Range', kind:'ask', ui:'chips',
    options:['3 mm ~ 제한 없음','3 ~ 24 mm (2T)','12 mm 단일'],
    pop:{ title:'근거 PQR의 시험판 두께', ref:'D1.1 Table 6.2 (확인 필요)',
      body:'인정 두께 범위는 근거가 되는 PQR의 시험판 두께로 정합니다. 25 mm 이상으로 시험하면 3 mm부터 상한 없이 인정됩니다.',
      quote:'시험판 두께 25 mm 이상 → 3 mm ~ 무제한. 25 mm 미만 → 최대 2T.' },
    answer:'3 mm ~ 제한 없음', weight:6,
    fb:'PQR-ST-012의 시험판은 25 mm입니다. 그래서 3 mm부터 상한 없이 인정되고, 작업 두께 12 mm가 포함됩니다.' },

  /* 03 용가재·전원 */
  { id:'process', sec:3, label:'용접 공정', en:'Process', kind:'given', ui:'text',
    ph:'예: FCAW-G',
    pop:{ title:'현장 장비 구성', ref:'현장 장비',
      body:'CO₂ 반자동 용접기(DC)에 플럭스 코어드 와이어를 걸어 씁니다. 가스 차폐 반자동(FCAW-G)입니다.', fill:'FCAW-G' },
    accept:['fcawg','fcaw-g','fcaw'], weight:3,
    fb:'장비와 와이어를 보면 플럭스 코어드 + 가스 차폐(FCAW-G)입니다. GMAW(솔리드 와이어)와 구분하세요.' },

  { id:'polarity', sec:3, label:'전류 종류 · 극성', en:'Current & Polarity', kind:'ask', ui:'chips', key:true,
    options:['DC · DCEP (역극성)','DC · DCEN (정극성)','AC'],
    pop:{ title:'T-1 계열 와이어의 표준 극성', ref:'AWS A5.20 / 제조사 데이터',
      body:'가스 차폐 플럭스 코어드 와이어(T-1 계열)는 직류 역극성에서 쓰도록 분류됩니다. 극성이 바뀌면 아크와 용입이 달라져 필수변수입니다.',
      quote:'T-1 계열 FCAW는 DCEP(와이어 +)로 분류된다. 최종 값은 제조사 데이터시트로 확인.' },
    answer:'DC · DCEP (역극성)', weight:7, crit:true,
    fb:'DCEN은 T-1 계열에 맞지 않습니다. 아크가 불안정해지고 기공·융합 불량이 생깁니다.' },

  { id:'wireCurrent', sec:3, label:'와이어 지름 · 전류 · 전압', en:'Electrode Ø / A / V', kind:'ask', ui:'chips',
    options:['Ø1.2 · 180–220 A · 23–27 V','Ø1.6 · 240–280 A · 26–30 V','Ø1.2 · 280–320 A · 30–34 V'],
    pop:{ title:'로트에 있는 와이어와 수직 자세', ref:'D1.1 Table 5.1 (확인 필요)',
      body:'수직 자세 Prequalified FCAW의 최대 와이어 지름은 5/64 in(2.0 mm)입니다. 재고에는 Ø1.2와 Ø1.6이 있고, 수직에서는 가는 와이어가 용융지 제어에 유리합니다.',
      quote:'수직·위보기 자세 최대 와이어 지름 5/64 in(2.0 mm). 전류·전압·속도는 PQR 기록값의 허용 변동폭 안에서 적는다.' },
    answer:'Ø1.2 · 180–220 A · 23–27 V', weight:6,
    fb:'PQR-ST-012 기록은 Ø1.2 · 210 A · 26 V입니다. 허용 변동폭(전류 ±10 %, 전압 ±7 %) 안에서 범위로 적습니다. Ø1.6은 수직에서 용융지가 무너지기 쉽고, 300 A는 Ø1.2 권장 범위를 넘습니다.' },

  { id:'filler', sec:3, label:'필러 분류', en:'Filler Classification', kind:'ask', ui:'chips', key:true,
    options:['E71T-1C (A5.20)','E70T-1C (A5.20)','E71T-1M (A5.20)','ER70S-6 (A5.18)'],
    pop:{ title:'강도와 자세, 가스까지 맞춘다', ref:'D1.1 Table 5.4 · A5.20',
      body:'필러는 모재 강도에 맞추고, 분류 기호의 자세 숫자와 가스 문자를 확인합니다. 첫 숫자 0은 아래보기·수평 전용, 1은 전자세입니다.',
      quote:'E7XT-x: 70 = 480 MPa급 인장. 두 번째 숫자 1 = 전자세. 끝의 C = 100% CO₂, M = Ar 혼합.' },
    answer:'E71T-1C (A5.20)', weight:10, crit:true,
    fb:'E70T-1C는 아래보기·수평 전용이라 수직 3F에서 비드가 흘러내립니다. 재고에 있다고 맞는 와이어는 아닙니다.' },

  { id:'fano', sec:3, label:'F-No. / A-No.', en:'Referenced ASME No.', kind:'ask', ui:'chips',
    options:['참고 F-6 / A-1','N/A (D1.1 비적용)','참고 F-6 / A-2','참고 F-4 / A-1'],
    pop:{ title:'이 양식의 칸이 ASME에서 온 것입니다', ref:'ASME Sec. IX QW-432·442 / D1.1 Table 5.4',
      body:'F-No./A-No.는 ASME Sec. IX의 분류입니다. 근거 규격이 D1.1이면 필러는 AWS 분류(Table 5.4)로 관리되므로, 이 칸은 참고 기재로 채웁니다.',
      quote:'D1.1은 F-No./A-No.를 쓰지 않고 AWS 분류로 필러를 관리한다. ASME 기준 F-6(플럭스 코어드)·A-1(탄소강)은 참고값.' },
    answer:['참고 F-6 / A-1','N/A (D1.1 비적용)'], weight:3,
    fb:'E71T-1C는 ASME 기준 F-6, 탄소강은 A-1입니다. D1.1 근거는 AWS 분류(Table 5.4)이므로 “N/A”로 두어도 맞습니다. 둘 다 인정합니다.' },

  { id:'gas', sec:3, label:'차폐가스 · 유량', en:'Shielding Gas', kind:'ask', ui:'chips',
    options:['100% CO₂ · 15–25 L/min + 방풍','Ar 75~80% + CO₂ · 15–25 L/min','100% Ar · 15–25 L/min'],
    pop:{ title:'분류 문자와 바람 예보를 함께 본다', ref:'D1.1 Table 5.7 (확인 필요)',
      body:'차폐가스는 필러 분류의 가스 문자와 같아야 합니다. 끝이 C면 100% CO₂, M이면 Ar 혼합입니다. 내일 서풍 3~4 m/s 예보도 확인하세요.',
      quote:'FCAW-G 차폐가스는 필러 분류와 일치해야 한다. 풍속 약 8 km/h(2.2 m/s) 초과 시 방풍 조치가 필요하다.' },
    answer:'100% CO₂ · 15–25 L/min + 방풍', weight:7, crit:true,
    fb:'분류가 E71T-1<b>C</b>이므로 100% CO₂입니다. Ar 혼합은 성분(Mn·Si)과 필수변수가 달라져 PQR 재인정 대상이고, 바람 3~4 m/s에서 방풍이 없으면 차폐가 깨져 기공이 생깁니다.' },

  /* 04 자세·열 */
  { id:'position', sec:4, label:'자세 · 진행 방향', en:'Position / Progression', kind:'ask', ui:'chips', key:true,
    options:['3F · 수직 상진','3F · 수직 하진','1F · 아래보기'],
    pop:{ title:'수직 필렛은 진행 방향까지 적는다', ref:'D1.1 Table 6.1 (확인 필요)',
      body:'3G 그루브 PQR은 수직 그루브와 F·H·V 필렛 자세를 인정합니다. 수직 용접은 상진/하진을 WPS에 명시해야 합니다.',
      quote:'3G 시험은 F·H·V 필렛을 인정. 수직은 진행 방향(상진/하진)을 절차에 명시.' },
    answer:'3F · 수직 상진', weight:7, crit:true,
    fb:'현장은 보 옆에서 올려 붙이는 3F이고, 근거 PQR도 상진입니다. 하진이나 미기재는 12 mm 판에서 융합 불량 위험이 큽니다.' },

  { id:'preheat', sec:4, label:'예열 · 층간 온도', en:'Preheat / Interpass', kind:'ask', ui:'chips', key:true,
    options:['최소 20 °C · 층간 20 °C 이상','최소 0 °C · 층간 0 °C 이상','예열 없음','최소 100 °C · 층간 100 °C 이상'],
    pop:{ title:'강재 범주 · 두께 · 그리고 모재 온도', ref:'D1.1 Table 5.8',
      body:'저수소 공정(FCAW) 20 mm 이하 강재의 최소 예열은 0 °C입니다. 다만 모재 온도가 0 °C 미만이면 최소 20 °C로 예열하고 층간에도 유지합니다.',
      quote:'Table 5.8 — 저수소 공정, 20 mm 이하: 최소 예열 32 °F(0 °C). 모재가 빙점 아래면 70 °F(20 °C)까지 예열.' },
    answer:'최소 20 °C · 층간 20 °C 이상', weight:10, crit:true,
    fb:'내일 07시 −3 °C입니다. 모재가 빙점 아래이므로 “없음”도 “0 °C”도 아닌 20 °C 예열이 필요합니다.' },

  { id:'heatInput', sec:4, label:'입열량', en:'Heat Input', kind:'ask', ui:'number',
    ph:'1.2', unit:'kJ/mm',
    pop:{ title:'전압·전류·속도로 계산', ref:'D1.1 입열량',
      body:'H = (전압 × 전류 × 60) ÷ 이동속도. 단위를 mm·kJ로 맞춥니다. 충격시험이 요구되지 않는 이 작업에서는 기록·관리 항목입니다.',
      quote:'H(kJ/mm) = 60 × E(V) × I(A) ÷ 1000 ÷ v(mm/min).',
      detail:'조건: 26 V · 210 A · 250 mm/min → 계산해 보세요. (허용 1.00–1.50)' },
    answer:{ min:1.00, max:1.50 }, weight:3,
    fb:'26 V × 210 A × 60 ÷ 250 mm/min ≈ 1.31 kJ/mm 입니다. 공란으로 두지 말고 계산해 기재합니다.' },

  { id:'pwht', sec:4, label:'용접후열처리', en:'PWHT', kind:'ask', ui:'chips',
    options:['없음 (None)','620 °C · 1 h','565 °C · 2 h'],
    pop:{ title:'도면·계약에 요구가 있는가', ref:'D1.1 5.9',
      body:'D1.1은 원칙적으로 PWHT를 요구하지 않습니다. 계약·설계가 요구할 때만 조건을 정해 절차에 넣습니다. 이 도면에는 요구가 없습니다.',
      quote:'PWHT 여부와 조건은 필수변수다. 요구가 없으면 “None”으로 두고, 추가하면 재인정 대상이 된다.' },
    answer:'없음 (None)', weight:2,
    fb:'도면에 PWHT 요구가 없습니다. 근거 없이 넣으면 일정과 비용만 늘고 변형 위험이 커집니다.' },

  /* 05 판정 */
  { id:'prequal', sec:5, label:'인정 방식 · 근거', en:'Prequalified or Qualified', kind:'ask', ui:'chips', key:true,
    options:['Qualified (Clause 6) — PQR-ST-012','Prequalified (Clause 5)','Qualified — PQR-A36-04'],
    pop:{ title:'Clause 5의 조건을 모두 만족하는가', ref:'D1.1 5.1 / 5.3 · 6.1',
      body:'사전인정은 모재·이음·필러·변수가 모두 코드 범위 안에 있을 때만 성립합니다. 하나라도 벗어나면 Clause 6 시험으로 인정합니다.',
      quote:'Prequalified WPS는 Table 5.3 모재와 사전인정 이음 상세를 모두 만족해야 한다. 그렇지 않으면 시험으로 인정한다.' },
    answer:'Qualified (Clause 6) — PQR-ST-012', weight:8, crit:true,
    fb:'SM275는 Table 5.3에 없어 사전인정이 성립하지 않습니다. 자료함의 PQR-ST-012(SM275, 3G 상진)를 근거로 지정해야 합니다.' }
];

const SECTIONS = {
  1:{ n:'01', ko:'이음', en:'Joint' },
  2:{ n:'02', ko:'모재', en:'Base Metal' },
  3:{ n:'03', ko:'용가재 · 전원', en:'Filler & Power' },
  4:{ n:'04', ko:'자세 · 열처리', en:'Position & Heat' },
  5:{ n:'05', ko:'적용 판정', en:'Applicability' }
};

/* 합격 기준: 치명 오류 0건 그리고 80점 이상 */
const PASS_RULE = { minScore: 80 };

/* 치명 오류별 파단 연출 유형 (첫 번째 치명 오류로 결정) */
const FRACTURE_TYPES = {
  preheat:   { id:'hydrogen', label:'수소 지연 균열', where:'토우부', desc:'예열 없이 영하 모재에 용접 → 수소가 비드 아래에 머물다 하중이 걸린 뒤 토우에서 균열이 시작됐습니다.' },
  filler:    { id:'throat',   label:'비드 처짐 · 목두께 부족', where:'목두께', desc:'E70T-1C(아래보기·수평 전용)를 수직에 써서 비드가 흘러내렸습니다. 유효 목두께가 모자라 전단 파단됐습니다.' },
  position:  { id:'fusion',   label:'융합 불량', where:'루트부', desc:'하진 조건으로 12 mm 판에 용입이 들어가지 않았습니다. 루트 경계에서 비드가 껍질처럼 박리됐습니다.' },
  polarity:  { id:'fusion', label:'융합 불량 · 스패터', where:'루트부', desc:'DCEN으로 아크가 불안정해 스패터가 늘고 용입이 들어가지 않았습니다. 루트 경계에서 비드가 박리되며 파단됐습니다.' },
  gas:       { id:'porosity', label:'기공 · 가스 차폐 불량', where:'비드 내부', desc:'분류(C)와 다른 가스이거나 바람 3~4 m/s에서 방풍 없이 용접해 차폐가 깨졌습니다. 비드에 기공이 벌집처럼 생기고 성분도 달라졌습니다.' },
  group:     { id:'reject',   label:'근거 없는 절차서', where:'—', desc:'SM275를 등재 강재처럼 Group에 넣었습니다. 감리가 근거 문서를 요구하며 절차를 반려했습니다.' },
  prequal:   { id:'reject',   label:'근거 없는 절차서', where:'—', desc:'Table 5.3 미등재 강재를 사전인정으로 처리했습니다. 감리 반려 후 용접이 중지됐습니다.' },
  default:   { id:'hydrogen', label:'균열', where:'토우부', desc:'절차서의 필수변수가 현장 조건과 맞지 않아 용접부가 하중을 견디지 못했습니다.' }
};
