/* =========================================================================
   WPS작성 실습 — 시나리오 · WPS 칸 정의 · 채점 데이터
   기준: AWS D1.1/D1.1M:2025 원문 대조 (Clause 5·6·7, Table 5.5·5.6·5.7·5.11·6.1·6.2·6.8·7.7)
   · 인용문은 2025년판 원문 발췌이며, 한글 해석·현장 의미를 함께 붙였습니다.
   · 인물·회사·도면·WPS 번호·수치는 모두 교육용 가상값입니다.
   · 선택형(select/chips)은 오답 선택지를 섞어 판단 연습을 하게 하고,
     수치·코드(입력형)는 수강생이 직접 계산·작성합니다.
   ========================================================================= */

const SCENARIO = {
  meta: {
    site: '(교육용 샘플) 철골 현장 · 시공팀',
    time: '07:42',
    place: '철골 현장 품질 사무소',
    caller: '박 팀장',
    callerRole: '시공팀 · 철골',
    me: '이프로',
    meRole: '품질관리자'
  },

  /* ── 장면 1: 전화 — 음성 없이 자막·말풍선으로 진행 ─────────── */
  call: [
    { who:'박', t:'어, 이프로! 바빠? 바쁘지. 금방 끝낼게.' },
    { who:'이', t:'네 팀장님, 말씀하세요.', me:true },
    { who:'박', t:'내일 보–브래킷 필렛 용접을 해야 되는데 <b>WPS가 없어</b>. 감리에서 WPS 없으면 아크 한 번도 못 띄운대. 내일 오전 가능할까?', strong:true },
    { who:'이', t:'오전이요…? 일단 정보 좀 주세요. 재질이랑 두께요.', me:true },
    { who:'박', t:'ASTM A36, 12미리. 보 웨브에 브래킷 세워서 붙이는 거라 세로로 올라가야 돼. 장비는 CO₂ 반자동, 와이어는 늘 쓰던 <i class="glitch">[지직—]</i>…' },
    { who:'이', t:'팀장님, 와이어 뭐라고요? 잘 안 들렸어요.', me:true },
    { who:'박', t:'아 여기 크레인 소리 때문에… 암튼 늘 쓰던 거! 그리고 내일 아침에 춥다던데, 그거 뭐 <i class="glitch">[지직—]</i> 해야 되나? 작년엔 그냥 했는데.' },
    { who:'이', t:'예열 말씀하시는 거죠? 기온이 몇 도입니까?', me:true },
    { who:'박', t:'몰라, 그건 니가 찾아봐. 그리고 이거 그 뭐냐, <b>시험 안 하고 바로 쓰는 WPS</b> 있잖아. 그걸로 하면 되지? <i class="glitch">[지직—]</i>… 나 지금 타워 올라가야 돼. 끊는다!', strong:true },
    { who:'이', t:'팀장님? 팀장님…!', me:true }
  ],

  /* 이프로의 정리 — 화면 자막 */
  monologue: [
    '재질은 <span class="q">ASTM A36</span>, 두께 <span class="q">12 mm</span>, 세로 필렛(3F). 받은 정보는 이게 전부입니다.',
    '와이어는 “늘 쓰던 거”, 예열은 “작년엔 그냥 했다”, 그리고 “시험 안 하는 WPS로 하면 되지?”…',
    'A36은 사전인정 모재 목록(<span class="q">Table 5.6 Group I</span>)에 있습니다. PQR 없이 갈 수 있습니다.',
    '다만 Clause 5의 조건 — 필러·가스·예열·자세 — 를 하나라도 벗어나면 그 순간 시험 인정 대상이 됩니다.'
  ],

  /* 아나운서 내레이션
     text = 음성(TTS) 발음용 문장 (audio/n_*.mp3 와 같은 문장)
     cap  = 화면 자막용 문장 — 영문 규격·기호·단위는 정상 표기(ASTM A36, 12 mm, AWS D1.1)
     음성은 다시 녹음하지 않고, 자막만 화면 표기로 바꿔 읽기 쉽게 합니다. */
  narr: {
    n_call: { label:'07:42 · 현장', cap:'11월 18일 아침, 해외 철골 현장의 품질 사무소입니다. 내일 아침 첫 아크를 앞두고 시공팀장이 전화를 겁니다. 보 웨브에 브래킷을 붙이는 수직 필렛(3F) — 그런데 아직 용접절차서(WPS)가 없습니다.',
      text:'11월 18일 아침, 해외 철골 현장의 품질 사무소입니다. 내일 아침 첫 아크를 앞두고 시공팀장이 전화를 겁니다. 보 웨브에 브래킷을 붙이는 수직 필렛, 그런데 아직 용접절차서가 없습니다.' },
    n_summary: { label:'핵심 정리', cap:'받은 정보를 정리합니다. 재질 ASTM A36, 두께 12 mm, 자세는 세로로 올라가는 수직 필렛(3F)입니다. ASTM A36은 사전인정 모재 목록인 Table 5.6, Group I에 있습니다. 그래서 시험 없이 사전인정으로 갈 수 있습니다. 다만 필러·가스·예열·자세가 Clause 5의 조건을 하나라도 벗어나면 그 순간 시험 인정으로 넘어갑니다. 지금 비어 있는 것은 와이어, 예열, 인정 방식 — 세 가지입니다.',
      text:'받은 정보를 정리해 보겠습니다. 재질은 에이에스티엠 에이 삼십육, 두께는 십이 밀리미터, 자세는 세로로 올라가는 수직 필렛 용접입니다. 에이 삼십육은 사전인정 모재 목록인 테이블 오 점 육, 그룹 원에 올라 있습니다. 그래서 시험 없이 사전인정으로 갈 수 있습니다. 다만 필러와 가스, 예열, 자세가 규정 조항 오의 조건을 하나라도 벗어나면 그 순간 시험 인정으로 넘어갑니다. 지금 비어 있는 것은 와이어와 예열, 그리고 인정 방식, 세 가지입니다.' },
    n_brief: { label:'내일 07:00', cap:'내일 아침 7시, 보 웨브에 브래킷을 세워 붙이는 수직 필렛(3F) 용접입니다. 재질 ASTM A36, 두께 12 mm, 각장 6 mm입니다. 오른쪽 현장 상황 네 가지를 직접 열어 확인하세요. 내일 예보와 측정 기록, 사내 절차서 목록, 그리고 자재 재고가 여러분의 판단을 기다립니다.',
      text:'내일 아침 일곱 시, 보 웨브에 브래킷을 세워 붙이는 수직 필렛 용접입니다. 재질은 에이에스티엠 에이 삼십육, 두께는 십이 밀리미터, 각장은 육 밀리미터입니다. 오른쪽 현장 상황 네 가지를 직접 열어 확인하세요. 내일 예보와 측정 기록, 사내 절차서 목록, 그리고 자재 재고가 여러분의 판단을 기다립니다.' },
    n_wps: { label:'작성 안내', cap:'빈 용접절차서(WPS) 한 장입니다. 모두 스무 칸을 채워야 합니다. 선택할 수 있는 칸은 보기에서 고르고, 수치와 코드는 직접 계산해 적으세요. 파란 점은 현장 정보, 주황 점은 AWS D1.1/D1.1M:2025 원문 근거입니다. 각 칸의 물음표를 누르면 조항과 해설이 열립니다.',
      text:'빈 용접절차서 한 장입니다. 모두 스무 칸을 채워야 합니다. 선택할 수 있는 칸은 보기 중에서 고르고, 수치와 코드는 직접 계산해 적으세요. 파란 점은 현장 정보, 주황 점은 에이더블유에스 디 원 점 원, 이천이십오년판 원문 근거입니다. 각 칸의 물음표를 누르면 조항과 해설이 열립니다.' },
    n_pass: { label:'검사 결과', cap:'검사 통과입니다. 치명 오류 없이 100점입니다. 인정 근거와 필수변수가 모두 규정 안에 들어왔습니다. 이 한 장으로 내일 아침 용접이 진행됩니다.',
      text:'검사 통과입니다. 치명 오류 없이 백 점입니다. 인정 근거와 필수변수가 모두 규정 안에 들어왔습니다. 이 한 장으로 내일 아침 용접이 진행됩니다.' },
    n_end_pass: { label:'다음 날', cap:'다음 날 오후, 시공팀장에게서 연락이 왔습니다. 용접은 오전에 끝났고, 감리는 절차서의 사전인정 근거가 정확하다고 확인했습니다. 영하의 아침이었지만 예열을 지킨 덕분에 결함 없이 마무리됐습니다. 오늘 남는 것은 세 가지입니다. 모재와 두께로 인정 방식을 먼저 정하고, 필수변수는 근거 조항으로 확인하고, 현장 조건은 숫자로 적어 남긴다.',
      text:'다음 날 오후, 시공팀장에게서 연락이 왔습니다. 용접은 오전에 끝났고, 감리는 절차서의 사전인정 근거가 정확하다고 확인했습니다. 영하의 아침이었지만 예열을 지킨 덕분에 결함 없이 마무리됐습니다. 오늘 남는 것은 세 가지입니다. 모재와 두께로 인정 방식을 먼저 정하고, 필수변수는 근거 조항으로 확인하고, 현장 조건은 숫자로 적어 남긴다.' },
    n_fail: { label:'검사 결과', cap:'부적합입니다. 제출한 절차서의 필수변수가 현장 조건과 맞지 않아 브래킷 필렛에서 균열이 발생했습니다. 작업은 즉시 중지됐고, 감리는 원인 조항과 함께 재작성을 지시했습니다.',
      text:'부적합입니다. 제출한 절차서의 필수변수가 현장 조건과 맞지 않아 브래킷 필렛에서 균열이 발생했습니다. 작업은 즉시 중지됐고, 감리는 원인 조항과 함께 재작성을 지시했습니다.' },
    n_end_fail: { label:'다시 작성', cap:'철골은 절차서 한 장의 빈칸에서 무너졌습니다. 다시 작성할 때는 틀린 칸만 비워집니다. 근거를 확인하고 수치를 직접 계산해 채우면 다음 판은 통과할 수 있습니다. 오늘의 실패를 그대로 두지 마세요.',
      text:'철골은 절차서 한 장의 빈칸에서 무너졌습니다. 다시 작성할 때는 틀린 칸만 비워집니다. 근거를 확인하고 수치를 직접 계산해 채우면 다음 판은 통과할 수 있습니다. 오늘의 실패를 그대로 두지 마세요.' },
    n_cause_hydrogen: { label:'사고 원인', cap:'원인은 예열입니다. −3 °C의 모재에 예열 없이 용접하면 용접부가 급랭하고 수소가 비드 아래에 머뭅니다. 하중이 걸린 뒤 토우에서 지연 균열이 시작됩니다. Table 5.11은 모재가 영하일 때 최소 20 °C 예열과 층간 유지를 요구합니다.',
      text:'원인은 예열입니다. 영하 삼 도의 모재에 예열 없이 용접하면 용접부가 급랭하고 수소가 비드 아래에 머뭅니다. 하중이 걸린 뒤 토우에서 지연 균열이 시작됩니다. 테이블 오 점 일일은 모재가 영하일 때 최소 이십 도 예열과 층간 유지를 요구합니다.' },
    n_cause_throat:   { label:'사고 원인', cap:'원인은 필러 선택입니다. 제출한 WPS의 E70T-1C는 아래보기·수평 전용이라 수직에서 비드가 흘러내립니다(이번 건의 E71T-1C와 두 번째 자리가 다릅니다). 유효 목두께가 모자라자 전단으로 파단됐습니다.',
      text:'원인은 필러 선택입니다. 이 칠십 티 원 시는 아래보기와 수평 전용이라 수직에서 비드가 흘러내립니다. 유효 목두께가 모자라자 전단으로 파단됐습니다.' },
    n_cause_fusion:   { label:'사고 원인', cap:'원인은 자세와 용입입니다. 수직 하진이나 아래보기 조건으로는 12 mm 판의 루트까지 용입이 들어가지 않습니다. 루트 경계에서 비드가 껍질처럼 박리됐습니다.',
      text:'원인은 자세와 용입입니다. 수직 하진이나 아래보기 조건으로는 십이 밀리 판의 루트까지 용입이 들어가지 않습니다. 루트 경계에서 비드가 껍질처럼 박리됐습니다.' },
    n_cause_porosity: { label:'사고 원인', cap:'원인은 가스 차폐입니다. 분류 문자와 다른 가스를 쓰거나, 3~4 m/s의 바람 속에서 방풍 없이 용접하면 차폐가 깨집니다. 비드 안에 기공이 벌집처럼 생겼습니다.',
      text:'원인은 가스 차폐입니다. 분류 문자와 다른 가스를 쓰거나, 초속 삼에서 사 미터의 바람 속에서 방풍 없이 용접하면 차폐가 깨집니다. 비드 안에 기공이 벌집처럼 생겼습니다.' },
    n_cause_reject:   { label:'사고 원인', cap:'원인은 근거 문서입니다. 모재 그룹이나 인정 방식이 규정과 맞지 않으면 사전인정도 시험 인정도 성립하지 않습니다. 감리는 근거 문서를 요구하며 절차서를 반려했습니다.',
      text:'원인은 근거 문서입니다. 모재 그룹이나 인정 방식이 규정과 맞지 않으면 사전인정도 시험 인정도 성립하지 않습니다. 감리는 근거 문서를 요구하며 절차서를 반려했습니다.' }
  },

  /* ── 장면 4: 성공 엔딩 — 음성 없는 문자 기록 + 효과음 ───────── */
  successLog: [
    { who:'박 팀장', time:'16:20', t:'이프로! 어제 그 절차서, 용접사가 그대로 보고 했어. 오전에 깔끔하게 끝났어.' },
    { who:'박 팀장', time:'16:21', t:'감리가 절차서를 보더니 “사전인정 근거까지 딱 맞네” 하더라. 아침에 예열 안 했으면 큰일 날 뻔했어.' },
    { who:'박 팀장', time:'16:22', t:'고마워 이프로. 덕분에 중요한 용접 잘 마무리했어.' }
  ],

  failLog: [
    { who:'박 팀장', time:'긴급', t:'이프로! 브래킷 필렛에서 금이 갔어! 지금 작업 중지했어. 감리가 절차서 다시 보재!' },
    { who:'박 팀장', time:'긴급', t:'빨리 와!' }
  ]
};

