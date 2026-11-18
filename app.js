/* =========================================================================
   WPS작성 실습 — 화면 전환 · 전화 연출 · 공백 WPS · 채점 · 파단 연출
   의존: data.js
   ========================================================================= */
(function(){
  'use strict';

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const state = { scene:'landing', answers:{}, timers:[] };
  const SCENES = ['landing','call','brief','wps','result'];
  const sceneEl = id => document.getElementById('scene-' + id);
  const TRAY = [
    { fid:'filler',   label:'필러' },
    { fid:'preheat',  label:'예열' },
    { fid:'prequal',  label:'인정 방식' },
    { fid:'position', label:'자세' }
  ];

  function later(fn, ms){ const t = setTimeout(fn, ms); state.timers.push(t); return t; }
  function clearTimers(){ state.timers.forEach(clearTimeout); state.timers = []; }

  /* ── 화면 전환 ───────────────────────────────────────────── */
  function show(id, opts={}){
    clearTimers();
    closePop();
    state.scene = id;
    SCENES.forEach(s => { const el = sceneEl(s); if(el) el.classList.toggle('show', s === id); });
    $('#siteTop').classList.toggle('on', id !== 'landing');
    updateDots(id);

    if(id === 'call')  renderCall(opts.skipIntro);
    if(id === 'brief') renderBrief();
    if(id === 'wps')   renderWps();
    if(id === 'result') renderResult(opts.result);

    if(id !== 'landing') window.scrollTo({top:0, behavior:'auto'});
  }

  function updateDots(id){
    const idx = ['call','brief','wps','result'].indexOf(id);
    $$('#progressDots i').forEach((el, i) => {
      el.className = i < idx ? 'done' : (i === idx ? 'now' : '');
    });
  }

  /* ======================================================================
     장면 1 — 전화
     ====================================================================== */
  function renderCall(skip){
    const s = SCENARIO.meta;
    const root = sceneEl('call');
    root.innerHTML = `
      <div class="call-wrap">
        <div class="call-stage">
          <div class="call-time">${s.place} · ${s.time}</div>
          <div class="phone" id="phone">
            <div class="call-top">
              <div class="avatar" id="callAvatar">
                <span class="ring"></span><span class="ring"></span><span class="ring"></span>
                박
              </div>
              <div class="call-who">
                <b>${s.caller}</b>
                <span>${s.callerRole} · 현장</span>
              </div>
              <div class="call-state" id="callState"><span id="callStateText">수신 중</span></div>
            </div>
            <div class="dialog" id="dialog" aria-live="polite"></div>
            <div class="monologue" id="monologue" hidden></div>
            <div class="call-actions" id="callActions">
              <button class="btn ghost" type="button" id="btnSkipCall">건너뛰기</button>
            </div>
          </div>
          <div class="scene-foot" id="callFoot">
            <button class="btn primary" type="button" id="btnToBrief">다음 <span class="arrow" aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>`;

    const phone = $('#phone', root);
    const dialog = $('#dialog', root);
    const stateText = $('#callStateText', root);
    const mono = $('#monologue', root);
    const foot = $('#callFoot', root);
    const actions = $('#callActions', root);

    phone.classList.add('ringing');
    stateText.textContent = '수신 중';

    const addLine = item => {
      const el = document.createElement('div');
      el.className = 'line' + (item.me ? ' me' : '') + (item.strong ? ' strong' : '');
      el.innerHTML = `<div class="who">${item.who}</div><div class="say">${item.t}</div>`;
      dialog.appendChild(el);
      dialog.scrollTop = dialog.scrollHeight;
    };

    function startTalk(){
      phone.classList.remove('ringing');
      stateText.textContent = '통화 중';
      const bars = document.createElement('span');
      bars.className = 'bar';
      bars.innerHTML = '<i></i><i></i><i></i><i></i>';
      $('#callState', root).appendChild(bars);

      let t = 350;
      SCENARIO.call.forEach(item => {
        later(() => addLine(item), t);
        const plain = item.t.replace(/<[^>]+>/g, '');
        t += Math.max(1400, Math.min(3200, 700 + plain.length * 55));
      });
      later(endTalk, t + 400);
    }

    function endTalk(collapse=true){
      stateText.textContent = '통화 종료';
      const bars = $('#callState .bar', root);
      if(bars) bars.remove();
      mono.hidden = false;
      mono.innerHTML = SCENARIO.monologue.map((m, i) =>
        `<div class="m-line" style="animation-delay:${i * .8}s">${m}</div>`
      ).join('') + `<div class="m-sign">${SCENARIO.meta.me} — 품질관리자</div>`;
      if(collapse){
        dialog.style.transition = 'opacity .5s, max-height .6s';
        dialog.style.maxHeight = dialog.scrollHeight + 'px';
        later(() => { dialog.style.opacity = '0'; dialog.style.maxHeight = '0'; dialog.style.overflow = 'hidden'; }, 700);
      }
      actions.innerHTML = '';
      later(() => { foot.classList.add('on'); foot.scrollIntoView({behavior:'smooth', block:'center'}); }, 1100);
    }

    function skipAll(){
      clearTimers();
      dialog.innerHTML = '';
      SCENARIO.call.forEach(addLine);
      phone.classList.remove('ringing');
      stateText.textContent = '통화 종료';
      endTalk(false);
    }

    if(skip) skipAll(); else later(startTalk, 2100);

    root.addEventListener('click', e => {
      if(e.target.closest('#btnSkipCall') || e.target.closest('#btnSkipCall2')) skipAll();
      if(e.target.closest('#btnToBrief')) show('brief');
    });
  }

  /* ======================================================================
     장면 2 — 브리핑
     ====================================================================== */
  function renderBrief(){
    const b = BRIEF;
    const root = sceneEl('brief');
    root.innerHTML = `
      <div class="scene-inner">
        <div class="scene-head">
          <div>
            <div class="scene-kicker">장면 2 · 브리핑</div>
            <h2 class="scene-title">내일 붙일 자리는 여기입니다</h2>
            <p class="scene-sub">도면 ${b.code} / ${b.detail} — 보 웨브에 브래킷을 세워 붙이는 수직 필렛. 절차서에 적을 값은 여기와 <b>자료함</b>에서 나옵니다.</p>
          </div>
        </div>

        <div class="brief-grid">
          <div class="visual-card" id="briefVisual">
            <span class="tag">단면 · SECTION B-B / ${b.code}–${b.detail}</span>
            ${beamSVG('intact')}
          </div>

          <div class="brief-side">
            <div class="spec-card">
              <h3>과제 정보</h3>
              <ul class="spec-list">
                <li><span class="k">재질</span><span class="v">${b.material}<small>${b.materialNote}</small></span></li>
                <li><span class="k">두께</span><span class="v">${b.thickness}<small>${b.thicknessNote}</small></span></li>
                <li><span class="k">부위</span><span class="v">${b.joint}<small>${b.jointNote}</small></span></li>
                <li><span class="k">다리 길이</span><span class="v">${b.leg}</span></li>
                <li><span class="k">공정</span><span class="v">${b.process}</span></li>
                <li><span class="k">작업 시한</span><span class="v">${b.date}</span></li>
              </ul>
            </div>

            <div class="drawer-box">
              <div class="drawer-head">
                <span class="tiny">자료함 · 3</span>
                <span class="drawer-hint">눌러서 확인 — 절차서의 빈칸이 여기 있습니다</span>
              </div>
              ${b.drawer.map((d, i) => `
                <details class="drawer" ${i === 0 ? '' : ''}>
                  <summary><span class="ic">${d.icon}</span><span class="tt">${d.title}</span><span class="sm">${d.short}</span></summary>
                  <div class="db">${d.body}</div>
                </details>`).join('')}
            </div>

            <div class="note-card">${b.env} · <b>내일 07:00 −3 °C 예보</b><br>
              추운 아침과 바람은 절차서의 예열·가스 차폐 판단에 그대로 걸립니다.</div>
          </div>
        </div>

        <div class="scene-foot on">
          <button class="btn primary" type="button" id="btnToWps">WPS작성 시작 <span class="arrow" aria-hidden="true">→</span></button>
          <button class="btn ghost" type="button" id="btnBackCall">이전</button>
        </div>
      </div>`;
    $('#btnToWps', root).addEventListener('click', () => show('wps'));
    $('#btnBackCall', root).addEventListener('click', () => show('call', {skipIntro:true}));
  }

  /* ======================================================================
     장면 3 — 공백 WPS
     ====================================================================== */
  function renderWps(){
    const root = sceneEl('wps');
    const groups = {};
    FIELDS.forEach(f => (groups[f.sec] = groups[f.sec] || []).push(f));

    const secHTML = Object.keys(groups).sort().map(k => {
      const s = SECTIONS[k];
      const cls = groups[k].length === 1 ? ' one' : (groups[k].length === 3 ? ' three' : '');
      return `<div class="wps-section">
        <div class="sec-head"><span class="n">${s.n}</span><span>${s.ko}</span><span style="color:#7d8794;font-weight:400">${s.en}</span></div>
        <div class="sec-grid${cls}">${groups[k].map(fieldHTML).join('')}</div>
      </div>`;
    }).join('');

    root.innerHTML = `
      <div class="scene-inner">
        <div class="scene-head">
          <div>
            <div class="scene-kicker">장면 3 · 작성</div>
            <h2 class="scene-title">빈 WPS 한 장</h2>
            <p class="scene-sub">칸에 마우스를 올리거나 손가락으로 누르면 정보가 뜹니다. <b style="color:#9ad9f5">파란 점</b>은 현장 정보, <b style="color:#ffbd83">주황 점</b>은 규격을 보고 판단하는 칸입니다. ⭐는 감리가 먼저 보는 칸.</p>
          </div>
          <div class="tray" id="tray" aria-label="놓친 정보">
            <span class="tray-k">놓친 정보</span>
            ${TRAY.map(t => `<span class="tray-i" data-tray="${t.fid}"><i>?</i>${t.label}</span>`).join('')}
          </div>
        </div>

        <div class="wps-shell">
          <div class="wps-doc" id="wpsDoc">
            <div class="doc-head">
              <div class="doc-title">
                <span class="en">Welding Procedure Specification</span>
                <span class="ko">용접절차 지시서</span>
                <span class="sub">AWS D1.1/D1.1M · Carbon Steel · Fillet</span>
              </div>
              <div class="doc-no">
                WPS No. <b>WPS-SM275-F01</b> · Rev. <b>0</b><br>
                기준 규격 <b>AWS D1.1</b> · Page 1 / 1<br>
                작성 <b>${SCENARIO.meta.me}</b>
              </div>
            </div>
            ${secHTML}
            <div class="doc-foot">
              <div>교육용 양식 · 수치는 판본 원문 대조 전 대표값입니다.<br>실제 제작에는 계약 지정 판본과 발주처 시방서를 적용하세요.</div>
              <div class="sig">
                <div><span class="k">Prepared</span><span class="v">${SCENARIO.meta.me}</span></div>
                <div><span class="k">Reviewed</span><span class="v">—</span></div>
                <div><span class="k">Approved</span><span class="v">—</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="submit-bar">
          <div class="stat">
            <span>작성 <b class="mono" id="fillCount">0</b> / ${FIELDS.length}</span>
            <div class="meter"><i id="meterBar"></i></div>
          </div>
          <div class="right">
            <button class="btn ghost" type="button" id="btnBackBrief">이전</button>
            <button class="btn primary" type="button" id="btnSubmit">제출하고 검토받기</button>
          </div>
        </div>
      </div>`;

    initFields(root);
    updateFillCount();
    $('#btnBackBrief', root).addEventListener('click', () => show('brief'));
    $('#btnSubmit', root).addEventListener('click', onSubmit);
  }

  function fieldHTML(f){
    const filled = state.answers[f.id];
    let ctl = '';
    if(f.ui === 'chips'){
      ctl = `<div class="chip-row" data-field="${f.id}">` + f.options.map(o =>
        `<button type="button" class="chip${filled === o ? ' on' : ''}" data-val="${esc(o)}">${o}</button>`
      ).join('') + `</div>`;
    } else {
      ctl = `<div class="${f.unit ? 'has-unit' : ''}">
        <input type="${f.ui === 'number' ? 'number' : 'text'}" ${f.ui === 'number' ? 'step="0.01" inputmode="decimal"' : ''}
          data-field="${f.id}" placeholder="${esc(f.ph || '')}"${filled ? ` value="${esc(filled)}"` : ''}
          autocomplete="off" spellcheck="false">
        ${f.unit ? `<span class="unit">${f.unit}</span>` : ''}
      </div>`;
    }

    return `<div class="field k-${f.kind}" data-fid="${f.id}">
      <div class="lab">
        <b>${f.key ? '<span class="star">★</span> ' : ''}${f.label}<button class="qm" type="button" data-hint="${f.id}" aria-label="${esc(f.label)} 근거 보기">?</button></b>
        <em>${f.en}</em>
      </div>
      <div class="ctl">${ctl}</div>
      <span class="kind-dot" aria-hidden="true"></span>
    </div>`;
  }

  function initFields(root){
    root.addEventListener('input', e => {
      const t = e.target;
      if(t.matches('input[data-field]')){
        state.answers[t.dataset.field] = t.value;
        t.closest('.field').classList.remove('missing','bad');
        updateFillCount();
      }
    });

    root.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if(chip){
        const row = chip.closest('.chip-row');
        $$('.chip', row).forEach(c => c.classList.remove('on'));
        chip.classList.add('on');
        state.answers[row.dataset.field] = chip.dataset.val;
        chip.closest('.field').classList.remove('missing','bad');
        updateFillCount();
        return;
      }
      const qm = e.target.closest('.qm');
      if(qm){ e.stopPropagation(); return; }
    });

    $$('.field', root).forEach(el => {
      const f = FIELDS.find(x => x.id === el.dataset.fid);
      if(!f) return;
      el.addEventListener('mouseenter', () => openPop(el, f));
      el.addEventListener('mouseleave', scheduleClose);
      el.addEventListener('focusin',  () => openPop(el, f));
      el.addEventListener('click', e => {
        if(e.target.closest('input, .chip, .qm')) return;
        openPop(el, f);
      });
      const qm = $('.qm', el);
      if(qm) qm.addEventListener('click', ev => { ev.stopPropagation(); openPop(el, f, true); });
    });
  }

  /* ── 팝오버 ────────────────────────────────────────────── */
  const pop = $('#pop');
  let popTimer = null, popField = null;

  function scheduleClose(){ clearTimeout(popTimer); popTimer = setTimeout(closePop, 240); }

  function closePop(){
    pop.classList.remove('on');
    pop.hidden = true;
    popField = null;
    $$('.field.act').forEach(e => e.classList.remove('act'));
  }

  function openPop(el, f, pinned){
    clearTimeout(popTimer);
    if(popField === f.id && pop.classList.contains('on') && !pinned) return;

    popField = f.id;
    $$('.field.act').forEach(e => e.classList.remove('act'));
    el.classList.add('act');

    const isGiven = f.kind === 'given';
    const canFill = f.ui !== 'chips' && f.pop.fill;
    pop.innerHTML = `
      <div class="pop-top">
        <span class="src ${isGiven ? 'given' : 'aws'}">${isGiven ? '현장 정보' : 'AWS D1.1 근거'}</span>
        <span class="ref mono">${f.pop.ref}</span>
      </div>
      <h4>${f.pop.title}</h4>
      <p>${f.pop.body}</p>
      ${f.pop.quote ? `<div class="quote">${f.pop.quote}</div>` : ''}
      ${f.pop.detail ? `<div class="detail">${f.pop.detail}</div>` : ''}
      ${canFill ? `<button class="fill-btn" type="button" id="popFill">이 값 넣기 — ${esc(f.pop.fill)}</button>` : ''}`;
    pop.hidden = false;

    if(window.innerWidth < 780){
      pop.classList.add('bottom-sheet');
      pop.style.left = pop.style.top = pop.style.width = '';
    } else {
      pop.classList.remove('bottom-sheet');
      const r = el.getBoundingClientRect();
      const w = Math.min(370, window.innerWidth - 28);
      const left = Math.min(Math.max(12, r.left + r.width * 0.3), window.innerWidth - w - 12);
      pop.style.width = w + 'px';
      pop.style.left = left + 'px';
      pop.style.top = '0px';
      const ph = pop.offsetHeight;
      let top = r.bottom + 10;
      if(top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 10);
      pop.style.top = top + 'px';
    }
    requestAnimationFrame(() => pop.classList.add('on'));

    const fillBtn = $('#popFill');
    if(fillBtn) fillBtn.addEventListener('click', () => {
      const input = $(`input[data-field="${f.id}"]`);
      if(input){
        input.value = f.pop.fill;
        state.answers[f.id] = f.pop.fill;
        input.closest('.field').classList.remove('missing','bad');
        updateFillCount();
        input.focus();
      }
    });
  }

  pop.addEventListener('mouseenter', () => clearTimeout(popTimer));
  pop.addEventListener('mouseleave', scheduleClose);
  document.addEventListener('click', e => {
    if(pop.hidden) return;
    if(e.target.closest('#pop') || e.target.closest('.field')) return;
    closePop();
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closePop(); });
  window.addEventListener('scroll', () => {
    if(!pop.hidden && !pop.classList.contains('bottom-sheet')) closePop();
  }, {passive:true});

  /* ── 작성 카운트 · 트레이 ──────────────────────────────── */
  function isFilled(f){
    const v = state.answers[f.id];
    return v !== undefined && String(v).trim() !== '';
  }
  function updateFillCount(){
    const n = FIELDS.filter(isFilled).length;
    const c = $('#fillCount'); if(c) c.textContent = n;
    const bar = $('#meterBar'); if(bar) bar.style.width = (n / FIELDS.length * 100) + '%';
    TRAY.forEach(t => {
      const el = $(`[data-tray="${t.fid}"]`);
      if(el){
        const on = isFilled(FIELDS.find(f => f.id === t.fid));
        el.classList.toggle('done', on);
        el.querySelector('i').textContent = on ? '✓' : '?';
      }
    });
  }

  /* ── 채점 ──────────────────────────────────────────────── */
  const norm = v => String(v == null ? '' : v).toLowerCase()
    .replace(/\s+/g, '').replace(/[()]/g, '').replace(/[·,.]/g, '').replace(/-/g, '');

  function checkField(f, val){
    if(val === undefined || String(val).trim() === '') return false;
    if(f.ui === 'chips') return val === f.answer;
    if(f.ui === 'number'){
      const n = parseFloat(String(val).replace(',', '.'));
      if(isNaN(n)) return false;
      if(f.answer && typeof f.answer === 'object') return n >= f.answer.min && n <= f.answer.max;
      return Math.abs(n - Number(f.answer)) < 1e-6;
    }
    const nv = norm(val);
    return !!nv && (f.accept || []).some(a => norm(a) === nv);
  }

  function onSubmit(){
    const errors = [];
    let score = 0, missing = 0;

    FIELDS.forEach(f => {
      const el = $(`.field[data-fid="${f.id}"]`);
      if(!isFilled(f)){
        missing++;
        if(el) el.classList.add('missing');
        if(f.crit) errors.push({ f, empty:true });
        return;
      }
      if(checkField(f, state.answers[f.id])) score += f.weight;
      else { if(el) el.classList.add('bad'); errors.push({ f, val: state.answers[f.id] }); }
    });

    if(missing > 0){
      const first = $('.field.missing');
      if(first){
        first.scrollIntoView({behavior:'smooth', block:'center'});
        openPop(first, FIELDS.find(x => x.id === first.dataset.fid), true);
      }
      toast(`빈 칸이 ${missing}개 있습니다. 빈 칸이 있는 WPS는 발행할 수 없습니다.`);
      return;
    }

    const critical = errors.filter(e => e.f.crit);
    const pass = critical.length === 0 && score >= PASS_RULE.minScore;
    show('result', { result:{ pass, score, errors } });
  }

  let toastTimer = null;
  function toast(msg){
    let el = $('#flashBar');
    if(!el){
      el = document.createElement('div');
      el.id = 'flashBar';
      el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#1b1f25;border:1px solid rgba(255,154,60,.5);color:#ffd8b3;padding:11px 18px;border-radius:999px;font-size:13px;z-index:90;box-shadow:0 20px 40px -20px #000;max-width:90vw;text-align:center';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.transition = 'none';
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.transition = 'opacity .5s'; el.style.opacity = '0'; }, 2800);
  }

  /* ======================================================================
     장면 4 — 결과
     ====================================================================== */
  function renderResult(res){
    if(!res) return show('landing');
    const root = sceneEl('result');
    const { pass, score, errors } = res;
    const crit = errors.filter(e => e.f.crit);
    const soft = errors.filter(e => !e.f.crit);
    const firstCrit = crit[0];
    const ft = firstCrit ? (FRACTURE_TYPES[firstCrit.f.id] || FRACTURE_TYPES.default) : FRACTURE_TYPES.default;

    const errCard = e => `<div class="err ${e.f.crit ? '' : 'warn'}">
      <div class="eh"><span class="tag">${e.f.crit ? '치명' : '보완'}</span>${e.f.label}${e.empty ? ' — 미기재' : ''}</div>
      ${e.empty ? '' : `<div class="eb">내 답 · <b>${esc(e.val)}</b></div>`}
      <div class="eb">${e.f.fb}</div>
    </div>`;
    const errHTML = errors.length ? `<div class="err-list">${errors.map(errCard).join('')}</div>` : '';

    if(pass){
      root.innerHTML = `<div class="res-wrap"><div class="res-grid">
        <div class="res-visual" id="resVisual">${beamSVG('pass')}</div>
        <div class="res-copy">
          <div class="res-badge ok">● 검사 통과</div>
          <div class="res-score"><span class="n">${score}</span><span class="d">/ 100</span></div>
          <h2 class="res-title">이 한 장으로 현장이 움직였습니다</h2>
          <p class="res-sub">치명 오류 0건${soft.length ? ` · 보완 권고 ${soft.length}건` : ''}. 이프로의 절차서로 용접이 진행됐고, 다음 날 전화가 다시 옵니다.</p>
          <div class="thanks-call">
            <div class="ct"><div class="av">박</div>
              <div class="who"><b>${SCENARIO.meta.caller}</b><span>${SCENARIO.meta.callerRole} · 다음 날 16:20</span></div></div>
            <div id="thanksLines"></div>
          </div>
          ${soft.length ? `<details class="soft-box"><summary>보완 권고 ${soft.length}건 보기</summary><div style="margin-top:10px">${errHTML}</div></details>` : ''}
          <div class="res-actions">
            <button class="btn" type="button" id="btnAgain">내 WPS 고쳐보기</button>
            <button class="btn primary" type="button" id="btnRestart2">처음부터</button>
          </div>
        </div></div></div>`;

      const box = $('#thanksLines', root);
      SCENARIO.successCall.forEach((l, i) => later(() => {
        const p = document.createElement('div');
        p.className = 'say' + (l.strong ? ' strong' : '');
        p.style.cssText = 'margin:0 0 8px;opacity:0;transition:opacity .6s';
        p.innerHTML = `<b>${l.who}</b> ${l.t}`;
        box.appendChild(p);
        requestAnimationFrame(() => p.style.opacity = '1');
      }, 1100 + i * 1700));
    } else {
      root.innerHTML = `<div class="res-wrap"><div class="res-grid">
        <div class="res-visual" id="resVisual">${beamSVG('fail', ft.id)}</div>
        <div class="res-copy">
          <div class="res-badge bad">● 부적합 — ${ft.label}</div>
          <div class="res-score"><span class="n">${score}</span><span class="d">/ 100</span></div>
          <h2 class="res-title">${ft.label}${ft.where !== '—' ? ` — ${ft.where}에서 시작` : ''}</h2>
          <p class="res-sub">${ft.desc}</p>
          <div class="thanks-call fail">
            <div class="ct"><div class="av">박</div>
              <div class="who"><b>${SCENARIO.meta.caller}</b><span>${SCENARIO.meta.callerRole} · 긴급</span></div></div>
            <div class="say" id="failCall"></div>
          </div>
          <div id="errZone" style="opacity:0;transition:opacity .6s">
            <div class="err-h">오류 항목 · 근거 (${crit.length}건 치명 / ${soft.length}건 보완)</div>
            ${errHTML}
          </div>
          <div class="res-actions">
            <button class="btn primary" type="button" id="btnAgain">다시 작성</button>
            <button class="btn ghost" type="button" id="btnRestart2">처음부터</button>
          </div>
        </div></div></div>`;
      later(() => {
        const f = $('#failCall', root);
        if(f) f.innerHTML = `<b>${SCENARIO.failCall.who}</b> ${SCENARIO.failCall.t}`;
      }, 600);
    }

    const again = $('#btnAgain', root);
    if(again) again.addEventListener('click', () => {
      errors.forEach(e => { delete state.answers[e.f.id]; });
      show('wps');
      toast('틀린 칸만 비웠습니다. 맞힌 칸은 그대로 남아 있습니다.');
    });
    const rs = $('#btnRestart2', root);
    if(rs) rs.addEventListener('click', restart);

    if(!pass) playFracture(ft);
  }

  function playFracture(ft){
    const flash = $('#flash');
    const impact = $('#impactText');
    const visual = $('#resVisual');
    if(!visual) return;

    later(() => visual.classList.add('broken'), 900);
    later(() => {
      impact.textContent = (ft.id === 'reject' ? '반려' : '파단');
      flash.classList.add('on');
      impact.classList.add('on');
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 420);
    }, 2150);
    later(() => {
      const z = $('#errZone');
      if(z) z.style.opacity = '1';
    }, 3000);
  }

  /* ======================================================================
     철골 단면 SVG — intact / pass / fail(파단 유형별)
     ====================================================================== */
  function beamSVG(mode, fracId){
    const isFail = mode === 'fail';
    const crack = {
      hydrogen:'M282 156 L272 144 L264 132 L254 120',
      throat:  'M284 166 L302 176 L320 186 L338 176',
      fusion:  'M282 178 L318 178 L356 178',
      porosity:'M290 172 L318 172 L346 172',
      reject:  ''
    }[fracId || 'hydrogen'];

    const porosityDots = (isFail && fracId === 'porosity')
      ? Array.from({length:12}, (_, i) => {
          const x = 292 + (i % 6) * 12, y = 168 + Math.floor(i / 6) * 12;
          return `<circle class="pore" cx="${x}" cy="${y}" r="${2.2 + (i % 3)}" fill="#0a0d10" stroke="#ff6b5b" stroke-width="1" style="animation-delay:${i * .08}s"/>`;
        }).join('')
      : '';

    return `<svg viewBox="186 12 434 372" width="100%" role="img"
      aria-label="보 웨브와 브래킷 필렛 접합 단면" class="beam-svg ${isFail ? 'fail' : 'ok'}">
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#2b333c" stroke-width="1.4"/>
        </pattern>
        <linearGradient id="steelG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#3b444e"/><stop offset=".55" stop-color="#232a32"/><stop offset="1" stop-color="#131920"/>
        </linearGradient>
        <linearGradient id="weldG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#a3aebb"/><stop offset=".5" stop-color="#6f7c8a"/><stop offset="1" stop-color="#414a54"/>
        </linearGradient>
        <linearGradient id="weldPassG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#c6f7da"/><stop offset="1" stop-color="#2f8a5f"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <g opacity=".2">
        ${Array.from({length:17},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="400" stroke="#1b2128" stroke-width="1"/>`).join('')}
        ${Array.from({length:10},(_,i)=>`<line x1="0" y1="${i*40}" x2="680" y2="${i*40}" stroke="#1b2128" stroke-width="1"/>`).join('')}
      </g>

      ${isFail ? `<g class="load-arrow">
        <line x1="600" y1="56" x2="600" y2="128" stroke="#ff8a7a" stroke-width="2" stroke-dasharray="5 4"/>
        <path d="M600 138 L593 124 L607 124 Z" fill="#ff8a7a"/>
        <text x="606" y="70" fill="#ff8a7a" font-size="10" font-family="monospace">P ↓</text>
      </g>` : ''}

      <g class="web-part">
        <!-- 상·하 플랜지 + 웨브 (H형강 단면) -->
        <rect x="222" y="30" width="88" height="15" fill="url(#steelG)"/>
        <rect x="222" y="30" width="88" height="15" fill="url(#hatch)" opacity=".5"/>
        <rect x="222" y="30" width="88" height="15" fill="none" stroke="#4d5763" stroke-width="1.1"/>
        <rect x="222" y="355" width="88" height="15" fill="url(#steelG)"/>
        <rect x="222" y="355" width="88" height="15" fill="url(#hatch)" opacity=".5"/>
        <rect x="222" y="355" width="88" height="15" fill="none" stroke="#4d5763" stroke-width="1.1"/>
        <rect x="250" y="45" width="30" height="310" fill="url(#steelG)"/>
        <rect x="250" y="45" width="30" height="310" fill="url(#hatch)" opacity=".55"/>
        <rect x="250" y="45" width="30" height="310" fill="none" stroke="#4d5763" stroke-width="1.2"/>
        <text x="232" y="212" fill="#6f7a87" font-size="9.5" font-family="monospace" transform="rotate(-90 232 212)">WEB 12t</text>
        <text x="196" y="26" fill="#59636f" font-size="9" font-family="monospace">H-300×300</text>
      </g>

      <g class="bracket-part">
        <rect x="280" y="178" width="230" height="22" fill="url(#steelG)"/>
        <rect x="280" y="178" width="230" height="22" fill="url(#hatch)" opacity=".5"/>
        <rect x="280" y="178" width="230" height="22" fill="none" stroke="#4d5763" stroke-width="1.2"/>
        <text x="512" y="172" fill="#6f7a87" font-size="10" font-family="monospace">BRACKET 12t</text>
        <circle cx="470" cy="189" r="4.5" fill="#0b0f13" stroke="#4d5763"/>
      </g>

      <g class="weld-group">
        <path d="M280 178 L280 156 L306 178 Z" fill="url(#weld${mode === 'pass' ? 'Pass' : ''}G)" stroke="#8b97a5" stroke-width=".8"/>
        <path d="M280 200 L280 222 L306 200 Z" fill="url(#weld${mode === 'pass' ? 'Pass' : ''}G)" stroke="#8b97a5" stroke-width=".8"/>
        ${mode === 'pass' ? `
          <path d="M280 178 L280 156 L306 178" fill="none" stroke="#7cf0b0" stroke-width="2.2" filter="url(#glow)" opacity=".9"/>
          <path d="M280 200 L280 222 L306 200" fill="none" stroke="#7cf0b0" stroke-width="2.2" filter="url(#glow)" opacity=".9"/>` : ''}
      </g>

      ${isFail && crack ? `<path class="crack-line" d="${crack}" fill="none" stroke="#ff5d4d" stroke-width="2.6" filter="url(#glow)"/>` : ''}
      ${porosityDots}

      <g class="sparks">
        ${isFail ? [ [-26,-34], [34,-24], [-14,38], [26,30], [0,-44] ].map(([dx,dy],i) =>
          `<line class="spark" x1="300" y1="182" x2="300" y2="182" stroke="${i%2?'#ff9a3c':'#ffcf9a'}" stroke-width="2" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${i*.07}s"/>`).join('') : ''}
      </g>

      <g stroke="#3d4652" stroke-width="1" fill="none">
        <line x1="306" y1="150" x2="306" y2="228" stroke="#ff9a3c" stroke-width="1" opacity=".5"/>
      </g>
      <text x="312" y="246" fill="#ff9a3c" font-size="10" font-family="monospace">3F · FILLET 6</text>
      <text x="238" y="392" fill="#6f7a87" font-size="10" font-family="monospace">SM275 · 12t</text>

      ${mode === 'pass' ? `
        <g opacity=".95"><rect x="470" y="44" width="152" height="36" rx="4" fill="none" stroke="#4bd29a" stroke-width="1.4" transform="rotate(-6 546 62)"/>
        <text x="494" y="69" fill="#8ff0c4" font-size="16" font-family="monospace" font-weight="700" transform="rotate(-6 546 62)">PASS</text></g>` : ''}

      ${isFail && fracId === 'reject' ? `
        <g opacity=".95" class="stamp-reject"><rect x="420" y="40" width="190" height="44" rx="4" fill="none" stroke="#ff5d4d" stroke-width="2" transform="rotate(-7 515 62)"/>
        <text x="436" y="70" fill="#ff7b6b" font-size="17" font-family="monospace" font-weight="700" transform="rotate(-7 515 62)">REJECTED</text></g>` : ''}
    </svg>`;
  }

  function restart(){
    clearTimers();
    state.answers = {};
    closePop();
    show('landing');
    window.scrollTo({top:0});
  }

  /* ── 시작 ──────────────────────────────────────────────── */
  $('#btnStart').addEventListener('click', () => show('call'));
  $('#btnRestart').addEventListener('click', () => {
    if(state.scene === 'landing') return;
    if(confirm('처음부터 다시 시작할까요? 작성한 내용은 사라집니다.')) restart();
  });
  document.addEventListener('keydown', e => {
    if(state.scene === 'landing' && (e.key === 'Enter' || e.key === ' ')){
      e.preventDefault(); show('call');
    }
  });
})();
