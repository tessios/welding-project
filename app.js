/* =========================================================================
   WPS 실습실 — AWS D1.1 · Carbon Steel (교육용)
   상태 저장: localStorage  ·  서버 없음
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- helpers */
  const KEY = 'wpsD11.v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
  const fmt = (n, d) => {
    if (n === Infinity) return '무제한';
    const r = Math.round(n * Math.pow(10, d || 1)) / Math.pow(10, d || 1);
    return String(r);
  };
  const mmss = (ms) => {
    const t = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(t / 60), s = t % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };

  /* ---------------------------------------------------------------- state */
  const blank = () => ({
    v: 1, name: '', session: null, startedAt: Date.now(), elapsed: 0,
    current: 's0',
    visited: [], readVisited: [], guide: 0, readMode: 'tour', readSel: 4,
    quest: {}, sim: { asked: [], answers: {} },
    draft: null, hints: {}, lock: null,
    attempts: [], cardIdx: 0
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const o = JSON.parse(raw);
      if (!o || o.v !== 1) return blank();
      return Object.assign(blank(), o);
    } catch (e) { return blank(); }
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  /* ---------------------------------------------------------------- engine */
  function baseByKey(spec, grade) {
    return BASE_METALS.find(b => b.spec === spec && b.grade === grade) || null;
  }
  function preheatCalc(base, filler, tmm) {
    if (!base || base.cat === '-') return null;
    let cat = base.cat;
    if (filler && filler.lowH === false && (cat === 'B' || cat === 'A')) cat = 'A';
    if (filler && filler.lowH === true && cat === 'A') cat = 'B';
    const t = num(tmm);
    if (!(t > 0)) return null;
    let band = 0;
    if (t > 65) band = 3; else if (t > 38) band = 2; else if (t > 20) band = 1;
    const c = PREHEAT.cats[cat];
    return { cat: cat, band: band, minC: c.c[band], minF: c.f[band], name: c.name, bandLabel: PREHEAT.bands[band] };
  }
  function thicknessRange(T) { return THICKNESS_RULE.calc(num(T)); }
  function heatInput(amp, volt, speedCm) {
    const a = num(amp), v = num(volt), s = num(speedCm);
    if (!(a > 0 && v > 0 && s > 0)) return NaN;
    return Math.round((v * a * 60) / (1000 * s * 10) * 100) / 100;
  }
  function posQual(testPos) {
    const p = POSITIONS.find(x => x.test === testPos);
    return p ? p.qualifies : '—';
  }
  function fillerByClass(cls) { return FILLERS.find(f => f.class === cls) || null; }

  /* ---------------------------------------------------------------- toast */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  }

  /* ---------------------------------------------------------------- progress */
  function questRight() { return QUESTS.filter(q => S.quest[q.id] === q.answer).length; }
  function readDone() { return S.readVisited.length >= 12 && questRight() >= 2; }
  function simAnswered() {
    return Object.keys(S.sim.answers).filter(k => {
      const v = S.sim.answers[k];
      return v && v.cls != null && v.act != null;
    }).length;
  }
  function simDone() { return simAnswered() >= 3; }
  function hasResult() { return S.attempts.length > 0; }

  const STEPS = [
    { id: 's0', label: '시작' },
    { id: 's1', label: '이론' },
    { id: 's2', label: '독도' },
    { id: 's3', label: '시뮬' },
    { id: 's4', label: '작성' },
    { id: 's5', label: '채점' }
  ];
  function stepEnabled(id) {
    if (id === 's0' || id === 's1') return true;
    if (id === 's2') return !!S.session;
    if (id === 's3') return S.session === 'practice' ? !!S.session : readDone();
    if (id === 's4') return simDone() || readDone() || S.session === 'practice';
    if (id === 's5') return hasResult();
    return true;
  }
  function renderStepper() {
    const nav = $('#stepper');
    nav.innerHTML = STEPS.map(st => {
      const on = S.current === st.id ? 'on' : '';
      const done = (st.id === 's2' && readDone()) || (st.id === 's3' && simDone()) || (st.id === 's5' && hasResult()) ? 'done' : '';
      const dis = stepEnabled(st.id) ? '' : 'disabled';
      return `<button type="button" class="step ${on} ${done}" data-go="${st.id}" ${dis}>
        <span class="num">${st.id === 's0' ? '⌂' : st.id.slice(1)}</span>${st.label}</button>`;
    }).join('');
    $$('#stepper .step').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  }

  /* ---------------------------------------------------------------- routing */
  function go(id, opts) {
    if (!stepEnabled(id) && !(opts && opts.force)) {
      toast(guardMsg(id));
      return;
    }
    S.current = id; save();
    $$('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    renderStepper();
    const render = {
      s0: renderHome, s1: renderCards, s2: renderReader,
      s3: renderSim, s4: renderWizard, s5: renderResult, s6: renderReview
    }[id];
    if (render) render(opts || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function guardMsg(id) {
    if (id === 's2') return '먼저 세션을 시작해 주세요.';
    if (id === 's3') return '독도 12포인트를 모두 보고 퀘스트 2문제를 맞히면 열립니다.';
    if (id === 's4') return '시뮬레이터 시나리오 3개를 판정하면 열립니다.';
    if (id === 's5') return 'WPS 작성을 제출하면 채점 결과가 열립니다.';
    return '아직 열 수 없습니다.';
  }

  /* ================================================================= S0 */
  function renderHome() {
    const pct = Math.round((S.readVisited.length / 12) * 100 * 0.5 + (Math.min(3, Object.keys(S.sim.answers).length) / 3) * 30 + (hasResult() ? 20 : 0));
    const best = S.attempts.length ? Math.max.apply(null, S.attempts.map(a => a.score)) : null;
    const last = S.attempts.length ? S.attempts[S.attempts.length - 1] : null;
    $('#s0').innerHTML = `
    <div class="hero">
      <div class="card pad">
        <div class="eyebrow">${esc(APP.edition)}</div>
        <h1 class="h1">WPS 한 장을, 18분에 읽고 쓰는 법</h1>
        <p class="lead" style="color:var(--ink2)">
          슬라이드 「1. WPS 보는법」의 <b>1~12번 독도 순서</b>를 그대로 따라가며, 탄소강 구조물(AWS D1.1) 기준으로
          값을 읽고 · 변수를 바꿔 보고 · 빈 양식을 직접 채워 채점받습니다.
        </p>
        <div class="grid3" style="margin:14px 0 4px">
          <div class="out" style="margin:0"><div class="k">강종</div><div class="v">Carbon Steel</div><div class="why">A36 · A572 Gr.50 · A992</div></div>
          <div class="out" style="margin:0"><div class="k">기반 규격</div><div class="v">AWS D1.1</div><div class="why">Clause 5 사전인정 / Clause 6 시험인정</div></div>
          <div class="out" style="margin:0"><div class="k">실습 기준</div><div class="v">FCAW · E71T-1</div><div class="why">지원 PQR ED-PQR-001</div></div>
        </div>

        <div class="sessions">
          <button type="button" class="session" data-start="full">
            <span class="ic">18′</span>
            <span class="t"><b>전체 세션 — 이론부터 채점까지</b><small>이론 카드 → 12포인트 독도 → 변수 시뮬레이션 → WPS 작성 → 채점</small></span>
            <c>추천</c>
          </button>
          <button type="button" class="session" data-start="read">
            <span class="ic">讀</span>
            <span class="t"><b>독도만 — 강의 중 슬라이드와 함께</b><small>12포인트 클릭 + 퀘스트 3문항</small></span>
            <c>5분</c>
          </button>
          <button type="button" class="session" data-start="practice">
            <span class="ic">✎</span>
            <span class="t"><b>실습만 — 시뮬레이션 · 작성 · 채점</b><small>독도를 이미 들은 수강생용</small></span>
            <c>10분</c>
          </button>
        </div>

        <div class="row" style="margin-top:14px">
          <div class="fl" style="margin:0; min-width:180px; flex:1">
            <label for="nameIn">이름 (선택 — 채점 결과에 표시)</label>
            <input id="nameIn" value="${esc(S.name)}" placeholder="예: 김용접" />
          </div>
          ${S.session ? `<button type="button" class="btn sec" id="btnResume">이어하기 · ${esc(labelOf(S.current))}</button>` : ''}
        </div>
      </div>

      <div class="card pad">
        <div class="spread">
          <div class="h2">진행 상황</div>
          <span class="badge base">${S.session ? labelOf(S.current) : '시작 전'}</span>
        </div>
        <div class="progressbar" style="margin:12px 0 14px"><i style="width:${Math.min(100, pct)}%"></i></div>
        <div class="kv"><span>독도</span><b>${S.readVisited.length} / 12 포인트 · 퀘스트 ${questRight()} / 3</b></div>
        <div class="kv"><span>시뮬레이션</span><b>${Object.keys(S.sim.answers).length} / 3 시나리오</b></div>
        <div class="kv"><span>작성</span><b>${last ? (last.pass ? '합격' : '재작성 필요') : '미제출'}</b></div>
        <div class="kv"><span>최고 점수</span><b>${best == null ? '—' : best + ' 점'}</b></div>
        <div class="kv"><span>시도</span><b>${S.attempts.length} 회</b></div>
        <hr class="sep" />
        <div class="sub" style="font-size:12.5px">
          <b>교육용 안내</b><br/>
          화면의 WPS·PQR·과제서는 모두 가상 문서이고, 수치는 판본 원문 대조 전 교육용 대표값입니다.
          실제 제작에는 계약에서 지정한 판본의 AWS D1.1 원문과 발주처 시방을 적용하세요.
        </div>
        ${S.session ? `<button type="button" class="btn quiet sm" id="btnReset" style="margin-top:10px">기록 초기화</button>` : ''}
      </div>
    </div>`;

    $$('[data-start]').forEach(b => b.addEventListener('click', () => {
      const type = b.dataset.start;
      S.session = type;
      S.startedAt = Date.now();
      if (!S.draft) S.draft = null;
      save();
      const firstRun = S.readVisited.length === 0;
      if (type === 'full') go(firstRun ? 's1' : (readDone() ? 's3' : 's2'));
      else if (type === 'read') go('s2');
      else go('s3');
    }));
    const nameIn = $('#nameIn');
    if (nameIn) nameIn.addEventListener('input', () => { S.name = nameIn.value.trim(); save(); });
    const resume = $('#btnResume');
    if (resume) resume.addEventListener('click', () => go(S.current === 's0' ? 's2' : S.current, { force: true }));
    const reset = $('#btnReset');
    if (reset) reset.addEventListener('click', () => {
      if (!confirm('저장된 진행 상황과 점수를 모두 지울까요?')) return;
      S = blank(); save(); renderStepper(); go('s0'); toast('기록을 초기화했습니다.');
    });
  }
  function labelOf(id) {
    const st = STEPS.find(s => s.id === id);
    return st ? st.label : '시작';
  }

  /* ================================================================= S1 */
  const DIAGRAMS = {
    flow: `<div class="flowline">
      <span class="box">Pre-WPS</span><span class="ar">→</span>
      <span class="box">시험편 용접</span><span class="ar">→</span>
      <span class="box">PQR</span><span class="ar">→</span>
      <span class="box">WPS</span><span class="ar">→</span>
      <span class="box">생산 용접</span>
      <div style="flex-basis:100%; margin-top:8px; font-size:11.5px; color:var(--muted)">
        또는 · Clause 5: 모재·이음·공정·예열이 코드 범위 안이면 <b>PQR 없이</b> WPS → 생산
      </div>
    </div>`,
    esn: `<div class="esnrow"><span class="badge E">E 필수</span><div>공정 · 모재 Group · F/A-No. · 자세 · 그루브 형상 · 백킹 삭제 · 극성 · 예열 하향 → <b>새 PQR</b> (Table 6.6)</div></div>
      <div class="esnrow"><span class="badge S">S 보충</span><div>입열량 상한 · 층간온도 상한 · 단층↔다층 → <b>CVN 요구 시</b> 재인정 (Table 6.7)</div></div>
      <div class="esnrow"><span class="badge N">N 비필수</span><div>직경 · 유량 · 전류·전압 범위 · 청소 방법 → <b>WPS 개정만</b></div></div>`,
    tables: `<div class="flowline" style="gap:14px">
      <div style="flex:1 1 160px">
        <div style="font-size:11px;color:var(--muted);font-weight:800;margin-bottom:4px">Table 6.2 · 두께</div>
        <div style="font-family:var(--mono);font-size:11.5px;line-height:1.7">T &lt; 25 mm → 3 mm ~ 2T<br/>T ≥ 25 mm → 3 mm ~ 무제한</div>
      </div>
      <div style="flex:1 1 160px">
        <div style="font-size:11px;color:var(--muted);font-weight:800;margin-bottom:4px">Table 5.8 · 예열</div>
        <div style="font-family:var(--mono);font-size:11.5px;line-height:1.7">A 0/65/110/150 °C<br/>B 0/10/65/110 °C<br/>C 10/65/110/150 °C</div>
      </div>
    </div>`,
    map: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:11.5px">
      ${POINTS.map(p => `<div style="border:1px solid var(--line);border-radius:8px;background:#fff;padding:6px 7px"><b>${p.n}</b> ${esc(p.short)}</div>`).join('')}
    </div>`
  };
  function renderCards() {
    const c = CARDS[S.cardIdx] || CARDS[0];
    $('#s1').innerHTML = `
      <div class="deck">
        <div class="card cardface">
          <div class="spread">
            <div class="eyebrow">카드 ${S.cardIdx + 1} / ${CARDS.length} · ${esc(c.tag)}</div>
            <span class="badge base">${esc(APP.edition)}</span>
          </div>
          <h2 class="h1" style="font-size:23px; margin-top:6px">${esc(c.title)}</h2>
          <div class="lead">${esc(c.lead)}</div>
          <div class="diagram">${DIAGRAMS[c.diagram] || ''}</div>
          <div class="body">${c.body.map(p => `<p>${p}</p>`).join('')}</div>
          <div class="cardnav">
            <button type="button" class="btn sec sm" id="cardPrev" ${S.cardIdx === 0 ? 'disabled' : ''}>← 이전</button>
            <button type="button" class="btn sm" id="cardNext">${S.cardIdx === CARDS.length - 1 ? '독도 시작 →' : '다음 →'}</button>
            <button type="button" class="btn quiet sm" id="cardSkip" style="margin-left:auto">건너뛰기</button>
          </div>
        </div>
        <div class="card pad">
          <div class="h3" style="margin-bottom:8px">카드 목록</div>
          <div class="cardlist">
            ${CARDS.map((x, i) => `<button type="button" data-card="${i}" class="${i === S.cardIdx ? 'on' : ''}">${i + 1}. ${esc(x.title)}</button>`).join('')}
          </div>
          <hr class="sep" />
          <div class="tiny" style="font-size:12px;color:var(--muted)">
            실습에 필요한 표는 카드가 아니라 화면 안에서 바로 계산됩니다.
            카드는 <b>읽는 순서</b>만 잡아 주면 충분합니다.
          </div>
        </div>
      </div>`;
    $$('[data-card]').forEach(b => b.addEventListener('click', () => { S.cardIdx = +b.dataset.card; save(); renderCards(); }));
    $('#cardPrev').addEventListener('click', () => { if (S.cardIdx > 0) { S.cardIdx--; save(); renderCards(); } });
    $('#cardNext').addEventListener('click', () => {
      if (S.cardIdx < CARDS.length - 1) { S.cardIdx++; save(); renderCards(); }
      else { go('s2'); }
    });
    $('#cardSkip').addEventListener('click', () => go('s2'));
  }

  /* ================================================================= S2 */
  function renderReader(opts) {
    const sel = POINTS.find(p => p.n === S.readSel) || POINTS[0];
    $('#s2').innerHTML = `
      <div class="reader">
        <div class="stack">
          <div class="card pad" style="padding:14px 16px">
            <div class="spread">
              <div>
                <div class="eyebrow">실습 ① · WPS 독도</div>
                <div class="h2" style="margin-top:2px">필드를 눌러 조항 · 근거 · 현장 주의를 확인하세요</div>
              </div>
              <div class="modes" id="readModes">
                <button type="button" data-mode="tour" class="${S.readMode === 'tour' ? 'on' : ''}">가이드</button>
                <button type="button" data-mode="free" class="${S.readMode === 'free' ? 'on' : ''}">자유</button>
                <button type="button" data-mode="quest" class="${S.readMode === 'quest' ? 'on' : ''}">퀘스트</button>
              </div>
            </div>
            <div class="pdots" id="pdots">${POINTS.map(p => `<i class="${S.readVisited.includes(p.n) ? 'on' : ''}" title="${p.n}"></i>`).join('')}</div>
            <div class="sub" style="font-size:12px">
              방문 <b>${S.readVisited.length} / 12</b> · 퀘스트 <b>${questRight()} / 3</b>
              ${readDone() ? ' — 다음 단계가 열렸습니다.' : ' — 12개를 모두 보고 퀘스트 2개를 맞히면 시뮬레이터가 열립니다.'}
            </div>
          </div>

          ${renderDoc(sel)}

          ${S.readMode === 'quest' ? renderQuestBlock() : ''}

          <div class="row" style="justify-content:flex-end">
            <button type="button" class="btn" id="toSim" ${readDone() ? '' : 'disabled'}>시뮬레이터로 →</button>
          </div>
        </div>

        ${renderPanel(sel)}
      </div>`;

    $$('#readModes button').forEach(b => b.addEventListener('click', () => {
      S.readMode = b.dataset.mode; save(); renderReader({});
    }));
    $$('[data-point]').forEach(b => b.addEventListener('click', () => openPoint(+b.dataset.point)));
    $$('[data-gloss]').forEach(b => b.addEventListener('click', () => openGlossary(b.dataset.gloss)));
    const prev = $('#tourPrev'), next = $('#tourNext');
    if (prev) prev.addEventListener('click', () => openPoint(Math.max(1, sel.n - 1)));
    if (next) next.addEventListener('click', () => openPoint(Math.min(12, sel.n + 1)));
    $$('[data-quiz]').forEach(b => b.addEventListener('click', () => answerQuiz(sel.n, +b.dataset.quiz)));
    const toSim = $('#toSim');
    if (toSim) toSim.addEventListener('click', () => go('s3'));
    $$('[data-pqr]').forEach(b => b.addEventListener('click', () => {
      const box = $('#pqrBox');
      box.hidden = !box.hidden;
    }));
    $$('[data-quest]').forEach(b => b.addEventListener('click', () => answerQuest(b.dataset.quest, +b.dataset.opt)));
    $$('[data-jump]').forEach(b => b.addEventListener('click', () => openPoint(+b.dataset.jump)));
  }

  function renderDoc(sel) {
    const F = POINTS.map(p => `
      <button type="button" class="field ${p.n === sel.n ? 'sel' : ''} ${S.readVisited.includes(p.n) ? 'visited' : ''}" data-point="${p.n}">
        <span class="pnum">${p.n}</span>
        <span class="flabel">${esc(p.name)}</span>
        <span class="fvalue">${esc(p.value)}</span>
      </button>`).join('');
    return `
    <div class="card doc">
      <div class="doc-head">
        <div class="doc-title">
          <div>
            <div class="h3">WELDING PROCEDURE SPECIFICATION (WPS)</div>
            <div class="doc-meta">
              <span>No. ${esc(WPS.no)}</span><span>Rev. ${esc(WPS.rev)}</span>
              <span>${esc(WPS.date)}</span><span>Page ${esc(WPS.page)}</span>
            </div>
          </div>
          <span class="badge base">${esc(WPS.code)}</span>
        </div>
        <div class="doc-meta" style="margin-top:8px">
          <span>프로젝트 ${esc(WPS.project)}</span>
          <span>인정 경로 ${esc(WPS.route)}</span>
          <span>지원 PQR ${esc(WPS.pqr)}</span>
        </div>
      </div>
      <div class="fields">${F}</div>
      <div class="doc-foot">${esc(WPS.remark)}</div>
      <div class="doc-foot" style="border-top:1px dashed var(--line2)">${esc(WPS.hdr)}</div>
    </div>`;
  }

  function renderPanel(p) {
    const q = p.quiz;
    const modeHint = S.readMode === 'tour'
      ? `<div class="row" style="margin-top:10px; gap:6px">
           <button type="button" class="btn sec sm" id="tourPrev" ${p.n === 1 ? 'disabled' : ''}>←</button>
           <button type="button" class="btn sm" id="tourNext" ${p.n === 12 ? 'disabled' : ''}>다음 필드 →</button>
           <span class="sub" style="font-size:11.5px; margin-left:auto">${p.n} / 12</span>
         </div>`
      : '';
    const quizHtml = q ? `
      <div class="quiz">
        <div class="q">확인 퀴즈 · ${esc(q.q)}</div>
        ${q.a.map((a, i) => `<button type="button" class="opt" data-quiz="${i}">${esc(a)}</button>`).join('')}
        <div class="why" id="quizWhy" hidden>${esc(q.why)}</div>
      </div>` : '';
    return `
    <div class="card panel">
      <div class="spread">
        <div>
          <div class="eyebrow">${p.n}번 포인트</div>
          <h3>${esc(p.name)}</h3>
        </div>
        <span class="badge ${esc(p.badge)}">${esc(p.badgeText)}</span>
      </div>
      <div class="clause-chips">
        <button type="button" class="chip" data-gloss="${esc(p.clauseKey)}">${esc(p.clause)}</button>
        <button type="button" class="chip" data-pqr="1">PQR 대조</button>
      </div>

      <div class="block">
        <div class="lab">이 WPS의 값</div>
        <div class="value">${esc(p.value)}</div>
      </div>
      <div class="block">
        <div class="lab">의미</div>
        <div style="font-size:12.5px; color:var(--ink2)">${esc(p.meaning)}</div>
      </div>
      <div class="block">
        <div class="lab">근거 풀이</div>
        <div style="font-size:12.5px; color:var(--ink2)">${esc(p.logic)}</div>
      </div>
      <div class="block">
        <div class="lab">현장 주의</div>
        <div class="warn">${esc(p.field)}</div>
      </div>

      <div id="pqrBox" hidden class="block">
        <div class="lab">지원 PQR ${esc(PQR.no)}</div>
        <div class="value">공정 ${esc(PQR.process)} · 용가재 ${esc(PQR.filler)} (F${PQR.f}/A${PQR.a})<br/>
모재 ${esc(PQR.base)} Group ${esc(PQR.group)} · 시험 두께 ${PQR.T} mm<br/>
이음 ${esc(PQR.joint)} · 자세 ${esc(PQR.position)}<br/>
예열 ${PQR.preheat} °C · 층간 ${PQR.interpass} °C · PWHT ${esc(PQR.pwht)}<br/>
시험 ${esc(PQR.tests)}<br/>
<b>인정 범위 ${esc(PQR.qualified)}</b></div>
      </div>

      ${modeHint}
      ${quizHtml}
    </div>`;
  }

  function openPoint(n) {
    S.readSel = n;
    if (!S.readVisited.includes(n)) S.readVisited.push(n);
    save();
    renderReader({});
    const btn = document.querySelector('[data-point="' + n + '"]');
    if (btn && window.innerWidth < 1040) btn.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function answerQuiz(n, i) {
    const p = POINTS.find(x => x.n === n);
    if (!p || !p.quiz) return;
    const ok = i === p.quiz.correct;
    const opts = $$('.quiz .opt');
    opts.forEach((b, k) => { b.classList.toggle('ok', k === p.quiz.correct); b.classList.toggle('no', k === i && !ok); });
    $('#quizWhy').hidden = false;
    if (ok) toast('정답입니다.');
  }

  function renderQuestBlock() {
    return `<div class="card pad">
      <div class="eyebrow">퀘스트</div>
      <div class="h2" style="margin-bottom:8px">상황 3개 — 먼저 해당 필드를 눌러야 답할 수 있습니다</div>
      ${QUESTS.map(qq => {
        const a = S.quest[qq.id];
        const done = typeof a === 'number';
        return `<div class="scenario">
          <div class="qline">${esc(qq.q)}</div>
          <div class="row" style="gap:6px; margin-bottom:8px">
            ${qq.need.map(n => `<button type="button" class="chip ${S.readVisited.includes(n) ? '' : 'missing'}" data-jump="${n}">필드 ${n} 보기</button>`).join('')}
            ${qq.need.every(n => S.readVisited.includes(n)) ? '<span class="badge OK">필드 확인됨</span>' : '<span class="badge base">필드 방문 필요</span>'}
          </div>
          <div class="ansrow">
            ${qq.options.map((o, i) => {
              const cls = done ? (i === qq.answer ? 'ok' : (i === a ? 'no' : '')) : '';
              return `<button type="button" class="pill ${i === a ? 'on' : ''}" data-quest="${qq.id}" data-opt="${i}">${esc(o)}</button>`;
            }).join('')}
          </div>
          ${done ? `<div class="fb ${a === qq.answer ? 'ok' : 'no'}">${a === qq.answer ? '정답 · ' : '다시 보기 · '}${esc(qq.why)}</div>` : ''}
        </div>`;
      }).join('')}
      <div class="sub" style="font-size:12px">퀘스트 2문제 이상 정답이면 다음 단계가 열립니다. 점수에는 들어가지 않습니다.</div>
    </div>`;
  }
  function answerQuest(id, i) {
    const qq = QUESTS.find(x => x.id === id);
    if (!qq) return;
    const missing = qq.need.filter(n => !S.readVisited.includes(n));
    if (missing.length) { toast('먼저 필드 ' + missing.join(', ') + '번을 눌러 확인하세요.'); return; }
    S.quest[id] = i; save(); renderReader({});
  }

  /* ================================================================= S3 */
  function renderSim(opts) {
    const tab = S.sim.tab || 'calc';
    S.sim.asked = S.sim.asked || [];
    $('#s3').innerHTML = `
      <div class="spread" style="margin-bottom:12px">
        <div>
          <div class="eyebrow">실습 ② · 변수 시뮬레이션</div>
          <div class="h1" style="font-size:22px">값을 바꾸면 인정 범위가 어떻게 움직이는가</div>
        </div>
        <div class="sub" style="font-size:12.5px">기준 PQR ${esc(PQR.no)} · ${esc(PQR.base)} ${PQR.T} mm</div>
      </div>
      <div class="tabs" id="simTabs">
        <button type="button" data-tab="calc" class="${tab === 'calc' ? 'on' : ''}">계산기</button>
        <button type="button" data-tab="scen" class="${tab === 'scen' ? 'on' : ''}">변경 시나리오</button>
      </div>
      <div id="simBody"></div>`;
    $$('#simTabs button').forEach(b => b.addEventListener('click', () => { S.sim.tab = b.dataset.tab; save(); renderSim({}); }));
    if (tab === 'calc') renderCalc(); else renderScenarios();
  }

  function renderCalc() {
    const st = Object.assign({ metal: 3, t: 25, filler: 'E71T-1', T: 16, pos: '1G', amp: 240, volt: 26, speed: 30 }, S.sim.calc || {});
    S.sim.calc = st;
    const metalIdx = Math.max(0, Math.min(BASE_METALS.length - 1, +st.metal));
    const metal = BASE_METALS[metalIdx];
    const filler = fillerByClass(st.filler) || FILLERS[6];
    const ph = preheatCalc(metal, filler, st.t);
    const th = thicknessRange(st.T);
    const hi = heatInput(st.amp, st.volt, st.speed);
    $('#simBody').innerHTML = `
      <div class="simgrid">
        <div class="card form">
          <div class="fl"><label>모재 규격 · 등급</label>
            <select id="cMetal">${BASE_METALS.map((b, i) => `<option value="${i}" ${i === metalIdx ? 'selected' : ''}>${esc(b.spec)} ${esc(b.grade)}</option>`).join('')}</select>
          </div>
          <div class="fl"><label>최후 부재 두께 (mm)</label><input id="cT" type="number" step="1" min="1" max="200" value="${st.t}" /></div>
          <div class="fl"><label>공정 · 용가재</label>
            <select id="cFiller">${FILLERS.map(f => `<option value="${esc(f.class)}" ${f.class === st.filler ? 'selected' : ''}>${esc(f.class)} — ${esc(f.process)} (F${f.f} / A${f.a})</option>`).join('')}</select>
          </div>
          <hr class="sep" />
          <div class="fl"><label>PQR 시험편 두께 T (mm)</label><input id="cPT" type="number" step="1" min="1" max="200" value="${st.T}" /></div>
          <div class="fl"><label>PQR 시험 자세</label>
            <select id="cPos">${POSITIONS.map(p => `<option value="${esc(p.test)}" ${p.test === st.pos ? 'selected' : ''}>${esc(p.test)} — ${esc(p.kr)}</option>`).join('')}</select>
          </div>
          <hr class="sep" />
          <div class="two">
            <div class="fl" style="margin:0"><label>전류 (A)</label><input id="cA" type="number" value="${st.amp}" /></div>
            <div class="fl" style="margin:0"><label>전압 (V)</label><input id="cV" type="number" value="${st.volt}" /></div>
          </div>
          <div class="fl" style="margin-top:8px"><label>이동속도 (cm/min)</label><input id="cS" type="number" value="${st.speed}" /></div>
          <button type="button" class="btn sec sm" id="cReset">기준값으로</button>
        </div>

        <div class="card result">
          <div class="spread" style="margin-bottom:10px">
            <div class="h2">계산 결과</div>
            <span class="badge base">근거 조항 함께 표시</span>
          </div>

          ${metal.blocked ? `<div class="out blocked"><div class="k">사전인정 여부</div><div class="v">사전인정 불가</div><div class="why">${esc(metal.blocked)}</div></div>` : ''}

          <div class="out">
            <div class="top"><span class="k">모재 Group · 예열 범주</span><span class="v">${esc(metal.group)} · ${ph ? esc(ph.cat) + ' 범주' : '—'}</span></div>
            <div class="why">Table 5.3(2020) / 5.6(2025) Group, Table 5.8(2020) / 5.11(2025) 예열 범주. 같은 Group이면 강종이 달라도 절차를 그대로 쓸 수 있습니다.</div>
          </div>

          <div class="out">
            <div class="top"><span class="k">최소 예열 · 최소 층간온도</span><span class="v">${ph ? ph.minC + ' °C (' + ph.minF + ' °F)' : '—'}</span></div>
            <div class="why">${ph ? esc(ph.name) + ' · ' + esc(ph.bandLabel) + ' 구간 → Table 5.8 ' + esc(ph.cat) + ' 범주 값. 이 값보다 낮추는 변경은 재인정 대상입니다.' : '강재를 선택하세요.'}</div>
          </div>

          <div class="out">
            <div class="top"><span class="k">인정 모재 두께 (Table 6.2)</span><span class="v">${th ? th.label : '—'}</span></div>
            <div class="why">시험편 ${st.T} mm → ${st.T >= 25 ? '1"(25 mm) 이상이므로 두께 제한이 없습니다.' : '최대 2T = ' + fmt(2 * st.T) + ' mm입니다. 25 mm 이상으로 시험하면 제한이 없어집니다.'} 최소값은 항상 1/8"(3 mm)입니다.</div>
          </div>

          <div class="out">
            <div class="top"><span class="k">인정 자세 (Table 6.1)</span><span class="v">${esc(posQual(st.pos))}</span></div>
            <div class="why">${esc(st.pos)} 시험은 ${esc(posQual(st.pos))}만 인정합니다. 3G·4G 생산이 필요하면 그 자세로 시험해야 합니다.</div>
          </div>

          <div class="out">
            <div class="top"><span class="k">용가재 분류</span><span class="v">F${filler.f} / A${filler.a} · ${esc(filler.strength)}</span></div>
            <div class="why">${esc(filler.class)} — ${esc(filler.note)}${filler.lowH ? ' · 저수소' : ' · 비저수소(예열 범주가 A로 올라갑니다)'}. F-No.·A-No. 변경은 재인정 대상입니다.</div>
          </div>

          <div class="out ${hi > 2.0 ? 'warnstate' : ''}">
            <div class="top"><span class="k">입열량</span><span class="v">${isFinite(hi) ? hi.toFixed(2) + ' kJ/mm' : '—'}</span></div>
            <div class="why">H = (${st.volt} V × ${st.amp} A × 60) ÷ ${num(st.speed) * 10} mm/min = ${isFinite(hi) ? Math.round(hi * 1000) + ' J/mm' : '—'}. 이 WPS 상한은 2.0 kJ/mm입니다.</div>
          </div>
        </div>
      </div>`;

    const upd = () => {
      const v = {
        metal: +$('#cMetal').value, t: num($('#cT').value), filler: $('#cFiller').value,
        T: num($('#cPT').value), pos: $('#cPos').value,
        amp: num($('#cA').value), volt: num($('#cV').value), speed: num($('#cS').value)
      };
      S.sim.calc = v; save(); renderCalc();
    };
    ['#cMetal', '#cT', '#cFiller', '#cPT', '#cPos', '#cA', '#cV', '#cS'].forEach(id => {
      const el = $(id);
      el.addEventListener('change', upd);
    });
    $('#cReset').addEventListener('click', () => { S.sim.calc = null; save(); renderCalc(); });
  }

  function renderScenarios() {
    if (!S.sim.asked || S.sim.asked.length !== 3) {
      S.sim.asked = pickScenarios(); save();
    }
    const items = S.sim.asked.map(id => SCENARIOS.find(s => s.id === id)).filter(Boolean);
    const ansCount = simAnswered();
    $('#simBody').innerHTML = `
      <div class="spread" style="margin-bottom:10px">
        <div class="sub">기준 PQR의 값을 회색으로 고정해 두고, 각 변경이 <b>어느 층(E/S/N)</b>이고 <b>무엇을 해야 하는지</b>를 고릅니다.</div>
        <span class="badge ${ansCount >= 3 ? 'OK' : 'base'}">${ansCount} / 3 판정</span>
      </div>
      ${items.map(sc => {
        const a = S.sim.answers[sc.id];
        const done = !!a;
        return `<div class="scenario">
          <div class="spread">
            <div class="qline">${esc(sc.q)}</div>
            <button type="button" class="chip" data-gloss="g66">${esc(sc.clause)}</button>
          </div>
          <div class="sub" style="font-size:12px;margin-bottom:8px">기준: ${esc(PQR.process)} · ${esc(PQR.filler)}(F${PQR.f}/A${PQR.a}) · ${esc(PQR.base)}(Group ${esc(PQR.group)}) · ${PQR.T} mm · ${esc(PQR.position)} · 예열 ${PQR.preheat} °C · 층간 ${PQR.interpass} °C · PWHT ${esc(PQR.pwht)}</div>
          <div class="ansrow">
            <span class="sub" style="font-size:12px;width:64px">분류</span>
            ${['E', 'S', 'N'].map((k, i) => `<button type="button" class="pill ${done && a.cls === i ? 'on' : ''}" data-sc="${sc.id}" data-kind="cls" data-i="${i}">${k}</button>`).join('')}
          </div>
          <div class="ansrow">
            <span class="sub" style="font-size:12px;width:64px">조치</span>
            ${sc.acts.map((o, i) => `<button type="button" class="pill ${done && a.act === i ? 'on' : ''}" data-sc="${sc.id}" data-kind="act" data-i="${i}">${esc(o)}</button>`).join('')}
          </div>
          ${done ? `<div class="fb ${(a.cls === sc.clsAns && a.act === sc.actAns) ? 'ok' : 'no'}">
            ${(a.cls === sc.clsAns && a.act === sc.actAns) ? '정답' : '다시 보기'} — 분류 <b>${['E', 'S', 'N'][sc.clsAns]}</b>, 조치 <b>${esc(sc.acts[sc.actAns])}</b>. ${esc(sc.why)}
          </div>` : ''}
        </div>`;
      }).join('')}
      <div class="row" style="justify-content:space-between;margin-top:12px">
        <button type="button" class="btn quiet sm" id="scNew">다른 3문제로</button>
        <button type="button" class="btn" id="toWrite" ${ansCount >= 3 ? '' : 'disabled'}>WPS 작성으로 →</button>
      </div>`;

    $$('[data-sc]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.sc, kind = b.dataset.kind, i = +b.dataset.i;
      const cur = S.sim.answers[id] || { cls: null, act: null };
      cur[kind] = i;
      S.sim.answers[id] = cur;
      save(); renderScenarios();
    }));
    const scNew = $('#scNew');
    if (scNew) scNew.addEventListener('click', () => { S.sim.asked = pickScenarios(); S.sim.answers = {}; save(); renderScenarios(); });
    const toWrite = $('#toWrite');
    if (toWrite) toWrite.addEventListener('click', () => go('s4'));
    $$('[data-gloss]').forEach(b => b.addEventListener('click', () => openGlossary(b.dataset.gloss)));
  }
  function pickScenarios() {
    const pool = SCENARIOS.slice();
    const out = [];
    for (let i = 0; i < 3 && pool.length; i++) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id);
    }
    return out;
  }

  /* ================================================================= S4 */
  const WSTEPS = [
    { n: 1, key: 'hdr', label: '헤더 · 인정 경로' },
    { n: 2, key: 'process', label: '용접법' },
    { n: 3, key: 'joint', label: '이음' },
    { n: 4, key: 'base', label: '모재' },
    { n: 5, key: 'filler', label: '용가재' },
    { n: 6, key: 'pos', label: '자세' },
    { n: 7, key: 'pwht', label: 'PWHT' },
    { n: 8, key: 'pre', label: '예열 · 층간' },
    { n: 9, key: 'gas', label: '가스' },
    { n: 10, key: 'elec', label: '전기 · 기법' },
    { n: 11, key: 'review', label: '검토 · 제출' }
  ];
  function emptyDraft() {
    return {
      hdrNo: '', rev: '0', pqr: '', route: '',
      process: '', method: '',
      joint: '', groove: '', root: '', backing: '',
      bspec: '', bgrade: '', group: '', tMin: '', tMax: '',
      fclass: '', fno: '', ano: '', dia: '',
      pos: [],
      pwht: '',
      preheat: '', interpass: '',
      gas: '', flow: '',
      polarity: '', ampMin: '', ampMax: '', voltMin: '', voltMax: '', ctWd: '', speed: '', hi: '',
      passes: '', backgouge: '', peening: false
    };
  }
  function ensureDraft() {
    if (!S.draft) S.draft = emptyDraft();
    Object.keys(emptyDraft()).forEach(k => { if (!(k in S.draft)) S.draft[k] = emptyDraft()[k]; });
    return S.draft;
  }
  const HINTS = {
    tMax: ['PQR의 시험 두께에서 출발합니다.', 'Table 6.2를 보세요. T가 25 mm 미만이면 최대 2T입니다.', '시험편 16 mm → 최대 32 mm입니다.'],
    tMin: ['최소 인정 두께는 표에 고정값이 있습니다.', 'Table 6.2의 아래쪽 한계를 보세요.', '1/8" = 3 mm입니다.'],
    preheat: ['강재 범주와 두께로 Table 5.8을 봅니다.', 'A992는 범주 B, 25 mm는 20~38 mm 구간입니다.', '범주 B 20~38 mm = 50°F = 10 °C입니다.'],
    pos: ['PQR의 시험 자세를 먼저 확인합니다.', 'Table 6.1에서 1G가 인정하는 자세만 적을 수 있습니다.', '1G → F(아래보기)만.'],
    hi: ['입열량은 전압·전류·속도로 계산합니다.', 'H = (V × A × 60) ÷ (1000 × mm/min).', '26 V × 240 A × 60 ÷ 300 = 1.25 kJ/mm.'],
    fclass: ['과제서의 공정과 PQR의 용가재를 맞춰 봅니다.', 'FCAW 가스 차폐 와이어의 70 ksi급 분류입니다.', 'E71T-1 (F6/A1)입니다.'],
    group: ['과제서 모재의 Group을 Table 5.3에서 찾습니다.', 'A992는 50 ksi급 Group II입니다.', 'Group II — PQR과 같은 Group이어야 합니다.']
  };
  function hintHtml(key) {
    if (!HINTS[key]) return '';
    const lv = S.hints[key] || 0;
    if (!lv) {
      return `<button type="button" class="hintbtn" data-hint="${key}">힌트 1단계 (조항 보기)</button>`;
    }
    const txt = HINTS[key].slice(0, lv).map((h, i) => `${i + 1}) ${esc(h)}`).join('<br/>');
    const pen = Math.max(0, lv - 1) * 0.5;
    return `<div class="hintbox">${txt}<div class="sub" style="font-size:11px;margin-top:4px">감점 ${pen.toFixed(1)}점 (1단계 무료)</div></div>
      ${lv < 3 ? `<button type="button" class="hintbtn" data-hint="${key}">힌트 ${lv + 1}단계</button>` : ''}`;
  }
  function renderWizard() {
    const d = ensureDraft();
    const step = S.wstep || 1;
    const st = WSTEPS.find(s => s.n === step) || WSTEPS[0];
    const done = WSTEPS.filter(s => s.n < step && stepFilled(s.key, d)).map(s => s.n);
    $('#s4').innerHTML = `
      <div class="spread" style="margin-bottom:12px">
        <div>
          <div class="eyebrow">실습 ③ · WPS 작성</div>
          <div class="h1" style="font-size:22px">과제서와 지원 PQR만 보고 빈 양식을 채웁니다</div>
        </div>
        <div class="sub" style="font-size:12.5px">${S.lock ? '<span class="badge TASK">오답 재시도 모드 — 정답 칸은 잠김</span>' : '필수 칸을 채우면 다음으로 넘어갈 수 있습니다.'}</div>
      </div>
      <div class="wiz">
        <div class="card"><ol class="steps">
          ${WSTEPS.map(s => `<li class="${s.n === step ? 'on' : ''} ${done.includes(s.n) ? 'ok' : ''}" data-wstep="${s.n}">
            <span class="n">${done.includes(s.n) ? '✓' : s.n}</span>${esc(s.label)}</li>`).join('')}
        </ol></div>
        <div class="card wizbody" id="wizbody">${wizBody(step, d)}</div>
        <div class="card aside">
          <h4>과제서</h4>
          <div class="tiny"><b>${esc(TASK.project)}</b><br/>${esc(TASK.part)}</div>
          <div class="taskbox">
            <div><b>모재</b> ${esc(TASK.base)}</div>
            <div><b>이음</b> ${esc(TASK.joint)}</div>
            <div><b>공정</b> ${esc(TASK.process)}</div>
          </div>
          <h4 style="margin-top:12px">요구사항</h4>
          <ul class="tiny" style="padding-left:16px; margin:0">${TASK.req.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
          <h4 style="margin-top:12px">지원 PQR</h4>
          <div class="taskbox" style="font-size:11.5px">
            ${esc(PQR.process)} · ${esc(PQR.filler)} (F${PQR.f}/A${PQR.a})<br/>
            ${esc(PQR.base)} Group ${esc(PQR.group)} · ${PQR.T} mm<br/>
            ${esc(PQR.joint)} · ${esc(PQR.position)}<br/>
            예열 ${PQR.preheat} °C · 층간 ${PQR.interpass} °C<br/>
            PWHT ${esc(PQR.pwht)} · CVN ${esc(PQR.cvn)}<br/>
            <b>${esc(PQR.qualified)}</b>
          </div>
        </div>
      </div>`;

    $$('[data-wstep]').forEach(li => li.addEventListener('click', () => { S.wstep = +li.dataset.wstep; save(); renderWizard(); }));
    bindWizard(step);
  }
  const STEP_FIELDS = {
    hdr: ['hdrNo', 'rev', 'pqr', 'route'],
    process: ['process', 'method'],
    joint: ['joint', 'groove', 'root', 'backing'],
    base: ['bspec', 'bgrade', 'group', 'tMin', 'tMax'],
    filler: ['fclass', 'fno', 'ano', 'dia'],
    pos: ['pos'],
    pwht: ['pwht'],
    pre: ['preheat', 'interpass'],
    gas: ['gas', 'flow'],
    elec: ['polarity', 'ampMin', 'ampMax', 'voltMin', 'voltMax', 'ctWd', 'speed', 'hi', 'passes', 'backgouge']
  };
  function stepFilled(key, d) {
    const keys = STEP_FIELDS[key] || [];
    return keys.every(k => (k === 'pos' ? (d.pos && d.pos.length > 0) : !(d[k] === '' || d[k] == null)));
  }

  function fieldHtml(key, label, inner, opt) {
    const locked = S.lock && S.lock.indexOf(key) >= 0;
    return `<div class="fl ${opt && opt.bad ? 'bad' : ''}">
      <label>${esc(label)}${opt && opt.opt ? ' <span style="font-weight:600;color:var(--muted)">(선택)</span>' : ''}</label>
      ${inner.replace('__DIS__', locked ? 'disabled' : '')}
      ${opt && opt.err ? `<div class="err">${esc(opt.err)}</div>` : ''}
      ${opt && opt.hint ? hintHtml(opt.hint) : ''}
    </div>`;
  }
  function sel(key, opts, d, dis) {
    return `<select data-f="${key}" __DIS__>
      <option value="">— 선택 —</option>
      ${opts.map(o => `<option value="${esc(o.v)}" ${String(d[key]) === String(o.v) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}
    </select>`;
  }
  function inp(key, d, attrs) {
    return `<input data-f="${key}" value="${esc(d[key])}" ${attrs || ''} __DIS__ />`;
  }

  function wizBody(step, d) {
    const head = (t, s) => `<div class="stephead"><div class="eyebrow">Step ${step} / 10</div><div class="h2">${t}</div><div class="sub" style="font-size:12.5px">${s}</div></div>`;
    let body = '';
    if (step === 1) {
      body = head('헤더 · 인정 경로', 'WPS 번호와 지원 PQR, 어느 인정 경로로 만든 문서인지 적습니다.')
        + fieldHtml('hdrNo', 'WPS No.', inp('hdrNo', d, 'placeholder="예: GA-WPS-201"'))
        + fieldHtml('rev', 'Rev.', inp('rev', d, 'placeholder="0"'))
        + fieldHtml('pqr', '지원 PQR', sel('pqr', [{ v: 'ED-PQR-001', t: 'ED-PQR-001' }, { v: 'ED-PQR-002', t: 'ED-PQR-002 (없는 문서)' }], d), { hint: null })
        + fieldHtml('route', '인정 경로', sel('route', [{ v: 'clause5', t: 'Clause 5 — 사전인정 (PQR 없음)' }, { v: 'clause6', t: 'Clause 6 — 시험인정 (PQR 지원)' }], d));
    } else if (step === 2) {
      body = head('용접법', '과제서가 요구하는 공정과 작업 형태를 고릅니다.')
        + fieldHtml('process', '공정', sel('process', [
          { v: 'SMAW', t: 'SMAW — 피복아크' }, { v: 'FCAW-G', t: 'FCAW-G — 플럭스코어드(가스 차폐)' },
          { v: 'GMAW', t: 'GMAW — 솔리드 와이어' }, { v: 'SAW', t: 'SAW — 잠호' }], d))
        + fieldHtml('method', '작업 형태', sel('method', [
          { v: 'manual', t: '수동(Manual)' }, { v: 'semi', t: '반자동(Semi-automatic)' }, { v: 'auto', t: '자동(Automatic)' }], d));
    } else if (step === 3) {
      body = head('이음', '사전인정 상세 기호로 적습니다. “single-V”라는 말만으로는 부족합니다.')
        + fieldHtml('joint', '이음 상세', sel('joint', [
          { v: 'B-U2a-S', t: 'B-U2a-S — 맞대기 single-V, 철제 백킹' },
          { v: 'B-U2', t: 'B-U2 — 맞대기 single-V, 백가우징' },
          { v: 'B-L2', t: 'B-L2 — 맞대기, 두께 제한 상세' },
          { v: 'TC-U4a', t: 'TC-U4a — T/코너 single-bevel' }], d))
        + `<div class="two">
            ${fieldHtml('groove', '개선각 (°)', inp('groove', d, 'type="number" step="1" placeholder="45"'))}
            ${fieldHtml('root', '루트 개구부 (mm)', inp('root', d, 'type="number" step="0.5" placeholder="6"'))}
          </div>`
        + fieldHtml('backing', '백킹', sel('backing', [
          { v: 'steel', t: '철제 백킹 (제거하지 않음)' }, { v: 'ceramic', t: '세라믹 백킹' }, { v: 'none', t: '백킹 없음' }], d));
    } else if (step === 4) {
      body = head('모재', 'Group과 두께 범위가 PQR의 인정 범위 안에 들어와야 합니다.')
        + `<div class="two">
            ${fieldHtml('bspec', '규격', sel('bspec', [{ v: 'A992', t: 'ASTM A992' }, { v: 'A572', t: 'ASTM A572' }, { v: 'A36', t: 'ASTM A36' }], d))}
            ${fieldHtml('bgrade', '등급', sel('bgrade', [{ v: 'Gr.50', t: 'Gr.50' }, { v: 'Gr.42', t: 'Gr.42' }, { v: 'Gr.36', t: 'Gr.36' }, { v: 'Gr.60', t: 'Gr.60' }], d))}
          </div>`
        + fieldHtml('group', 'Group', sel('group', [{ v: 'I', t: 'Group I' }, { v: 'II', t: 'Group II' }, { v: 'III', t: 'Group III' }], d), { hint: 'group' })
        + `<div class="two">
            ${fieldHtml('tMin', '최소 두께 (mm)', inp('tMin', d, 'type="number" step="1"'), { hint: 'tMin' })}
            ${fieldHtml('tMax', '최대 두께 (mm)', inp('tMax', d, 'type="number" step="1"'), { hint: 'tMax' })}
          </div>`;
    } else if (step === 5) {
      const f = fillerByClass(d.fclass);
      body = head('용가재', '분류를 고르면 F-No.·A-No.가 제안됩니다. 현장에서 반드시 확인하세요.')
        + fieldHtml('fclass', 'AWS 분류', sel('fclass', FILLERS.map(x => ({ v: x.class, t: x.class + ' — ' + x.process + ' (' + x.spec + ')' })), d), { hint: 'fclass' })
        + `<div class="two">
            ${fieldHtml('fno', 'F-No.', inp('fno', d, 'type="number" step="1" placeholder="6"'))}
            ${fieldHtml('ano', 'A-No.', inp('ano', d, 'type="number" step="1" placeholder="1"'))}
          </div>`
        + fieldHtml('dia', '직경 (mm)', inp('dia', d, 'type="number" step="0.1" placeholder="1.2"'))
        + (f ? `<div class="hintbox">${esc(f.class)} 은(는) F${f.f} / A${f.a} · ${esc(f.strength)} · ${esc(f.note)}</div>` : '');
    } else if (step === 6) {
      body = head('자세', 'PQR이 인정한 자세만 적을 수 있습니다. 과제는 아래보기(1G)입니다.')
        + `<div>${['1G', '2G', '3G', '4G', '1F', '2F', '3F', '4F'].map(p => `
            <label class="checkbox"><input type="checkbox" data-pos="${p}" ${d.pos.indexOf(p) >= 0 ? 'checked' : ''} ${S.lock && S.lock.indexOf('pos') >= 0 ? 'disabled' : ''}/> ${p}</label>`).join('')}</div>`
        + `<div class="sub" style="font-size:12px">Table 6.1 · ${esc(PQR.position)} 시험 → ${esc(posQual(PQR.position))} 인정</div>`
        + hintHtml('pos');
    } else if (step === 7) {
      body = head('용접후열처리(PWHT)', 'D1.1은 원칙적으로 PWHT를 요구하지 않습니다. 과제서 요구를 확인하세요.')
        + fieldHtml('pwht', 'PWHT', sel('pwht', [{ v: 'none', t: '없음' }, { v: 'yes', t: '있음 (온도·유지시간 기재)' }], d))
        + (d.pwht === 'yes' ? `<div class="hintbox">PWHT를 넣으면 그 조건(온도·유지시간·승온속도)이 필수변수가 됩니다. 이 과제는 요구가 없습니다.</div>` : '');
    } else if (step === 8) {
      body = head('예열 · 층간온도', '강재 범주와 두께로 Table 5.8 값을 찾고, 그 이상으로 적습니다.')
        + `<div class="two">
            ${fieldHtml('preheat', '최소 예열 (°C)', inp('preheat', d, 'type="number" step="1"'), { hint: 'preheat' })}
            ${fieldHtml('interpass', '최대 층간 (°C)', inp('interpass', d, 'type="number" step="1"'))}
          </div>`
        + `<div class="sub" style="font-size:12px">예열 측정은 용접부에서 가장 두꺼운 부재 두께만큼, 최소 75 mm 떨어진 여러 방향에서 합니다.</div>`;
    } else if (step === 9) {
      body = head('가스 · 유량', '조성은 필수변수, 유량은 기재 사항입니다.')
        + fieldHtml('gas', '차폐가스 조성', sel('gas', [
          { v: 'CO2', t: 'CO2 100 %' }, { v: 'Ar75', t: 'Ar 75 % / CO2 25 %' },
          { v: 'Ar', t: 'Ar 100 %' }, { v: 'none', t: '자기 차폐 (가스 없음)' }], d))
        + fieldHtml('flow', '유량 (L/min)', inp('flow', d, 'type="number" step="1" placeholder="20"'));
    } else if (step === 10) {
      const hi = heatInput(d.ampMax, d.voltMax, d.speed);
      body = head('전기적 특성 · 기법', '전류·전압은 범위로, 입열량은 계산해서 적습니다.')
        + fieldHtml('polarity', '극성', sel('polarity', [{ v: 'DCEP', t: 'DCEP (직류 역극성)' }, { v: 'DCEN', t: 'DCEN (직류 정극성)' }, { v: 'AC', t: 'AC (교류)' }], d))
        + `<div class="two">
            ${fieldHtml('ampMin', '전류 최소 (A)', inp('ampMin', d, 'type="number" step="1"'))}
            ${fieldHtml('ampMax', '전류 최대 (A)', inp('ampMax', d, 'type="number" step="1"'))}
          </div>
          <div class="two">
            ${fieldHtml('voltMin', '전압 최소 (V)', inp('voltMin', d, 'type="number" step="1"'))}
            ${fieldHtml('voltMax', '전압 최대 (V)', inp('voltMax', d, 'type="number" step="1"'))}
          </div>
          <div class="two">
            ${fieldHtml('ctWd', 'CTWD (mm)', inp('ctWd', d, 'type="number" step="1"'))}
            ${fieldHtml('speed', '이동속도 (cm/min)', inp('speed', d, 'type="number" step="1"'))}
          </div>`
        + `<div class="out" style="margin-top:6px">
            <div class="top"><span class="k">입열량 미리보기</span><span class="v">${isFinite(hi) ? hi.toFixed(2) + ' kJ/mm' : '—'}</span></div>
            <div class="why">H = (전압 × 전류 × 60) ÷ (1000 × mm/min). 계산값을 아래에 적으세요. 과제 상한은 2.0 kJ/mm입니다.</div>
          </div>`
        + fieldHtml('hi', '입열량 기재값 (kJ/mm)', inp('hi', d, 'type="number" step="0.01"'), { hint: 'hi' })
        + `<div class="two">
            ${fieldHtml('passes', '패스 방식', sel('passes', [{ v: 'multi', t: '다층 다패스' }, { v: 'single', t: '단층' }], d))}
            ${fieldHtml('backgouge', '백가우징', sel('backgouge', [{ v: 'none', t: '없음 (-S 상세)' }, { v: 'gouging', t: '있음 (백가우징 후 이면 용접)' }], d))}
          </div>`
        + `<label class="checkbox"><input type="checkbox" data-f="peening" ${d.peening ? 'checked' : ''} ${S.lock && S.lock.indexOf('peening') >= 0 ? 'disabled' : ''}/> 피닝(Peening) 실시</label>`;
    } else {
      const rows = reviewRows(d);
      const missing = missingRequired(d);
      body = `<div class="stephead"><div class="eyebrow">검토</div><div class="h2">제출 전 확인</div>
          <div class="sub" style="font-size:12.5px">형식 오류가 있으면 제출할 수 없습니다. 값의 정답 여부는 제출 후에 알려 드립니다.</div></div>
        ${missing.length ? `<div class="missing">미입력: ${missing.join(', ')}</div>` : '<div class="badge OK">필수 항목 입력 완료</div>'}
        <div style="max-height:340px; overflow:auto; margin-top:10px">
          <table class="reviewtable"><thead><tr><th style="width:34%">항목</th><th>값</th></tr></thead>
          <tbody>${rows.map(r => `<tr><td>${esc(r.k)}</td><td class="v">${esc(r.v)}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="navrow">
          <button type="button" class="btn sec" id="wPrev">← 이전</button>
          <button type="button" class="btn" id="wSubmit" ${missing.length ? 'disabled' : ''}>채점 제출</button>
          <button type="button" class="btn quiet sm" id="wClear">처음부터 쓰기</button>
          <span class="sub" style="font-size:11.5px;margin-left:auto">다음 단계에서 점수와 오답 근거가 나옵니다.</span>
        </div>`;
    }
    if (step < 11) {
      body += `<div class="navrow">
        <button type="button" class="btn sec" id="wPrev" ${step === 1 ? 'disabled' : ''}>← 이전</button>
        <button type="button" class="btn" id="wNext">${step === 10 ? '검토로 →' : '저장 후 다음 →'}</button>
        <span class="sub" style="font-size:11.5px;margin-left:auto">필수 칸을 비우면 다음으로 넘어가지 않습니다.</span>
      </div>`;
    }
    return body;
  }
  function reviewRows(d) {
    const g = (k, map) => (d[k] === '' || d[k] == null ? '—' : (map ? (map[d[k]] || d[k]) : d[k]));
    return [
      { k: 'WPS No. / Rev.', v: (d.hdrNo || '—') + ' / ' + (d.rev || '—') },
      { k: '지원 PQR', v: g('pqr') },
      { k: '인정 경로', v: g('route', { clause5: 'Clause 5 사전인정', clause6: 'Clause 6 시험인정' }) },
      { k: '공정 / 작업 형태', v: g('process') + ' / ' + g('method', { manual: '수동', semi: '반자동', auto: '자동' }) },
      { k: '이음 상세', v: g('joint') + ' · ' + g('groove') + '° · R ' + g('root') + ' mm · ' + g('backing', { steel: '철제 백킹', ceramic: '세라믹', none: '없음' }) },
      { k: '모재', v: g('bspec') + ' ' + g('bgrade') + ' (Group ' + g('group') + ')' },
      { k: '두께 범위', v: g('tMin') + ' ~ ' + g('tMax') + ' mm' },
      { k: '용가재', v: g('fclass') + ' · F' + g('fno') + '/A' + g('ano') + ' · Ø' + g('dia') + ' mm' },
      { k: '자세', v: (d.pos || []).join(', ') || '—' },
      { k: 'PWHT', v: g('pwht', { none: '없음', yes: '있음' }) },
      { k: '예열 / 층간', v: g('preheat') + ' °C / ' + g('interpass') + ' °C' },
      { k: '가스 / 유량', v: g('gas', { CO2: 'CO2 100%', Ar75: 'Ar75/CO2 25', Ar: 'Ar 100%', none: '자기 차폐' }) + ' · ' + g('flow') + ' L/min' },
      { k: '극성', v: g('polarity') },
      { k: '전류 / 전압', v: g('ampMin') + '~' + g('ampMax') + ' A / ' + g('voltMin') + '~' + g('voltMax') + ' V' },
      { k: '입열량', v: g('hi') + ' kJ/mm' },
      { k: '패스 / 백가우징 / 피닝', v: g('passes', { multi: '다층', single: '단층' }) + ' / ' + g('backgouge', { none: '없음', gouging: '있음' }) + ' / ' + (d.peening ? '실시' : '미실시') }
    ];
  }
  const REQUIRED = [
    ['hdrNo', 'WPS No.'], ['rev', 'Rev.'], ['pqr', '지원 PQR'], ['route', '인정 경로'],
    ['process', '공정'], ['method', '작업 형태'], ['joint', '이음 상세'], ['groove', '개선각'], ['root', '루트 개구부'], ['backing', '백킹'],
    ['bspec', '모재 규격'], ['bgrade', '모재 등급'], ['group', 'Group'], ['tMin', '최소 두께'], ['tMax', '최대 두께'],
    ['fclass', '용가재 분류'], ['fno', 'F-No.'], ['ano', 'A-No.'], ['dia', '직경'],
    ['pwht', 'PWHT'], ['preheat', '최소 예열'], ['interpass', '최대 층간'],
    ['gas', '가스'], ['flow', '유량'], ['polarity', '극성'],
    ['ampMin', '전류 최소'], ['ampMax', '전류 최대'], ['voltMin', '전압 최소'], ['voltMax', '전압 최대'],
    ['ctWd', 'CTWD'], ['speed', '이동속도'], ['hi', '입열량'], ['passes', '패스 방식'], ['backgouge', '백가우징']
  ];
  function missingRequired(d) {
    const out = REQUIRED.filter(r => d[r[0]] === '' || d[r[0]] == null).map(r => r[1]);
    if (!d.pos || !d.pos.length) out.unshift('자세');
    return out;
  }

  function bindWizard(step) {
    $$('[data-f]').forEach(el => {
      const k = el.dataset.f;
      const handler = () => {
        if (el.type === 'checkbox') S.draft[k] = el.checked;
        else S.draft[k] = el.value;
        if (k === 'fclass') {
          readDraftFromDom();
          const f = fillerByClass(S.draft.fclass);
          if (f) { S.draft.fno = String(f.f); S.draft.ano = String(f.a); }
          save();
          renderWizard();
          return;
        }
        save();
      };
      el.addEventListener('change', handler);
    });
    $$('[data-pos]').forEach(el => el.addEventListener('change', () => {
      const p = el.dataset.pos;
      const i = S.draft.pos.indexOf(p);
      if (el.checked && i < 0) S.draft.pos.push(p);
      if (!el.checked && i >= 0) S.draft.pos.splice(i, 1);
      save();
    }));
    $$('[data-hint]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.hint;
      S.hints[k] = Math.min(3, (S.hints[k] || 0) + 1);
      save(); renderWizard();
    }));
    const prev = $('#wPrev');
    if (prev) prev.addEventListener('click', () => {
      readDraftFromDom();
      S.wstep = Math.max(1, step - 1); save(); renderWizard();
    });
    const next = $('#wNext');
    if (next) next.addEventListener('click', () => {
      readDraftFromDom();
      const st = WSTEPS.find(s => s.n === step);
      if (!stepFilled(st.key, S.draft)) { toast('필수 항목을 채워 주세요.'); return; }
      if (step === 3) {
        const g = num(S.draft.groove), r = num(S.draft.root);
        if (g && (g < 20 || g > 90)) { toast('개선각 범위를 확인하세요(20~90°).'); return; }
      }
      if (step === 4) {
        const a = num(S.draft.tMin), b = num(S.draft.tMax);
        if (isFinite(a) && isFinite(b) && a > b) { toast('최소 두께가 최대 두께보다 큽니다.'); return; }
      }
      if (step === 10) {
        const a = num(S.draft.ampMin), b = num(S.draft.ampMax);
        if (isFinite(a) && isFinite(b) && a >= b) { toast('전류 최소값이 최대값보다 큽니다.'); return; }
      }
      S.wstep = Math.min(11, step + 1); save(); renderWizard();
    });
    const sub = $('#wSubmit');
    if (sub) sub.addEventListener('click', () => { readDraftFromDom(); submitDraft(); });
    const clr = $('#wClear');
    if (clr) clr.addEventListener('click', () => {
      if (!confirm('작성한 내용을 모두 지우고 처음부터 시작할까요?')) return;
      S.draft = emptyDraft(); S.hints = {}; S.lock = null; S.wstep = 1; save(); renderWizard();
    });
  }
  function readDraftFromDom() {
    $$('[data-f]').forEach(el => {
      const k = el.dataset.f;
      if (el.type === 'checkbox') S.draft[k] = el.checked; else S.draft[k] = el.value;
    });
    save();
  }

  /* ---------------------------------------------------------------- grading */
  const CHECKS = [
    { key: 'pqr', step: 1, name: '지원 PQR', v: 'TASK', w: 3, clause: '6.1', fatal: false,
      test: d => d.pqr === ANSWER.pqr, got: d => d.pqr || '미입력', exp: () => ANSWER.pqr,
      why: '과제서가 지정한 지원 PQR은 ED-PQR-001 하나뿐입니다. 다른 PQR을 적으면 어떤 인정 범위도 근거가 없습니다.' },
    { key: 'route', step: 1, name: '인정 경로', v: 'TASK', w: 3, clause: '5.1 / 6.1', fatal: false,
      test: d => d.route === 'clause6', got: d => d.route === 'clause5' ? 'Clause 5 사전인정' : (d.route === 'clause6' ? 'Clause 6 시험인정' : '미입력'),
      exp: () => 'Clause 6 시험인정',
      why: 'PQR을 근거로 쓰는 WPS이므로 Clause 6 경로입니다. 사전인정으로 적으면 PQR이 왜 붙어 있는지 설명이 되지 않습니다.' },
    { key: 'hdrNo', step: 1, name: 'WPS No. 형식', v: 'FORMAT', w: 2, clause: '5.2', fatal: false,
      test: d => /^[A-Za-z0-9][A-Za-z0-9\-]{2,}$/.test(String(d.hdrNo || '')), got: d => d.hdrNo || '미입력', exp: () => '영문·숫자·- 조합 3자 이상',
      why: '문서 번호는 추적의 시작입니다. 공백이나 특수문자 없이 규칙적인 형식으로 부여합니다.' },
    { key: 'process', step: 2, name: '공정', v: 'E', w: 5, clause: 'Table 6.6', fatal: true,
      test: d => d.process === 'FCAW-G', got: d => d.process || '미입력', exp: () => 'FCAW-G',
      why: '과제서와 PQR이 모두 FCAW(가스 차폐)입니다. 공정 변경은 대표적인 필수변수로 새 PQR이 필요합니다.' },
    { key: 'method', step: 2, name: '작업 형태', v: 'N', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => d.method === 'semi', got: d => d.method || '미입력', exp: () => '반자동',
      why: 'FCAW는 반자동이 표준입니다. 작업 형태는 대부분 비필수지만 WPS에 정확히 적어야 합니다.' },
    { key: 'joint', step: 3, name: '이음 상세', v: 'E', w: 5, clause: 'Figure 5.1 / Table 6.6', fatal: true,
      test: d => d.joint === 'B-U2a-S', got: d => d.joint || '미입력', exp: () => 'B-U2a-S',
      why: '과제는 철제 백킹을 유지하는 맞대기 single-V 완전용입입니다. 그루브 형상 변경은 필수변수입니다.' },
    { key: 'groove', step: 3, name: '개선각', v: 'FORMAT', w: 2, clause: 'Figure 5.1', fatal: false,
      test: d => num(d.groove) >= 40 && num(d.groove) <= 50, got: d => (d.groove || '미입력') + ' °', exp: () => '40 ~ 50 ° (과제 45°)',
      why: '개선각이 상세의 허용 범위를 벗어나면 사전인정 상세가 아닙니다. 이 과제는 45°입니다.' },
    { key: 'root', step: 3, name: '루트 개구부', v: 'N', w: 2, clause: 'Figure 5.1', fatal: false,
      test: d => num(d.root) >= 4 && num(d.root) <= 8, got: d => (d.root || '미입력') + ' mm', exp: () => '4 ~ 8 mm (과제 6 mm)',
      why: '루트 개구부는 상세 치수입니다. 범위를 벗어나면 상세가 달라져 사전인정이 깨집니다.' },
    { key: 'backing', step: 3, name: '백킹', v: 'E', w: 5, clause: 'Table 6.6', fatal: true,
      test: d => d.backing === 'steel', got: d => ({ steel: '철제', ceramic: '세라믹', none: '없음' }[d.backing] || '미입력'), exp: () => '철제 백킹',
      why: 'PQR과 과제 모두 백킹을 사용합니다. 백킹을 빼는 변경은 재인정 대상입니다.' },
    { key: 'bspec', step: 4, name: '모재 규격·등급', v: 'TASK', w: 3, clause: 'Table 5.3', fatal: false,
      test: d => d.bspec === 'A992' && d.bgrade === 'Gr.50', got: d => (d.bspec || '—') + ' ' + (d.bgrade || ''), exp: () => 'ASTM A992 Gr.50',
      why: '과제서의 모재는 A992 Gr.50입니다. 같은 Group II 안이라면 A572 Gr.50도 코드상 가능하지만, 과제는 지정 모재를 요구합니다.' },
    { key: 'group', step: 4, name: '모재 Group', v: 'E', w: 5, clause: 'Table 5.3 / 6.6', fatal: true,
      test: d => d.group === 'II', got: d => 'Group ' + (d.group || '미입력'), exp: () => 'Group II',
      why: 'A992는 50 ksi급 Group II입니다. Group이 바뀌면 모재 변경으로 재인정 대상입니다.' },
    { key: 'tMin', step: 4, name: '최소 두께', v: 'E', w: 5, clause: 'Table 6.2', fatal: true,
      test: d => num(d.tMin) >= 3 && num(d.tMin) <= 25, got: d => (d.tMin || '미입력') + ' mm', exp: () => '3 mm 이상, 25 mm 이하',
      why: 'Table 6.2의 최소 인정 두께는 1/8"(3 mm)입니다. 최소값이 3 mm보다 작으면 인정 범위를 넘고, 25 mm보다 크면 과제 부재를 포함하지 못합니다.' },
    { key: 'tMax', step: 4, name: '최대 두께', v: 'E', w: 5, clause: 'Table 6.2', fatal: true,
      test: d => num(d.tMax) >= 25 && num(d.tMax) <= 32, got: d => (d.tMax || '미입력') + ' mm', exp: () => '25 mm 이상, 32 mm 이하',
      why: '시험편 16 mm이므로 인정 최대 두께는 2T = 32 mm입니다. 과제 부재 25 mm를 포함해야 하고, 32 mm를 넘으면 인정 범위를 벗어납니다.' },
    { key: 'fclass', step: 5, name: '용가재 분류', v: 'E', w: 5, clause: 'Table 6.6', fatal: true,
      test: d => d.fclass === 'E71T-1', got: d => d.fclass || '미입력', exp: () => 'E71T-1',
      why: '과제서와 PQR의 용가재는 E71T-1입니다. F-No.·A-No.를 유지해도 분류·차폐 방식이 달라지면 재인정입니다.' },
    { key: 'fno', step: 5, name: 'F-No. / A-No.', v: 'FORMAT', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => num(d.fno) === 6 && num(d.ano) === 1, got: d => 'F' + (d.fno || '—') + '/A' + (d.ano || '—'), exp: () => 'F6 / A1',
      why: 'E71T-1은 F6/A1입니다. 분류와 F/A-No.가 어긋나면 WPS 자체가 모순입니다.' },
    { key: 'dia', step: 5, name: '직경', v: 'N', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => num(d.dia) >= 1.0 && num(d.dia) <= 1.6, got: d => (d.dia || '미입력') + ' mm', exp: () => 'Ø1.0 ~ 1.6 mm',
      why: '직경은 필수변수가 아니지만 WPS 기재 사항입니다. 현장 사용 범위 안에서 적습니다.' },
    { key: 'pos', step: 6, name: '자세', v: 'E', w: 5, clause: 'Table 6.1', fatal: true,
      test: d => d.pos.length === 1 && d.pos[0] === '1G', got: d => (d.pos.join(', ') || '미입력'), exp: () => '1G (아래보기)',
      why: 'PQR은 1G로 시험했고 Table 6.1에서 1G는 F(아래보기)만 인정합니다. 3G·4G를 넣으면 인정 범위를 넘습니다.' },
    { key: 'pwht', step: 7, name: 'PWHT', v: 'E', w: 5, clause: '5.9', fatal: true,
      test: d => d.pwht === 'none', got: d => (d.pwht === 'yes' ? '있음' : (d.pwht === 'none' ? '없음' : '미입력')), exp: () => '없음',
      why: 'PQR과 과제서 모두 PWHT가 없습니다. PWHT 유무는 필수변수라 임의로 넣을 수 없습니다.' },
    { key: 'preheat', step: 8, name: '최소 예열', v: 'E', w: 5, clause: '5.7 / Table 5.8', fatal: true,
      test: d => num(d.preheat) >= 10 && num(d.preheat) <= 250, got: d => (d.preheat || '미입력') + ' °C', exp: () => '10 °C 이상',
      why: 'A992(범주 B) 25 mm의 Table 5.8 최소 예열은 50°F(10°C)입니다. 이보다 낮추면 코드 위반이자 필수변수 변경입니다.' },
    { key: 'interpass', step: 8, name: '최대 층간', v: 'S', w: 3, clause: 'Table 6.7', fatal: false,
      test: d => num(d.interpass) > 0 && num(d.interpass) <= 230, got: d => (d.interpass || '미입력') + ' °C', exp: () => '230 °C 이하',
      why: '과제서 상한은 230 °C입니다. 충격시험 요구 공사라면 이 상한을 올리는 변경이 재인정 사유가 됩니다.' },
    { key: 'gas', step: 9, name: '차폐가스 조성', v: 'E', w: 5, clause: '5.6 / Table 5.7', fatal: true,
      test: d => d.gas === 'CO2', got: d => ({ CO2: 'CO2 100%', Ar75: 'Ar75/CO2 25', Ar: 'Ar 100%', none: '자기 차폐' }[d.gas] || '미입력'), exp: () => 'CO2 100 %',
      why: 'PQR의 차폐가스는 CO2 100 %입니다. 조성 변경은 필수변수입니다.' },
    { key: 'flow', step: 9, name: '유량', v: 'PRACTICE', w: 2, clause: '5.6', fatal: false,
      test: d => num(d.flow) >= 15 && num(d.flow) <= 25, got: d => (d.flow || '미입력') + ' L/min', exp: () => '15 ~ 25 L/min',
      why: '유량은 비필수지만, 이 두께의 FCAW에서 실무 범위를 벗어나면 기공·융합 불량으로 이어집니다.' },
    { key: 'polarity', step: 10, name: '극성', v: 'E', w: 5, clause: 'Table 6.6', fatal: true,
      test: d => d.polarity === 'DCEP', got: d => d.polarity || '미입력', exp: () => 'DCEP',
      why: 'FCAW·SMAW의 표준은 DCEP입니다. 극성 변경은 필수변수입니다.' },
    { key: 'amp', step: 10, name: '전류 범위', v: 'N', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => { const a = num(d.ampMin), b = num(d.ampMax); return a >= 150 && a < b && b <= 320; }, got: d => (d.ampMin || '—') + '~' + (d.ampMax || '—') + ' A', exp: () => '150~320 A 범위 안에서 최소<최대',
      why: '전류 범위 자체는 비필수지만, WPS에 적은 범위가 실제 운전 범위와 맞아야 합니다. 최소가 최대보다 크면 형식 오류입니다.' },
    { key: 'volt', step: 10, name: '전압 범위', v: 'N', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => { const a = num(d.voltMin), b = num(d.voltMax); return a >= 18 && a < b && b <= 40; }, got: d => (d.voltMin || '—') + '~' + (d.voltMax || '—') + ' V', exp: () => '18~40 V 범위 안에서 최소<최대',
      why: '전압은 입열량과 아크 안정성에 직결됩니다. 범위 표기가 뒤집히면 형식 오류입니다.' },
    { key: 'hi', step: 10, name: '입열량', v: 'S', w: 3, clause: 'Table 6.7', fatal: false,
      test: d => { const h = num(d.hi); return h > 0 && h <= 2.0 && Math.abs(h - heatInput(d.ampMax, d.voltMax, d.speed)) <= 0.35; },
      got: d => (d.hi || '미입력') + ' kJ/mm', exp: () => '계산값 ±0.35, 2.0 kJ/mm 이하',
      why: 'H = (전압 × 전류 × 60) ÷ (1000 × 이동속도). 최대 조건(240 A·26 V·30 cm/min)으로 1.25 kJ/mm이며 상한 2.0을 넘지 않습니다.' },
    { key: 'passes', step: 10, name: '패스 방식', v: 'N', w: 2, clause: 'Table 6.7', fatal: false,
      test: d => d.passes === 'multi', got: d => ({ multi: '다층', single: '단층' }[d.passes] || '미입력'), exp: () => '다층 다패스',
      why: '이 두께의 CJP는 다층이 표준입니다. CVN 요구 공사에서 단층↔다층 변경은 재인정 사유입니다.' },
    { key: 'backgouge', step: 10, name: '백가우징', v: 'N', w: 2, clause: 'Table 6.6', fatal: false,
      test: d => d.backgouge === 'none', got: d => ({ none: '없음', gouging: '있음' }[d.backgouge] || '미입력'), exp: () => '없음 (-S 상세)',
      why: '철제 백킹을 유지하는 -S 상세이므로 백가우징이 없습니다. 백가우징을 넣으면 -GF 계열 상세가 됩니다.' },
    { key: 'peening', step: 10, name: '피닝', v: 'N', w: 2, clause: '5.2', fatal: false,
      test: d => d.peening === false, got: d => (d.peening ? '실시' : '미실시'), exp: () => '미실시',
      why: '피닝은 원칙적으로 허용되지 않습니다. 코드가 허용하는 경우에만 기재합니다.' }
  ];

  const POINT_OF = {
    pqr: 1, route: 1, hdrNo: 1, process: 2, method: 2, joint: 3, groove: 3, root: 3, backing: 3,
    bspec: 4, group: 4, tMin: 4, tMax: 4, fclass: 5, fno: 5, dia: 5, pos: 6, pwht: 7,
    preheat: 8, interpass: 8, gas: 9, flow: 9, polarity: 11, amp: 10, volt: 10, hi: 10,
    passes: 12, backgouge: 12, peening: 12
  };

  function grade(d) {
    const results = CHECKS.map(c => {
      const ok = !!c.test(d);
      return { key: c.key, step: c.step, name: c.name, v: c.v, w: c.w, clause: c.clause, fatal: c.fatal,
        ok: ok, got: c.got(d), exp: c.exp(), why: c.why };
    });
    const hintPenalty = Object.keys(S.hints).reduce((s, k) => s + Math.max(0, (S.hints[k] || 0) - 1) * 0.5, 0);
    const total = results.reduce((s, r) => s + r.w, 0);
    const earned = results.reduce((s, r) => s + (r.ok ? r.w : 0), 0);
    const raw = Math.max(0, (earned / total) * 100 - hintPenalty);
    const score = Math.round(raw);
    const fatal = results.filter(r => r.fatal && !r.ok);
    const pass = score >= 80 && fatal.length === 0;
    const cats = {};
    results.forEach(r => { cats[r.v] = cats[r.v] || { got: 0, all: 0 }; cats[r.v].all += r.w; if (r.ok) cats[r.v].got += r.w; });
    return { score: score, pass: pass, fatal: fatal, results: results, cats: cats, hintPenalty: hintPenalty,
      at: new Date().toISOString(), attemptNo: S.attempts.length + 1, name: S.name };
  }

  function submitDraft() {
    const miss = missingRequired(S.draft);
    if (miss.length) { toast('미입력 항목이 있습니다: ' + miss.slice(0, 3).join(', ')); return; }
    const g = grade(S.draft);
    S.attempts.push(g);
    S.lastResult = g;
    S.lock = null;
    save();
    go('s5');
  }

  /* ================================================================= S5 */
  function renderResult() {
    const r = S.lastResult || S.attempts[S.attempts.length - 1];
    if (!r) { go('s0'); return; }
    const cats = ['E', 'S', 'N', 'TASK', 'FORMAT', 'PRACTICE'];
    const badPoints = []; // which of the 12 points had errors
    r.results.forEach(x => { if (!x.ok) { const pt = POINT_OF[x.key] || x.step; if (badPoints.indexOf(pt) < 0) badPoints.push(pt); } });
    $('#s5').innerHTML = `
      <div class="card scorebox">
        <div class="bigscore">
          <div class="num">${r.score}</div>
          <div class="of">/ 100</div>
          <div class="verdict ${r.pass ? 'pass' : 'fail'}">${r.pass ? '합격' : (r.fatal.length ? '불합격 · 치명 오류 ' + r.fatal.length + '건' : '불합격 · 80점 미만')}</div>
        </div>
        <div>
          <div class="spread" style="margin-bottom:10px">
            <div>
              <div class="eyebrow">실습 ④ · 채점 결과</div>
              <div class="h2">${esc(S.name || '수강생')} · ${r.attemptNo}회차</div>
            </div>
            <span class="badge base">합격선 80점 + 치명 오류 0건</span>
          </div>
          <div class="bars">
            ${cats.filter(c => r.cats[c]).map(c => {
              const o = r.cats[c];
              const pct = Math.round((o.got / o.all) * 100);
              return `<div class="bar"><span class="badge ${c}">${labelVerdict(c)}</span>
                <span class="track"><i style="width:${pct}%"></i></span>
                <span class="n">${o.got.toFixed(0)} / ${o.all}</span></div>`;
            }).join('')}
          </div>
          <div class="sub" style="font-size:12px;margin-top:10px">
            힌트 감점 ${r.hintPenalty.toFixed(1)}점 · 오답 ${r.results.filter(x => !x.ok).length}건
            ${r.fatal.length ? ' · 실제라면 이 WPS는 반려됩니다.' : ''}
          </div>
        </div>
      </div>

      <div class="grid2" style="margin-top:14px">
        <div class="card pad">
          <div class="h3" style="margin-bottom:8px">12포인트 히트맵</div>
          <div class="heat">
            ${POINTS.map(p => `<div class="cell ${badPoints.indexOf(p.n) >= 0 ? 'bad' : 'good'}" title="${esc(p.name)}">${p.n}</div>`).join('')}
          </div>
          <div class="sub" style="font-size:12px;margin-top:8px">빨간 칸은 그 포인트에서 오답이 나온 항목입니다. 눌러서 독도 화면으로 확인할 수 있습니다.</div>
        </div>
        <div class="card pad">
          <div class="h3" style="margin-bottom:8px">다음 단계</div>
          <div class="sub" style="font-size:12.5px">
            ${r.pass
        ? '인정 범위 안에서 값을 골랐습니다. 실제 업무에서는 이 WPS를 도면·발주처 시방과 다시 대조하고, 용접사 자격(WPQ)의 자세·두께와도 맞춰야 합니다.'
        : '오답 리뷰에서 “왜 그 값인지”를 확인한 뒤, 틀린 칸만 고쳐 다시 제출해 보세요. 점수는 회차별로 남습니다.'}
          </div>
          <div class="row" style="margin-top:10px">
            <button type="button" class="btn" id="toReview">오답 리뷰 →</button>
            <button type="button" class="btn sec" id="retryWrong">${r.pass ? '한 번 더 작성' : '틀린 칸만 고치기'}</button>
            <button type="button" class="btn quiet" id="toHome">홈으로</button>
          </div>
        </div>
      </div>

      ${r.fatal.length ? `<div class="card pad" style="margin-top:14px;border-color:#ecc3bd;background:#fdf8f7">
        <div class="h3" style="color:var(--E)">치명 오류 — 이 항목이 있으면 점수와 무관하게 반려</div>
        <ul style="margin:8px 0 0;padding-left:18px;font-size:13px">
          ${r.fatal.map(f => `<li><b>${esc(f.name)}</b> — ${esc(f.why)}</li>`).join('')}
        </ul>
      </div>` : ''}
      `;
    $('#toReview').addEventListener('click', () => go('s6'));
    $('#toHome').addEventListener('click', () => go('s0'));
    $('#retryWrong').addEventListener('click', () => {
      if (r.pass) { S.draft = emptyDraft(); S.hints = {}; S.wstep = 1; S.lock = null; }
      else {
        const wrong = r.results.filter(x => !x.ok);
        S.lock = r.results.filter(x => x.ok).map(x => x.key);
        if (r.results.some(x => x.key === 'pos' && x.ok)) S.lock.push('pos');
        S.wstep = wrong.length ? wrong[0].step : 1;
      }
      save(); go('s4');
    });
    $$('#s5 .heat .cell').forEach((c, i) => c.addEventListener('click', () => { openPoint(POINTS[i].n); go('s2', { force: true }); }));
  }
  function labelVerdict(v) {
    return { E: 'E 필수', S: 'S 보충', N: 'N 비필수', TASK: '과제', FORMAT: '형식', PRACTICE: '실무' }[v] || v;
  }

  /* ================================================================= S6 */
  function renderReview() {
    const r = S.lastResult || S.attempts[S.attempts.length - 1];
    if (!r) { go('s0'); return; }
    const wrong = r.results.filter(x => !x.ok);
    const order = { E: 0, S: 1, TASK: 2, PRACTICE: 3, N: 4, FORMAT: 5 };
    wrong.sort((a, b) => (order[a.v] - order[b.v]));
    $('#s6').innerHTML = `
      <div class="spread" style="margin-bottom:12px">
        <div>
          <div class="eyebrow">오답 리뷰</div>
          <div class="h1" style="font-size:22px">${wrong.length ? '틀린 ' + wrong.length + '건의 근거' : '오답이 없습니다'}</div>
        </div>
        <div class="row">
          <button type="button" class="btn sec sm" id="backResult">결과로</button>
          <button type="button" class="btn sm" id="backWrite">작성 화면으로</button>
        </div>
      </div>
      ${wrong.length === 0 ? '<div class="card pad">모든 항목이 인정 범위 안입니다. 같은 과제를 다른 조건(두께·자세)으로 바꿔 다시 해 보면 더 오래 남습니다.</div>' :
        wrong.map(x => `
        <div class="revitem">
          <div class="head">
            <span class="badge ${esc(x.v)}">${esc(labelVerdict(x.v))}</span>
            <span class="fieldname">${esc(x.name)}</span>
            <button type="button" class="chip" data-gloss="g66">${esc(x.clause)}</button>
            <button type="button" class="chip" data-jump="${POINT_OF[x.key] || x.step}">독도 ${POINT_OF[x.key] || x.step}번에서 보기</button>
          </div>
          <div class="got">내 입력 <span class="no">${esc(x.got)}</span> → 기대 <span class="yes">${esc(x.exp)}</span></div>
          <div class="sub" style="font-size:12.5px;margin-top:4px">${esc(x.why)}</div>
        </div>`).join('')}
      <div class="card pad" style="margin-top:12px">
        <div class="h3">점수 요약</div>
        <div class="sub" style="font-size:12.5px">${r.score}점 · ${r.attemptNo}회차 · 오답 ${wrong.length}건 · 힌트 감점 ${r.hintPenalty.toFixed(1)}점</div>
        <button type="button" class="btn sm sec" id="exportOne" style="margin-top:8px">이 결과 JSON 내보내기</button>
      </div>`;
    $('#backResult').addEventListener('click', () => go('s5'));
    $('#backWrite').addEventListener('click', () => go('s4'));
    $('#exportOne').addEventListener('click', () => downloadJSON(r, 'wps-result'));
    $$('[data-jump]').forEach(b => b.addEventListener('click', () => { openPoint(+b.dataset.jump); go('s2', { force: true }); }));
    $$('[data-gloss]').forEach(b => b.addEventListener('click', () => openGlossary(b.dataset.gloss)));
  }

  /* ================================================================= glossary */
  function openGlossary(key) {
    const ov = $('#overlay');
    ov.hidden = false;
    renderGlossary('');
    const s = $('#glossSearch');
    s.value = '';
    s.oninput = () => renderGlossary(s.value);
    setTimeout(() => s.focus(), 40);
    if (key) {
      setTimeout(() => {
        const item = document.querySelector('[data-gk="' + key + '"]');
        if (item) { item.classList.add('open'); item.scrollIntoView({ block: 'center' }); }
      }, 60);
    }
  }
  function renderGlossary(q) {
    const term = String(q || '').toLowerCase();
    const list = GLOSSARY.filter(g => !term || (g.key + ' ' + g.title + ' ' + g.summary + ' ' + g.body + ' ' + g.tag).toLowerCase().indexOf(term) >= 0);
    $('#glossBody').innerHTML = list.length ? list.map(g => `
      <div class="gitem" data-gk="${esc(g.id)}">
        <div class="gt"><span class="chip">${esc(g.label)}</span><b>${esc(g.title)}</b><span class="badge base">${esc(g.tag)}</span></div>
        <div class="gs">${esc(g.summary)}</div>
        <div class="gb">${esc(g.body)}</div>
      </div>`).join('') : '<div class="sub" style="padding:14px 0">찾는 조항이 없습니다. 5.8 · 6.1 · 6.2 · 6.6 · F-No. · 백킹 같은 키워드로 검색해 보세요.</div>';
    $$('#glossBody .gitem').forEach(el => el.addEventListener('click', () => el.classList.toggle('open')));
  }

  /* ================================================================= instructor */
  function openInstructor() {
    const ov = $('#overlay');
    ov.hidden = false;
    const r = S.lastResult || S.attempts[S.attempts.length - 1];
    const wrongKeys = r ? r.results.filter(x => !x.ok) : [];
    const byKey = {};
    S.attempts.forEach(a => a.results.filter(x => !x.ok).forEach(x => { byKey[x.name] = (byKey[x.name] || 0) + 1; }));
    $('#glossBody').innerHTML = `
      <div class="gitem open">
        <div class="gt"><b>수강생 · 진행</b></div>
        <div class="gs">${esc(S.name || '(이름 없음)')} · 세션 ${esc(S.session || '미시작')} · 경과 ${mmss(elapsed())}</div>
        <div class="gb">독도 ${S.readVisited.length}/12 · 퀘스트 ${questRight()}/3 · 시나리오 ${Object.keys(S.sim.answers).length}/3 · 제출 ${S.attempts.length}회</div>
      </div>
      <div class="gitem open">
        <div class="gt"><b>점수 추이</b></div>
        <div class="gs">${S.attempts.length ? S.attempts.map((a, i) => (i + 1) + '회 ' + a.score + '점' + (a.pass ? ' ✅' : '')).join(' · ') : '기록 없음'}</div>
      </div>
      <div class="gitem open">
        <div class="gt"><b>많이 틀린 항목</b></div>
        <div class="gs">${Object.keys(byKey).length ? Object.keys(byKey).map(k => esc(k) + ' ' + byKey[k] + '회').join(' · ') : '없음'}</div>
      </div>
      <div class="gitem open">
        <div class="gt"><b>내보내기 · 초기화</b></div>
        <div class="gs">
          <button type="button" class="btn sm sec" id="insExport">전체 기록 JSON</button>
          <button type="button" class="btn sm sec" id="insRows">결과 CSV</button>
          <button type="button" class="btn sm sec" id="insReset">기록 초기화</button>
        </div>
        <div class="gb">수강생 화면에서 내려받아 강사 PC로 모으는 용도입니다. 서버로 전송되지 않습니다.</div>
      </div>
      <div class="gitem open">
        <div class="gt"><b>이번 회차 오답 요약</b></div>
        <div class="gs">${wrongKeys.length ? wrongKeys.map(w => esc(w.name) + ' (기대: ' + esc(w.exp) + ')').join('<br/>') : '오답 없음'}</div>
      </div>`;
    $('#insExport').addEventListener('click', () => downloadJSON({ student: S.name, attempts: S.attempts, progress: { read: S.readVisited, quest: S.quest, sim: S.sim } }, 'wps-class-record'));
    $('#insRows').addEventListener('click', () => downloadCSV());
    $('#insReset').addEventListener('click', () => {
      if (!confirm('이 브라우저의 기록을 모두 지울까요?')) return;
      S = blank(); save(); closeOverlay(); renderStepper(); go('s0');
    });
  }
  function downloadJSON(obj, name) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('파일을 내려받았습니다.');
  }
  function downloadCSV() {
    const rows = [['회차', '이름', '점수', '합격', '치명오류', '오답건수', '시각']];
    S.attempts.forEach((a, i) => rows.push([i + 1, a.name || '', a.score, a.pass ? 'Y' : 'N', a.fatal.length, a.results.filter(x => !x.ok).length, a.at]));
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wps-results-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    toast('CSV를 내려받았습니다.');
  }
  function closeOverlay() { $('#overlay').hidden = true; }

  /* ================================================================= boot */
  function elapsed() {
    return S.startedAt ? (Date.now() - S.startedAt) : 0;
  }
  function tick() {
    const t = $('#timer');
    if (t) t.textContent = mmss(elapsed());
  }

  function boot() {
    $('#btnGlossary').addEventListener('click', () => openGlossary(null));
    $('#btnHome').addEventListener('click', () => go('s0', { force: true }));
    $('#glossClose').addEventListener('click', closeOverlay);
    $('#overlay').addEventListener('click', (e) => { if (e.target === $('#overlay')) closeOverlay(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });
    $('#btnInstructor').addEventListener('click', openInstructor);
    renderStepper();
    go(S.current || 's0', { force: true });
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // 테스트용 노출
  window.__WPS = { get state() { return S; }, grade: grade, engine: { preheatCalc, thicknessRange, heatInput, posQual, fillerByClass }, ANSWERS: ANSWER };
})();