/* ── 장면 2: 브리핑 ─────────────────────────────────────── */
const BRIEF = {
  code: 'ST-401',
  detail: 'B-12',
  material: 'ASTM A36',
  materialNote: 'Fy 250 MPa · Table 5.6 Group I',
  thickness: '12 mm',
  thicknessNote: '웨브 · 브래킷 동일',
  joint: '보 웨브 – 브래킷',
  jointNote: 'T-Joint · 필렛 3F (인정 자세는 All)',
  leg: '6 mm 연속 · 양면',
  process: 'FCAW · CO₂ 반자동',
  date: '익일 07:00 착수',
  env: '오늘 현장 8 °C · 습도 62 %',
  /* 현장 상황 — 직접 열어야 보이는 단서 */
  drawer: [
    { icon:'🌡', title:'내일 날씨 예보', short:'07시 −3 °C · 서풍 3~4 m/s',
      body:'내일 07시 기온 <b>−3 °C</b>, 서풍 3~4 m/s, 습도 68 %. 오전에는 서리가 예상됩니다. (강수 없음)' },
    { icon:'📐', title:'현장 측정 기록', short:'루트 간격 1.5 mm · 직각도 0.8°',
      body:'브래킷–웨브 <b>루트 간격 실측 1.5 mm</b>(3개소 평균). 직각도 편차 <b>0.8°</b> — 허용 <b>±10°</b> 안입니다. 개선 없음, 기름·녹 없이 청정. 가접은 3개소, 본용접 후 제거 예정.' },
    { icon:'📁', title:'사내 절차서 목록', short:'WPS-A36-F01 Rev.0 · 사전인정',
      body:'<b>WPS-A36-F01 Rev.0</b> — A36 필렛, FCAW, E71T-1C, 100 % CO₂, <b>All 자세</b>, 사전인정(Supporting PQR: None). 이번에 개정해 다시 발행할 절차서입니다.<br>참고: <b>PQR-A36-04</b>(A36, 12 mm, 필렛, 시험 인정 기록)가 있지만, 사전인정으로 가는 이번 건에는 근거로 붙이지 않습니다.' },
    { icon:'🧰', title:'현장 장비·자재 재고', short:'E71T-1C Ø1.2 / Ø1.4 · E70T-1C Ø1.6',
      body:'CO₂ 반자동 용접기(DC, CV). 와이어 재고: <b>E71T-1C Ø1.2 mm·Ø1.4 mm</b>, E70T-1C Ø1.6 mm.<br><span style="color:#ffbd83">E70T-1C는 아래보기·수평 전용 분류</span>입니다. 수직에 쓰면 비드가 흘러내립니다.' }
  ]
};

/* ── 장면 3: 공백 WPS 칸 ────────────────────────────────
   kind: given(현장 정보를 그대로 옮겨 적기) | ask(원문을 보고 판단)
   cat : e(필수 Essential) | s(추가필수 Supplementary, CVN) | n(비필수 Nonessential)
   ui  : chips(보기 선택) | select(드롭다운) | number/text(직접 입력)
   pop : head=원문 위치, quote=영문 원문 발췌, table=표 발췌, ko=한글 해석, site=현장 의미
   ------------------------------------------------------------------ */
const CAT = {
  e:{ label:'필수', en:'Essential', tip:'바꾸면 새 WPS 또는 재인정이 필요합니다. (Table 5.5 (1)~(21), Table 6.6)' },
  s:{ label:'추가필수', en:'Supplementary Essential', tip:'충격시험(CVN)이 계약에 요구될 때만 추가로 재인정 대상이 됩니다. (Table 6.8)' },
  n:{ label:'비필수', en:'Nonessential', tip:'WPS에 적지만 규정 허용폭 안에서 바꿀 수 있는 값입니다. (Table 5.5 (22)~(31))' }
};

const FIELDS = [

  /* 01 이음 */
  { id:'joint', sec:1, label:'이음 형식', en:'Joint Type', kind:'given', cat:'e', ui:'chips',
    options:['Fillet weld (T, Corner joint)','Groove weld (V, CJP)','Fillet weld (Lap joint)','Groove weld (V, PJP)'],
    pop:{ kind:'field', title:'도면 ST-401 / B-12 — 접합 상세', ref:'도면 지시',
      body:'보 웨브에 브래킷을 직각으로 세워 붙입니다. 개선 없이 양면 필렛 6 mm 연속 — <b>Fillet weld (T, Corner joint)</b>에 해당합니다. 도면 상세 번호는 <b>TC-F12-GF</b>이고, 이 형상은 5.4.3과 Figure 5.3의 사전인정 T-joint 상세로 설명됩니다. 직각도는 <b>±10°</b> 안에서 관리합니다.',
      spec:{ ref:'AWS D1.1:2025 · 5.4.3 · Figure 5.3', quote:'5.4.3 Fillet Weld Details. See Table 7.7 for minimum fillet weld sizes and Figure 5.3 for prequalified fillet weld joint details.' } },
    answer:'Fillet weld (T, Corner joint)', weight:3,
    fb:'단면도를 다시 보세요. 웨브에 브래킷을 세운 T자 접합의 필렛이므로 맞대기(Groove)가 아닙니다.' },

  { id:'backing', sec:1, label:'받침판 · 뒷면 따내기', en:'Backing / Backgouging', kind:'ask', cat:'e', ui:'chips',
    options:['Backing 없음 · Backgouging 없음','철제 백킹 · Backgouging 없음','Backing 없음 · Backgouging 실시'],
    pop:{ title:'필렛에는 받침판도, 뒷면 따내기도 없다', ref:'5.4.1.2 · 5.4.3', page:'63–64',
      h:'5.4.1.2 Backing / 5.4.3 Fillet Weld Details',
      quote:'Prequalified CJP groove welds made from one side only, except as allowed for tubular structures, shall have steel backing. … See Table 7.7 for minimum fillet weld sizes and Figure 5.3 for prequalified fillet weld joint details.',
      ko:'받침판(backing)과 뒷면 따내기(backgouging)는 CJP·PJP 그루브 이음의 상세 변수입니다. 필렛 이음은 Clause 5의 필렛 상세(Figure 5.3)로 다루며, 받침판을 쓰지 않습니다. 사전인정 필렛의 Backing Material도 <b>None</b>입니다.',
      site:'필렛에 받침판을 대면 “루트가 벌어진 이음”으로 보여 감리 지적을 받습니다. 이 도면은 양면 필렛이라 뒷면 따내기도 필요 없습니다.' },
    answer:'Backing 없음 · Backgouging 없음', weight:3,
    fb:'필렛에는 받침판도 백가우징도 쓰지 않습니다. 그루브 용접 변수와 혼동했습니다.' },

  { id:'rootGap', sec:1, label:'루트 간격', en:'Root Opening (Fit-up)', kind:'ask', cat:'n', ui:'number',
    ph:'직접 입력', unit:'mm',
    pop:{ title:'최대 5 mm, 관리선은 2 mm', ref:'7.21.1 · p.204', page:'204',
      h:'7.21.1 Fillet Weld Assembly',
      quote:'The parts to be joined by fillet welds shall be brought into as close contact as practicable. The root opening shall not exceed 3/16 in [5 mm] except in cases involving either shapes or plates 3 in [75 mm] or greater in thickness if, after straightening and in assembly, the root opening cannot be closed sufficiently to meet this tolerance. In such cases, a maximum root opening of 5/16 in [8 mm] may be used, provided suitable backing is used. … If the separation is greater than 1/16 in [2 mm], the legs of the fillet weld shall be increased by the amount of the root opening, or the Contractor shall demonstrate that the effective throat has been obtained.',
      ko:'필렛 이음은 붙는 면을 최대한 밀착시킵니다. 루트 간격은 3/16 in(5 mm)을 넘지 않아야 하고, 75 mm 이상 후판에서 밀착이 어려울 때만 받침을 대고 5/16 in(8 mm)까지 허용합니다. 간격이 1/16 in(2 mm)를 넘으면 그 초과량만큼 필렛 각장을 늘려야 합니다.',
      site:'현장 실측 1.5 mm는 각장 보정 없이 시공할 수 있는 범위입니다. 2 mm를 넘으면 6 mm 각장에 초과량을 더해 8 mm로 잡고, 5 mm를 넘으면 용접할 수 없습니다. “2 mm 이하”가 관리 목표이고, “2 mm”는 보정이 시작되는 선입니다. 실측값을 직접 확인해 적으세요.',
      table:{ cap:'7.21.1 요약', rows:[
        ['0 ~ 2 mm', '밀착 관리 범위 · 각장 보정 없음'],
        ['2 mm 초과 ~ 5 mm', '초과량만큼 각장 증가 (6 → 8 mm 등)'],
        ['5 mm 초과', '용접 불가 · 이음 재조정'],
        ['후판 75 mm 이상', '받침 사용 시 8 mm까지 허용'] ] } },
    answer:{ min:0, max:2 }, weight:5,
    fb:'간격은 0~2 mm로 맞춥니다(각장 보정이 필요 없는 범위). 2 mm를 넘으면 초과량만큼 각장을 늘려야 하고, 5 mm를 넘으면 용접할 수 없습니다.' },

  { id:'filletSize', sec:1, label:'필렛 각장', en:'Fillet Weld Size', kind:'given', cat:'e', ui:'number',
    ph:'직접 입력', unit:'mm',
    pop:{ kind:'field', title:'도면 지시 각장 — 최소 각장표', ref:'도면 · 7.13 · Table 7.7',
      body:'설계 각장은 6 mm입니다. 두꺼운 쪽 모재 12 mm에서 요구되는 최소 필렛 크기(5 mm)를 만족합니다. <b>Minimum Size of Fillet Weld</b>는 T≤6: 3 mm(반복하중 5 mm), 6&lt;T≤12: 5 mm, 12&lt;T≤20: 6 mm, 20&lt;T: 8 mm입니다.',
      spec:{ ref:'AWS D1.1:2025 · 7.13 · Table 7.7',
        quote:'7.13 Minimum Fillet Weld Sizes. The minimum fillet weld size, except for fillet welds used to reinforce groove welds, shall be as shown in Table 7.7. The minimum fillet weld size shall apply in all cases, unless the design drawings specify welds of a larger size.',
        table:{ cap:'Table 7.7 — Minimum Fillet Weld Sizes', rows:[
          ['T < 6 mm','3 mm (반복하중 5 mm)'],['6 ≤ T < 12 mm','5 mm'],['12 ≤ T < 20 mm','6 mm'],['20 mm ≤ T','8 mm'] ] } } },
    answer:6, weight:4,
    fb:'도면 지시는 6 mm입니다. 최소 크기(5 mm) 이상이어야 하고, 도면이 더 큰 값을 지시하면 도면을 따릅니다(7.13).' },

  /* 02 모재 */
  { id:'baseMetal', sec:2, label:'모재 규격', en:'Base Metal Spec', kind:'given', cat:'e', ui:'select',
    options:['ASTM A36 or Equivalent','ASTM A992 or Equivalent','ASTM A572 Gr. 50 or Equivalent','ASTM A36 · ASTM A572 Gr. 50 병기'],
    pop:{ kind:'field', title:'자재 성적서 (입고분)', ref:'자재 성적서 · 5.3',
      body:'ASTM A36, 판 두께 12 mm. 항복강도 250 MPa급 탄소강 구조용 강재입니다. 사전인정 모재 표기에는 <b>ASTM A 36 or Equivalent</b>로 적고, Type or Grade는 <b>−</b>(없음)입니다.' },
    answer:'ASTM A36 or Equivalent', weight:3,
    fb:'규격 번호와 강종을 함께 적습니다. “or Equivalent”까지 적으면 감리 지적이 없습니다.' },

  { id:'group', sec:2, label:'모재 Group', en:'AWS Group No.', kind:'ask', cat:'e', ui:'chips', key:true,
    options:['Group I','Group II','I, II (두께에 따라)','Table 5.6 미등재'],
    pop:{ title:'A36은 Table 5.6 두 곳에 나온다', ref:'5.3 · Table 5.6', page:'63 · 73–75',
      h:'5.3 Base Metal',
      quote:'Only base metals listed in Table 5.6 may be used in prequalified WPSs. (For the qualification of listed base metals, and for base metals not listed in Table 5.6, see 6.2.1.)',
      ko:'사전인정 WPS에 쓸 수 있는 모재는 Table 5.6(Approved Base Metals for Prequalified WPSs)에 나열된 규격뿐입니다. ASTM A36은 <b>Group I에 &#34;≤ 3/4 in [20 mm]&#34;</b>로, <b>Group II에 &#34;All thicknesses&#34;</b>로 두 번 등재되어 있습니다.',
      site:'두께 12 mm는 20 mm 이하이므로 <b>Group I</b>입니다. 20 mm를 넘는 A36은 Group II로 적어야 합니다. 75 mm까지 한 장으로 덮으려면 두 Group을 함께 적습니다.',
      table:{ cap:'Table 5.6 발췌 — ASTM A36', rows:[
        ['Group I','ASTM A36 — ≤ 3/4 in [20 mm] · Fy 36 ksi [250 MPa]'],
        ['Group II','ASTM A36 — All thicknesses'],
        ['비교','ASTM A992·A572 Gr.50 → Group II · A53 Gr.B → Group I'] ] } },
    answer:['Group I','I, II (두께에 따라)'], weight:10, crit:true,
    fb:'12 mm A36은 Table 5.6의 Group I(≤20 mm)입니다. 20 mm를 넘는 A36을 함께 덮을 때만 Group II(All thicknesses)를 병기합니다.' },

  { id:'thickRange', sec:2, label:'인정 두께 범위', en:'Base Metal Thickness', kind:'ask', cat:'e', ui:'select',
    options:['Fillet Welds < 75 mm','Fillet Welds ≤ 20 mm','Groove Welds ≤ 25 mm','All thicknesses'],
    pop:{ title:'A36 필렛이 덮는 두께 범위', ref:'Table 5.6 · 7.21.1', page:'73–75 · 204',
      h:'Base Metal Thickness · Table 5.6',
      quote:'Table 5.6 — Group I: ASTM A36, ≤ 3/4 in [20 mm] / Group II: ASTM A36, All thicknesses.  7.21.1 … The root opening shall not exceed 3/16 in [5 mm] except in cases involving either shapes or plates 3 in [75 mm] or greater in thickness …',
      ko:'사전인정 WPS의 Base Metal Thickness 칸에는 적용 범위를 적습니다. A36은 두께에 따라 Group I(≤20 mm)·Group II(모든 두께)로 나뉘므로, <b>Fillet Welds &lt; 75 mm</b> 한 줄로 덮으려면 두 Group을 함께 적어 두어야 합니다.',
      site:'작업 두께 12 mm는 범위 안입니다. 75 mm는 D1.1이 루트 간격 예외(받침 사용 시 8 mm)를 두는 경계이자 관리 상한입니다. 그 위는 별도 절차서로 분리합니다.',
      table:{ cap:'두께별로 달라지는 것', rows:[
        ['3 ~ 20 mm','A36 Group I · 예열 0 °C (모재 0 °C 이상일 때)'],
        ['20 mm 초과','A36 Group II 로 표기 · 예열 10 °C'],
        ['38 mm 초과','예열 65 °C'],['65 mm 초과','예열 110 °C'] ] } },
    answer:'Fillet Welds < 75 mm', weight:6,
    fb:'필렛 인정 두께 범위는 “Fillet Welds < 75 mm”입니다. 12 mm 단일로 좁히면 다른 두께 개소에 쓸 수 없고, 75 mm 위는 예열·루트 간격 조건이 달라집니다.' },

  /* 03 용가재·전원 */
  { id:'process', sec:3, label:'용접 공정', en:'Process', kind:'given', cat:'e', ui:'select',
    options:['FCAW (Semi-auto)','GMAW (Semi-auto)','SMAW (Manual)','SAW (Automatic)'],
    pop:{ kind:'field', title:'현장 장비 구성', ref:'현장 장비 · 5.5.1',
      body:'CO₂ 반자동 용접기(DC, CV)에 플럭스 코어드 와이어를 걸어 씁니다. Process는 <b>FCAW</b>, Type은 <b>Semi-auto</b>입니다.',
      spec:{ ref:'AWS D1.1:2025 · 5.5.1',
        quote:'5.5.1 Prequalified Processes. SMAW, SAW, GMAW (except GMAW-S), and FCAW WPSs which conform to all of the provisions of Clause 5 shall be deemed as prequalified and are therefore approved for use without performing WPS qualification tests for the process.' } },
    answer:'FCAW (Semi-auto)', weight:3,
    fb:'장비와 와이어를 보면 플럭스 코어드(FCAW) 반자동입니다. GMAW(솔리드 와이어)와 구분하세요.' },

  { id:'polarity', sec:3, label:'전류 종류 · 극성', en:'Current & Polarity', kind:'ask', cat:'e', ui:'chips', key:true,
    options:['DC · DCEP (역극성)','DC · DCEN (정극성)','AC'],
    pop:{ title:'T-1 계열 와이어의 표준 극성', ref:'Table 5.5 (13)(14) · Table 6.6 (12)', page:'72 · 176',
      h:'Table 5.5 Essential Variables / Table 6.6 PQR Essential Variable Changes',
      quote:'Table 5.5 (13) Type of Current (AC or DC)  (14) Current Polarity (AC, DCEN, DCEP).  …  Table 6.6 (12) A change in type of current (ac or dc) or polarity (electrode positive or negative for dc current) [requires WPS requalification].',
      ko:'전류 종류(AC/DC)와 극성(DCEN/DCEP)은 WPS에 반드시 적어야 하는 필수변수입니다. 극성을 바꾸면 재인정이 필요합니다.',
      site:'T-1 계열 플럭스 코어드 와이어는 DCEP(와이어 +)로 분류됩니다. DCEN으로 바꾸면 아크가 불안정해지고 용입이 달라져 필수변수 위반입니다.' },
    answer:'DC · DCEP (역극성)', weight:7, crit:true,
    fb:'DCEN은 T-1 계열에 맞지 않습니다. 아크가 불안정해지고 기공·융합 불량이 생깁니다.' },

  { id:'wireDia', sec:3, label:'와이어(용접봉) 지름', en:'Electrode Diameter', kind:'ask', cat:'n', ui:'text', multi:true,
    ph:'예: 1.2 또는 1.2, 1.4, 1.6', unit:'mm', decimal:true,
    pop:{ title:'지름은 비필수 — 현장 재고에서 고르고, 여러 개를 한 번에 적어도 됩니다', ref:'Table 5.5 (7)(8) · 5.6', page:'72',
      h:'Table 5.5 (7) Nominal Electrode Diameter',
      quote:'(7) Nominal Electrode Diameter  …  Table 5.5 (22) Amperage + or − 10%  (23) Voltage + or − 15%.',
      ko:'전극 지름은 사전인정에서 <b>비필수</b> 변수입니다. 규정 허용폭 안의 지름 변경은 새 WPS를 요구하지 않습니다. 다만 지름에 따라 전류·가스 유량이 달라지므로 전류·전압과 함께 관리합니다.',
      site:'현장 재고는 E71T-1C Ø1.2·Ø1.4, E70T-1C Ø1.6입니다. 이 칸에는 <b>1.2</b>처럼 하나만 적어도 되고, <b>1.2, 1.4</b> 또는 <b>1.2/1.4/1.6</b>처럼 2~3개를 한 번에 적어도 됩니다(콤마 · 슬래시 · 띄어쓰기 모두 인식). 한 개든 여러 개든 합격입니다. 다만 검사 전에 지름별 적정 조건(노즐 높이·유량·전류)을 한 번은 짚어 보게 됩니다. Ø1.6은 용융지가 커져 12 mm 수직 필렛에서 흘러내리기 쉬우므로, 수직에 쓸 때는 전류를 낮춰 잡습니다.',
      table:{ cap:'와이어 지름별 통상 전류 (참고)', rows:[
        ['Ø1.2 mm','120 ~ 300 A · 28 ~ 30 V'],
        ['Ø1.4 mm','180 ~ 350 A · 28 ~ 30 V'],
        ['Ø1.6 mm','180 ~ 400 A · 28 ~ 30 V'] ] } },
    answer:'free', weight:2, lenient:true,
    fb:'와이어 지름은 비필수 항목입니다. 하나든 여러 개든 유효한 지름을 적으면 감점하지 않습니다.' },

  { id:'current', sec:3, label:'전류', en:'Amperage', kind:'ask', cat:'n', ui:'range',
    phMin:'최소', phMax:'최대', unit:'A', decimal:true,
    pop:{ title:'전류는 비필수 — 최소~최대 두 칸으로 적는다', ref:'Table 5.5 (10)(22)', page:'72',
      h:'Table 5.5 (10) Amperage',
      quote:'(10) Amperage (SAW, FCAW, GMAW)  …  (22) Amperage + or − 10%.',
      ko:'전류는 WPS에 적는 값이지만 사전인정에서 <b>비필수</b> 항목입니다. 허용폭(±10 %) 안의 변경은 재인정 없이 가능합니다. WPS에는 보통 현장에서 쓸 범위를 <b>최소~최대</b>로 적습니다.',
      site:'이번 시공 조건은 260 A입니다. 왼쪽 칸에 최소, 오른쪽 칸에 최대를 나눠 적으세요. 예: <b>240 ~ 280</b>처럼 실제값을 범위 가운데 두는 것이 원칙입니다. 사전인정·PQR로 인정한 범위가 있으면 그 허용폭(전류 ±10 %라면 약 234 ~ 286 A) 안에서 잡습니다. 두 칸을 모두 채우지 않아도 되고, 한 칸만 적어도 통과합니다. 최대가 최소보다 작으면 오류로 표시되지만, 값 자체로 감점하지는 않습니다.',
      table:{ cap:'지름별 통상 전류 (참고)', rows:[
        ['Ø1.2 mm','120 ~ 300 A'],['Ø1.4 mm','180 ~ 350 A'],['Ø1.6 mm','180 ~ 400 A'] ] } },
    answer:'free', weight:2, lenient:true,
    fb:'전류는 비필수 항목입니다. 최소~최대 두 칸에 유효한 수치를 적으면 통과합니다.' },

  { id:'voltage', sec:3, label:'전압', en:'Voltage', kind:'ask', cat:'n', ui:'range',
    phMin:'최소', phMax:'최대', unit:'V', decimal:true,
    pop:{ title:'전압은 비필수 — 입열량 계산의 입력값', ref:'Table 5.5 (11)(23) · 6.8.5', page:'72 · 130',
      h:'Table 5.5 (11) Voltage',
      quote:'(11) Voltage (SAW, FCAW, GMAW)  …  (23) Voltage + or − 15%.',
      ko:'전압도 <b>비필수</b> 항목입니다. 다만 입열량을 계산할 때 전압이 그대로 들어가므로, 적어 둔 값과 계산에 쓴 값이 같아야 합니다. 범위로 적을 때는 입열량 계산에 쓴 전압이 그 범위 안에 있으면 됩니다.',
      site:'이번 시공 조건은 29 V입니다. <b>28 ~ 30</b>처럼 실제값을 가운데 둔 범위로 두 칸에 나눠 적으세요. 한 칸만 적어도 통과하고, 값 자체로 감점하지는 않습니다.' },
    answer:'free', weight:2, lenient:true,
    fb:'전압은 비필수 항목입니다. 최소~최대 두 칸에 유효한 수치를 적으면 통과합니다.' },

  { id:'filler', sec:3, label:'필러 분류', en:'Filler Classification', kind:'ask', cat:'e', ui:'chips', key:true,
    options:['E71T-1C (A5.20)','E70T-1C (A5.20)','E71T-1M (A5.20)','ER70S-6 (A5.18)'],
    pop:{ title:'강도·자세·가스까지 맞춘다', ref:'5.6 · Table 5.7', page:'65 · 105',
      h:'5.6 Filler Metal and Shielding Gas',
      quote:'Only filler metals listed in Table 5.7 may be used in prequalified WPSs. … Table 5.7, Group I/II — FCAW: E7XT-X, E7XT-XC, E7XT-XM (electrodes with the −2C, −2M, −3, −10, −13, −14, and −GS suffix shall be excluded …).',
      ko:'사전인정 필러는 Table 5.7 등재 분류입니다. FCAW는 E7XT-X, E7XT-XC, E7XT-XM이 Group I·II에 해당합니다. 분류 기호에서 70은 480 MPa급(70 ksi) 인장, T-1의 1은 전자세, 끝의 C는 100 % CO₂, M은 Ar 혼합입니다.',
      site:'A36(Group I)에 E71T-1C는 Table 5.7 그대로 맞습니다. 반대로 E70T-1C는 아래보기·수평 전용이라 수직에서 비드가 흘러내립니다. 재고에 있다고 맞는 와이어가 아닙니다. 저수소 관리가 필요한 현장이라면 A5.20의 확산성 수소 지시자(−H4 등)를 붙인 제품으로 발주하는지도 확인합니다.' },
    answer:'E71T-1C (A5.20)', weight:10, crit:true,
    fb:'E70T-1C는 아래보기·수평 전용이라 수직 3F에서 비드가 흘러내립니다. 재고에 있다고 맞는 와이어는 아닙니다.' },

  { id:'fano', sec:3, label:'F-No. / A-No.', en:'Referenced ASME No.', kind:'ask', cat:'n', ui:'chips',
    options:['참고 F-6 / A-1','N/A (D1.1 비적용)','참고 F-6 / A-2','참고 F-4 / A-1'],
    pop:{ title:'이 칸은 ASME에서 온 표기입니다', ref:'Table 5.5 (5) · ASME IX QW-432·442', page:'72',
      h:'Table 5.5 Essential Variables for Prequalified WPSs',
      quote:'(5) Filler Metal Classification (SMAW, GMAW, FCAW).',
      ko:'D1.1은 F-No./A-No.를 쓰지 않고 AWS A5.X 분류로 필러를 관리합니다. F-No./A-No.는 ASME Sec. IX(QW-432·QW-442)의 분류 체계입니다.',
      site:'절차서 서식이 ASME에서 온 칸입니다. D1.1 근거는 E71T-1C이므로 “N/A”로 두거나, 참고값 F-6(플럭스 코어드)·A-1(탄소강)을 적습니다. 둘 다 인정합니다.' },
    answer:['참고 F-6 / A-1','N/A (D1.1 비적용)'], weight:3,
    fb:'E71T-1C는 ASME 기준 F-6, 탄소강은 A-1입니다. D1.1 근거는 AWS 분류(Table 5.7)이므로 “N/A”로 두어도 맞습니다. 둘 다 인정합니다.' },

  { id:'gas', sec:3, label:'차폐가스 · 유량', en:'Shielding Gas', kind:'ask', cat:'e', ui:'chips',
    options:['100% CO₂ · 15–30 L/min · Nozzle #4','Ar 75~80% + CO₂ · 15–30 L/min','100% Ar · 15–30 L/min','100% CO₂ · 5–10 L/min'],
    pop:{ title:'분류 문자와 내일 바람을 함께 본다', ref:'5.6.4 · Table 5.5 (17)(18)', page:'66 · 72',
      h:'5.6.4 Shielding Gas',
      quote:'Shielding gases for GMAW and FCAW-G shall conform to AWS A5.32M/A5.32 … (1) The shielding gas shall be that used for electrode classification per the applicable AWS A5 specifications … For FCAW-G, the filler metal shall have been classified by the filler metal manufacturer as an “−M” (i.e., mixed gas) product.',
      ko:'차폐가스는 필러 분류의 가스 문자와 같아야 합니다. 끝이 C면 100 % CO₂, M이면 Ar 혼합입니다. 가스 조성과 유량은 사전인정 WPS의 필수변수입니다(Table 5.5 (17)(18)).',
      site:'내일 서풍 3~4 m/s 예보입니다. 방풍을 세우지 않으면 차폐가 깨져 기공이 생깁니다. 15~30 L/min 중 상단으로 잡고 방풍을 조건에 넣습니다.' },
    answer:'100% CO₂ · 15–30 L/min · Nozzle #4', weight:7, crit:true,
    fb:'분류가 E71T-1<b>C</b>이므로 100 % CO₂입니다. Ar 혼합은 가스 문자(M)와 성분이 달라져 재인정 대상이고, 바람 3~4 m/s에서 방풍이 없으면 차폐가 깨져 기공이 생깁니다.' },

  /* 04 자세·열 */
  { id:'position', sec:4, label:'자세 · 진행 방향', en:'Position / Progression', kind:'ask', cat:'e', ui:'chips', key:true,
    options:['All (F·V·H·OH) · 수직 상진','3F · 수직 상진','3F · 수직 하진','1F · 아래보기'],
    pop:{ title:'All로 써도 되지만, 수직은 상진뿐', ref:'5.8.1.1 · Table 5.5 (2)', page:'67 · 72',
      h:'5.8.1.1 Vertical-Up Welding Requirements',
      quote:'The progression for all passes in vertical position welding shall be upward, with the following exceptions: (1) Undercut may be repaired vertically downwards when preheat is in conformance with Table 5.11, but not lower than 70 °F [20 °C]. …',
      ko:'자세(Position)는 WPS의 필수변수입니다(Table 5.5 (2)). 사전인정 필렛은 자세 제한이 없어 <b>All</b>로 적을 수 있고, Vertical Progression은 <b>Up Hill</b>입니다. 다만 수직 자세의 모든 패스는 상진이 원칙입니다(5.8.1.1).',
      site:'현장 이번 개소는 3F 한 곳이지만, 한 장으로 여러 개소를 덮으려면 All로 발행합니다. All은 F·V·H·OH를 포괄하는 표기이고, V에서는 상진만 인정됩니다. 하진으로 적으면 그 순간 사전인정이 깨집니다.' },
    answer:'All (F·V·H·OH) · 수직 상진', weight:7, crit:true,
    fb:'사전인정 필렛은 All로 발행할 수 있고, 수직은 상진(Up Hill)만 인정됩니다. 하진이나 1F 단일 표기는 이 현장의 3F를 덮지 못합니다.' },

  { id:'preheat', sec:4, label:'예열 온도', en:'Preheat (min)', kind:'ask', cat:'e', ui:'number',
    ph:'직접 입력', unit:'°C', key:true,
    pop:{ title:'강재 범주 · 두께 · 그리고 모재 온도', ref:'5.7.1 · Table 5.11', page:'66 · 81–84',
      h:'5.7.1 Minimum Preheat and Interpass Temperature Requirements',
      quote:'Table 5.11 shall be used to determine the minimum preheat and interpass temperatures for steels listed in the code. … Table 5.11, footnote a: When the base metal temperature is below 32 °F [0 °C], the base metal shall be preheated to a minimum of 70 °F [20 °C] and the minimum interpass temperature shall be maintained during welding.',
      ko:'예열·층간 온도는 Table 5.11로 정합니다. A36 Category B, 저수소 공정(FCAW), 12 mm는 최소 0 °C이지만, 모재 온도가 0 °C 미만이면 70 °F(20 °C)까지 예열하고 층간에도 유지해야 합니다(Table 5.11 주 a). WPS에는 이 값을 <b>최소 예열 온도</b>로 적습니다.',
      site:'내일 07시 −3 °C입니다. “작년엔 그냥 했다”는 근거가 되지 못합니다. 현장 상황의 내일 예보와 Table 5.11을 함께 보고, 최소 예열 온도를 숫자로 직접 적으세요. 층간 온도도 같은 값 이상으로 유지합니다.',
      table:{ cap:'Table 5.11 (Category B · 저수소 공정)', rows:[
        ['3 ~ 20 mm','최소 0 °C'],['20 mm 초과 ~ 38 mm','10 °C'],['38 mm 초과 ~ 65 mm','65 °C'],['65 mm 초과','110 °C'],['모재 0 °C 미만','최소 20 °C 예열 + 층간 유지'] ] } },
    answer:{ min:20, max:30 }, weight:10, crit:true,
    fb:'내일 07시 −3 °C입니다. 모재가 빙점 아래이므로 0 °C가 아니라 20 °C 예열이 필요합니다. 최소 예열 온도를 숫자로 적어야 합니다.' },

  { id:'heatInput', sec:4, label:'입열량', en:'Heat Input', kind:'ask', cat:'s', ui:'number',
    ph:'직접 계산해 입력', unit:'kJ/mm',
    pop:{ title:'조건을 보고 직접 계산해 적는다', ref:'Table 6.8 (10) · 6.8.5', page:'181 · 130',
      h:'Table 6.8 — PQR Supplementary Essential Variable Changes for CVN Testing Applications',
      quote:'(10) An increase in heat input over that qualified (see 6.8.5).  …  6.8.5 Heat Input. When CVN testing is required by the contract documents, heat input shall be calculated as follows: Heat input = (60 × A × Volts) / TS.',
      ko:'입열량은 충격시험(CVN)이 계약에 요구될 때만 추가로 관리하는 변수입니다(Table 6.8). 시험에서 인정한 값보다 커지면 재인정 대상입니다. 계산식은 <b>H = (60 × 전압 × 전류) ÷ (1000 × 용접속도)</b>이고 단위는 kJ/mm입니다. 전압은 V, 전류는 A, 용접속도는 mm/min으로 넣습니다.',
      calc:{ cap:'이번 시공 조건 — 직접 대입해 계산', rows:[
        ['전압 (E)','29 V'],['전류 (I)','260 A'],['용접속도 (v)','300 mm/min'],['계산식','H = (60 × E × I) ÷ (1000 × v)'] ],
        note:'계산 결과는 소수 둘째 자리까지 적으세요. 정답을 대신 넣어 주는 버튼은 없습니다.' },
      site:'이번 건은 충격시험이 요구되지 않지만, 시공 기록으로 입열량을 남깁니다. 전류나 전압을 올리면 입열량이 비례해 올라가고, 속도를 올리면 내려갑니다. 위 세 값으로 직접 계산해 적으세요.' },
    answer:{ min:1.45, max:1.56 }, weight:3,
    fb:'H = (60 × 29 × 260) ÷ (1000 × 300) = 1.51 kJ/mm 입니다. 공란으로 두지 말고 조건에서 계산해 기재합니다.' },

  { id:'pwht', sec:4, label:'용접후열처리', en:'PWHT', kind:'ask', cat:'e', ui:'chips',
    options:['없음 (None)','620 °C · 1 h','565 °C · 2 h','315 °C · 1 h'],
    pop:{ title:'도면·계약에 요구가 있는가', ref:'5.9 · Table 5.5 (21)', page:'67 · 72',
      h:'5.9 Postweld Heat Treatment',
      quote:'Postweld heat treatment (PWHT) shall be prequalified provided that it shall be approved by the Engineer and the following conditions shall be met: (1) The specified minimum yield strength of the base metal shall not exceed 50 ksi [345 MPa]. (2) The base metal shall not be manufactured by quenching and tempering (Q&T) … (5) PWHT shall be conducted in conformance with 7.8.',
      ko:'PWHT는 WPS에 적어야 하는 필수변수입니다(Table 5.5 (21)). Clause 5.9는 조건을 만족하고 엔지니어 승인을 받을 때만 사전인정하며, 도면·계약에 요구가 없으면 “None”으로 둡니다.',
      site:'이 도면에는 PWHT 요구가 없습니다. 근거 없이 넣으면 일정과 비용만 늘고 변형 위험이 커집니다.' },
    answer:'없음 (None)', weight:2,
    fb:'도면에 PWHT 요구가 없습니다. 근거 없이 넣으면 일정과 비용만 늘고 변형 위험이 커집니다.' },

  /* 05 판정 */
  { id:'prequal', sec:5, label:'인정 방식 · 근거', en:'Prequalified or Qualified', kind:'ask', cat:'e', ui:'chips', key:true,
    options:['Prequalified (Clause 5) — PQR 없음','Qualified (Clause 6) — PQR 필요','SWPS(표준 WPS) 구매'],
    pop:{ title:'A36은 사전인정으로 갈 수 있다', ref:'5.1 · 6.2.1 · Annex J J2', page:'62 · 128 · 407',
      h:'5.1 Scope / Annex J J2. Prequalified WPSs',
      quote:'Prequalification of WPSs shall be defined as exempt from the WPS qualification testing required in Clause 6. … In order for a WPS to be prequalified, conformance with all of the applicable requirements of Clause 5 shall be required.  … Annex J, J2: J2 is sufficient for the purpose of documenting prequalified WPSs.',
      ko:'사전인정은 Clause 5의 모든 요구(모재·이음·공정·필러·예열·변수)를 만족할 때 성립하고, 그러면 Clause 6 시험이 면제됩니다. A36은 Table 5.6 등재 강재라 사전인정이 가능하고, Annex J의 서식 요건으로 사전인정 WPS를 기록합니다. 그래서 Supporting PQR은 <b>None (Prequalified)</b>입니다.',
      site:'시험 인정(Clause 6)로 가는 것 자체가 위법은 아니지만, 이 건은 A36·E71T-1C·100 % CO₂·DCEP·All이 모두 Clause 5 안에 있으므로 PQR 없이 한 장으로 끝납니다. 다만 조건을 하나라도 벗어나면 그 순간 시험이 필요해집니다.' },
    answer:'Prequalified (Clause 5) — PQR 없음', weight:8,
    fb:'A36은 Table 5.6 등재 강재이므로, Clause 5 조건을 지키면 PQR 없이 사전인정 WPS로 발행합니다(Supporting PQR: None).' }
];

/* ── 합격 후 '생각해 볼 사항' — 와이어(용접봉) 지름별 적정 조건과 경제성 ──
   출처: 배포 교재 p.100 「노즐 높이에 대한 가스의 적정 유량」 표,
        제2장 용접 이음 설계 p.425 예제 2 「같은 목 두께 필릿 용접의 단면적 비교」 해설 */
const WIRE_GUIDE = {
  title: '와이어(용접봉) 지름에 따른 생각해 볼 사항',
  sub: '같은 WPS라도 현장에서 어느 지름을 거느냐에 따라 적정 조건과 원가가 달라집니다. 내가 적은 지름을 기준으로 세 가지만 짚어 봅니다.',
  nozzle: {
    cap: '① 노즐 높이에 대한 가스의 적정 유량',
    src: '교재 p.100',
    head: ['와이어 지름', '노즐 높이 (mm)', '가스 유량 (L/min)', '전류 (A)'],
    groups: [
      { dia: ['1.2', '1.4'], label: 'Ø1.2 / Ø1.4', rows: [
        ['10~15', '15~20', '100'],
        ['15', '20', '200'],
        ['20~25', '20', '300'] ] },
      { dia: ['1.6'], label: 'Ø1.6', rows: [
        ['20', '20', '300'],
        ['20', '20', '350'],
        ['20~25', '20~25', '400'] ] }
    ],
    note: '표의 전류는 그 노즐 높이와 유량을 쓰는 전류 구간입니다(와이어가 안정적으로 쓰이는 범위라는 뜻이 아닙니다). 전류를 올리면 아크·용융지·스패터가 커져 노즐을 더 띄우게 되고, 차폐를 지키려면 유량도 함께 올려야 합니다. 필요 이상으로 틀면 가스만 낭비되고 와류로 오히려 차폐가 흐트러집니다.'
  },
  stickout: {
    cap: '② 와이어 돌출 길이 (Stick-out)',
    src: '교재 p.100',
    body: '와이어 돌출 길이는 <b>아크 안정성·비드 형상·용입·작업 능률</b>에 큰 영향을 줍니다. 길게 빼면 와이어 저항 가열이 늘어 <b>전류가 떨어지고</b> 아크가 흔들려 용입이 얕고 비드가 좁아집니다. 짧게 넣으면 노즐이 과열되고 스패터가 붙습니다. 가스 실드 FCAW Ø1.2는 통상 <b>15~25 mm</b>에서 씁니다(제조사 데이터시트 기준). 노즐–모재 거리는 돌출 길이에 리세스(팁 들어감)를 더한 값이라, 위 표의 노즐 높이와 같은 값으로 보면 안 됩니다.'
  },
  econ: {
    cap: '③ 같은 목 두께를 얻는 이음 형식별 단면적 비교',
    src: '교재 p.425 · 예제 2',
    note: '교재 예제는 피복 아크(SMAW) 기준이라 “용접봉”으로 적혀 있습니다. 이 앱은 FCAW이므로 “와이어”로 읽으세요. (b)~(d)는 순수 필릿이 아니라 <b>베벨 그루브(PJP) + 필릿</b> 형식입니다. 이번 개소(개선 없는 6 mm 필릿)와는 이음 형식이 다르고, “설계가 용착량을 어떻게 줄이는가”를 보는 예제입니다.',
    cases: [
      { id: 'a', area: '100', name: '같은 다리길이 필릿 — 양면 합계',
        desc: '목 두께를 확보하려고 양면 필릿으로 쌓은 기본형. 단면적이 가장 커 용착량과 패스 수가 가장 많다.' },
      { id: 'b', area: '50', name: '한쪽 45° 베벨 · 받침 없음',
        desc: '단면적은 (a)의 1/2이지만, 홈 각 45° 가공에 모서리 1차 비드를 가는 용접봉과 낮은 전류로 해야 해서 비경제적.' },
      { id: 'c', area: '50', name: '한 면 45° 베벨 + 같은 다리길이 필릿',
        desc: '필릿으로 보강부를 붙인 형상. 역시 45° 베벨·가는 용접봉·낮은 전류라 비경제적.' },
      { id: 'd', area: '57.8', name: '한 면 60° 베벨 + 같은 다리길이 필릿',
        desc: '단면적은 (a)의 57.8 %이지만, 홈 각 60°라 굵은 용접봉·높은 전류를 쓸 수 있어 가장 경제적.', best: true }
    ],
    points: [
      '경제성은 단면적만으로 정해지지 않습니다. <b>홈 각도 → 쓸 수 있는 용접봉 지름 → 전류 → 패스 수</b>가 함께 결정합니다.',
      '45°는 각이 좁아 굵은 용접봉이 들어가기 어렵고, 루트 용입을 위해 가는 용접봉·낮은 전류로 여러 패스를 쌓아야 합니다.',
      '60°는 같은 목 두께를 확보하면서 굵은 용접봉·높은 전류를 쓸 수 있어 용착 속도와 패스 수에서 유리합니다.',
      '설계(이음 형식·홈 각)가 먼저이고, WPS는 그 설계가 허용하는 지름·전류를 기록합니다. 순서를 뒤집으면 “맞는 절차서”는 있어도 “경제적인 절차서”는 없습니다.'
    ],
    caveat: '이 비교는 <b>같은 목 두께·같은 공정·같은 자세</b>에서만 성립합니다. 실제 경제성은 용착량 외에 <b>개선 가공비, 맞춤(fit-up) 정밀도, 변형·교정, 접근성, 검사 방법</b>까지 합산해 결정합니다. 판이 두꺼워지면 각도 차이에 따른 용착량 차가 커져 답이 달라질 수 있고, 강도상 완전용입(CJP)이 요구되면 이 비교 자체가 해당되지 않습니다. 각도는 설계자가 정하고, 용접 기술자는 그 각도에서 실제로 들어가는 와이어·전류를 WPS로 증명합니다.'
  },
  apply: {
    cap: '이번 개소(12 mm T-joint · 6 mm 필릿 · 3F)에 적용하면',
    items: [
      '<b>Ø1.2</b> — 6 mm 필릿의 기본. 이번 260 A는 교재 표의 200~300 A 구간이므로 노즐 15~20 mm, 20 L/min 근처가 기준점입니다.',
      '<b>Ø1.4</b> — 용착량이 늘어 공수를 줄일 수 있지만, 수직에서는 전류를 올릴수록 비드가 흘러내리므로 입열과 운봉을 함께 봅니다.',
      '<b>Ø1.6</b> — 300~400 A를 쓰는 아래보기·수평이나 두꺼운 각장에서 힘을 발휘합니다. 12 mm 수직 6 mm 필릿에는 과한 선택입니다.',
      '지름을 2~3개 적었다면 실제 WPS에서는 <b>지름별로 전류·전압 행을 나눠</b> 적습니다(이 앱은 전류·전압을 한 번만 받습니다).'
    ],
    checks: [
      '<b>바람</b> — 가스 실드 공정은 풍속 약 5 mph[8 km/h]를 넘으면 방풍 조치가 필요합니다. 내일 서풍 3~4 m/s는 이 기준 안이지만, 개방된 철골 위에서는 순간 풍속을 봅니다.',
      '<b>유량 측정</b> — 레귤레이터 눈금이 아니라 노즐 끝에서 잽니다(호스 누설·긴 호스 보정).',
      '<b>진행 방향</b> — 3F는 상진(Up hill)이 필수 기재 사항이고, 하진으로 바꾸면 재인정 대상입니다.',
      '<b>가스와 분류 기호</b> — E71T-1C의 C는 100 % CO₂용입니다. Ar 혼합(M)으로 바꾸면 분류 자체가 달라집니다.',
      '<b>슬래그·보관</b> — 패스 사이 슬래그 제거, 개봉 후 와이어 흡습 관리(H 기호 확인)를 함께 봅니다.'
    ]
  }
};

const SECTIONS = {  1:{ n:'01', ko:'이음', en:'Joint' },
  2:{ n:'02', ko:'모재', en:'Base Metal' },
  3:{ n:'03', ko:'용가재 · 전원', en:'Filler & Power' },
  4:{ n:'04', ko:'자세 · 열처리', en:'Position & Heat' },
  5:{ n:'05', ko:'적용 판정', en:'Applicability' }
};

/* 합격 기준: 치명 오류 0건 그리고 80점 이상 */
const PASS_RULE = { minScore: 80 };

/* 치명 오류별 파단 연출 유형 (첫 번째 치명 오류로 결정) */
const FRACTURE_TYPES = {
  preheat:   { id:'hydrogen', label:'수소 지연 균열', where:'토우부', cause:'n_cause_hydrogen',
    desc:'예열 없이 영하 모재에 용접했습니다. 수소가 비드 아래에 머물다 하중이 걸린 뒤 토우에서 균열이 시작됐습니다.' },
  filler:    { id:'throat',   label:'비드 처짐 · 목두께 부족', where:'목두께', cause:'n_cause_throat',
    desc:'E70T-1C(아래보기·수평 전용)를 수직에 써서 비드가 흘러내렸습니다. 유효 목두께가 모자라 전단 파단됐습니다.' },
  position:  { id:'fusion',   label:'융합 불량', where:'루트부', cause:'n_cause_fusion',
    desc:'하진·1F 조건으로 12 mm 판에 용입이 들어가지 않았습니다. 루트 경계에서 비드가 껍질처럼 박리됐습니다.' },
  polarity:  { id:'fusion', label:'융합 불량 · 스패터', where:'루트부', cause:'n_cause_fusion',
    desc:'DCEN으로 아크가 불안정해 스패터가 늘고 용입이 들어가지 않았습니다. 루트 경계에서 비드가 박리되며 파단됐습니다.' },
  gas:       { id:'porosity', label:'기공 · 가스 차폐 불량', where:'비드 내부', cause:'n_cause_porosity',
    desc:'분류(C)와 다른 가스이거나, 바람 3~4 m/s에서 방풍 없이 용접해 차폐가 깨졌습니다. 비드에 기공이 벌집처럼 생겼습니다.' },
  group:     { id:'reject',   label:'근거 없는 절차서', where:'—', cause:'n_cause_reject',
    desc:'A36을 Table 5.6에 없는 강재처럼 적거나 Group을 틀리게 적었습니다. 감리가 근거 문서를 요구하며 절차를 반려했습니다.' },
  prequal:   { id:'reject',   label:'근거 없는 절차서', where:'—', cause:'n_cause_reject',
    desc:'인정 근거(사전인정 또는 PQR)가 서류와 맞지 않았습니다. 감리 반려 후 용접이 중지됐습니다.' },
  default:   { id:'hydrogen', label:'균열', where:'토우부', cause:'n_cause_hydrogen',
    desc:'절차서의 필수변수가 현장 조건과 맞지 않아 용접부가 하중을 견디지 못했습니다.' }
};
