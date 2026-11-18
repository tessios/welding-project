/* =========================================================================
   WPS작성 실습 — 화면 전환 · 음성 연출 · 공백 WPS · 채점 · 붕괴 연출
   의존: data.js
   ========================================================================= */
(function(){
  'use strict';

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const state = { scene:'landing', answers:{}, seq:0, timers:[] };
  const SCENES = ['landing','call','brief','wps','result'];
  const sceneEl = id => document.getElementById('scene-' + id);
  const TRAY = [
    { fid:'filler',   label:'필러' },
    { fid:'preheat',  label:'예열' },
    { fid:'prequal',  label:'인정 방식' },
    { fid:'position', label:'자세' }
  ];

  /* ======================================================================
     음성 — 아나운서 내레이션 · 현장 통화 · 효과음
     ====================================================================== */
  const AU = {
    muted: false,
    live: new Set(),
    /* 배경음악 */
    bgm: null,
    bgmOn: true,
    bgmBase: 0.15,
    bgmDuck: 0.04,
    duckCount: 0,
    bgmTimer: null,
    init(){
      try {
        this.muted = localStorage.getItem('wps.muted') === '1';
        this.bgmOn = localStorage.getItem('wps.bgm') !== '0';
      } catch(e){ this.muted = false; this.bgmOn = true; }
      this.syncButton();
      this.syncBgm();
    },
    syncBgm(){
      const b = $('#btnBgm');
      if(!b) return;
      b.setAttribute('aria-pressed', this.bgmOn ? 'true' : 'false');
      b.classList.toggle('off', !this.bgmOn);
      b.classList.toggle('playing', this.bgmOn && !this.muted);
      b.title = this.bgmOn ? '배경음악 끄기' : '배경음악 켜기';
    },
    setBgm(on){
      this.bgmOn = !!on;
      try { localStorage.setItem('wps.bgm', this.bgmOn ? '1' : '0'); } catch(e){}
      if(!this.bgmOn){ if(this.bgm){ try{ this.bgm.pause(); }catch(e){} } }
      else this.startBgm();
      this.syncBgm();
    },
    startBgm(){
      if(!this.bgmOn || this.muted) return;
      if(!this.bgm){
        try {
          this.bgm = new Audio('audio/bgm_terran.mp3');
          this.bgm.loop = true;
          this.bgm.preload = 'auto';
          this.bgm.volume = 0;
        } catch(e){ this.bgm = null; return; }
      }
      const p = this.bgm.play();
      if(p && p.catch) p.catch(() => {});
      this.setBgmVol(this.duckCount ? this.bgmDuck : this.bgmBase);
    },
    setBgmVol(target){
      if(!this.bgm) return;
      this.bgmTarget = target;
      if(this.bgmTimer) return;
      this.bgmTimer = setInterval(() => {
        if(!this.bgm){ clearInterval(this.bgmTimer); this.bgmTimer = null; return; }
        const d = (this.bgmTarget || 0) - this.bgm.volume;
        if(Math.abs(d) < 0.004){ this.bgm.volume = this.bgmTarget || 0; clearInterval(this.bgmTimer); this.bgmTimer = null; }
        else this.bgm.volume = Math.max(0, Math.min(1, this.bgm.volume + d * 0.25));
      }, 45);
    },
    duck(){ this.duckCount++; this.setBgmVol(this.bgmDuck); },
    unduck(){ this.duckCount = Math.max(0, this.duckCount - 1); if(!this.duckCount) this.setBgmVol(this.bgmBase); },
    syncButton(){
      const b = $('#btnMute');
      if(!b) return;
      b.setAttribute('aria-pressed', this.muted ? 'true' : 'false');
      b.classList.toggle('off', this.muted);
      b.innerHTML = this.muted
        ? '<span class="ico" aria-hidden="true">🔇</span><span class="lbl">소리 꺼짐</span>'
        : '<span class="ico" aria-hidden="true">🔊</span><span class="lbl">소리 켜짐</span>';
      b.title = this.muted ? '소리 켜기' : '소리 끄기';
    },
    setMuted(v){
      this.muted = !!v;
      try { localStorage.setItem('wps.muted', this.muted ? '1' : '0'); } catch(e){}
      if(this.muted){
        this.stopAll();
        if(this.bgm){ try{ this.bgm.pause(); }catch(e){} }
      } else if(this.bgmOn){
        this.startBgm();
      }
      this.syncButton(); this.syncBgm();
    },
    stopAll(){
      this.live.forEach(a => { try { a.pause(); } catch(e){} });
      this.live.clear();
      if(this.current){ try{ this.current.pause(); }catch(e){} this.current = null; }
      if(this.currentDone){ const d=this.currentDone; this.currentDone=null; d(false); }
      this.duckCount = 0;
      this.setBgmVol(this.bgmBase);
    },
    /* 순차 재생 — 끝나면 resolve. 음소거/실패면 즉시 false */
    clip(src){
      return new Promise(resolve => {
        if(!src || this.muted) return resolve(false);
        this.duck();
        let a;
        try { a = new Audio('audio/' + src + '.mp3'); } catch(e){ return resolve(false); }
        let done = false;
        const fin = ok => {
          if(done) return; done = true;
          this.live.delete(a);
          if(this.current === a){ this.current = null; this.currentDone = null; }
          this.unduck();
          resolve(ok);
        };
        a.preload = 'auto';
        a.addEventListener('ended', () => fin(true));
        a.addEventListener('error', () => fin(false));
        this.live.add(a);
        this.current = a;
        this.currentDone = fin;
        const p = a.play();
        if(p && p.catch) p.catch(() => setTimeout(() => fin(false), 260));
        setTimeout(() => { if(!done && a.duration && isFinite(a.duration)) {} }, 0);
      });
    },
    /* 동시 재생 (효과음) */
    fx(src, vol){
      if(!src || this.muted) return;
      try {
        const a = new Audio('audio/' + src + '.mp3');
        a.volume = vol == null ? 1 : vol;
        this.live.add(a);
        a.addEventListener('ended', () => this.live.delete(a));
        a.addEventListener('error', () => this.live.delete(a));
        const p = a.play(); if(p && p.catch) p.catch(() => {});
      } catch(e){}
    }
  };

  function later(fn, ms){ const t = setTimeout(fn, ms); state.timers.push(t); return t; }
  function clearTimers(){ state.timers.forEach(clearTimeout); state.timers = []; }
  const alive = seq => seq === state.seq;

  /* ======================================================================
     화면 전환
     ====================================================================== */
  function show(id, opts={}){
    clearTimers();
    closePop();
    state.seq++;
    AU.stopAll();
    hideNarr();
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

  /* ── 아나운서 자막 바 ────────────────────────────────────── */
  let narrTimer = null;
  function showNarr(label, text){
    const bar = $('#narrBar');
    if(!bar) return;
    bar.hidden = false;
    bar.innerHTML = `<span class="nb-tag">${esc(label)}</span><span class="nb-text">${esc(text)}</span><span class="nb-eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
    requestAnimationFrame(() => bar.classList.add('on'));
    clearTimeout(narrTimer);
  }
  function hideNarr(){
    const bar = $('#narrBar');
    if(!bar) return;
    bar.classList.remove('on');
    narrTimer = setTimeout(() => { bar.hidden = true; }, 400);
  }
  async function narrate(key, seq){
    const n = SCENARIO.narr[key];
    if(!n) return;
    showNarr(n.label, n.text);
    await AU.clip(key);
    if(alive(seq)) hideNarr();
  }

  /* ======================================================================
     장면 1 — 전화
     ====================================================================== */
  function renderCall(skip){
    const s = SCENARIO.meta;
    const root = sceneEl('call');
    const seq = state.seq;
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
            <button class="btn primary" type="button" id="btnToBrief">현장 상황 보기 <span class="arrow" aria-hidden="true">→</span></button>
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
    dialog.innerHTML = `<div class="ring-hint" id="ringHint"><span class="rh-dot"></span><span class="rh-dot"></span><span class="rh-dot"></span><span>전화가 오고 있습니다</span></div>`;

    const addLine = item => {
      const el = document.createElement('div');
      el.className = 'line' + (item.me ? ' me' : '') + (item.strong ? ' strong' : '');
      el.innerHTML = `<div class="who">${item.who}</div><div class="say">${item.t}</div>`;
      dialog.appendChild(el);
      dialog.scrollTop = dialog.scrollHeight;
      return el;
    };

    const showMonologue = () => {
      mono.hidden = false;
      mono.innerHTML = SCENARIO.monologue.map((m, i) =>
        `<div class="m-line" style="animation-delay:${i * .18}s">${m}</div>`
      ).join('') + `<div class="m-sign">${SCENARIO.meta.me} — 품질관리자</div>`;
    };

    const finish = () => {
      stateText.textContent = '통화 종료';
      const bars = $('#callState .bar', root); if(bars) bars.remove();
      actions.innerHTML = '';
      foot.classList.add('on');
    };

    async function run(){
      /* 벨은 장면이 열리면 바로 울리고, 아나운서가 상황을 설명한다 */
      AU.fx('sfx_ring', .55);
      await narrate('n_call', seq);
      if(!alive(seq)) return;

      /* 벨 → 수화 */
      await wait(700);
      if(!alive(seq)) return;

      phone.classList.remove('ringing');
      const rh = $('#ringHint', root); if(rh) rh.remove();
      stateText.textContent = '통화 중';
      const bars = document.createElement('span');
      bars.className = 'bar';
      bars.innerHTML = '<i></i><i></i><i></i><i></i>';
      $('#callState', root).appendChild(bars);

      /* 통화 음성 없이 자막으로만 진행 — 문장 길이에 맞춰 말풍선이 차례로 쌓인다 */
      for(const item of SCENARIO.call){
        if(!alive(seq)) return;
        addLine(item);
        const plain = item.t.replace(/<[^>]+>/g, '');
        const minMs = Math.max(700, Math.min(3200, 420 + plain.length * 48));
        await wait(minMs);
      }

      AU.fx('sfx_hangup', .7);
      finish();
      await wait(350);
      if(!alive(seq)) return;
      showMonologue();
      showNarr('핵심 정리', SCENARIO.narr.n_summary.text);
      await AU.clip('n_summary');
      if(alive(seq)) hideNarr();
    }

    function skipAll(){
      state.seq++;                 // 진행 중 시퀀스 무효화
      AU.stopAll();
      const mySeq = state.seq;
      clearTimers();
      dialog.innerHTML = '';
      SCENARIO.call.forEach(addLine);
      phone.classList.remove('ringing');
      stateText.textContent = '통화 종료';
      const bars = $('#callState .bar', root); if(bars) bars.remove();
      finish();
      showMonologue();
      hideNarr();
      setTimeout(() => { if(alive(mySeq)) foot.classList.add('on'); }, 300);
    }

    if(skip) skipAll(); else run();

    root.addEventListener('click', e => {
      if(e.target.closest('#btnSkipCall')) skipAll();
      if(e.target.closest('#btnToBrief')) show('brief');
    });
  }

  /* ======================================================================
     장면 2 — 브리핑 (현장 상황)
     ====================================================================== */
  function renderBrief(){
    const b = BRIEF;
    const root = sceneEl('brief');
    const seq = state.seq;
    root.innerHTML = `
      <div class="scene-inner">
        <div class="scene-head">
          <div>
            <div class="scene-kicker">장면 2 · 브리핑</div>
            <h2 class="scene-title">내일 용접 할 개소</h2>
            <p class="scene-sub">도면 ${b.code} / ${b.detail} — 보 웨브에 브래킷을 세워 붙이는 수직 필렛입니다. 절차서에 적을 값은 여기와 <b>현장 상황</b>에서 나옵니다.</p>
          </div>
        </div>

        <div class="brief-grid">
          <div class="visual-card" id="briefVisual">
            <span class="tag">단면 · SECTION B-B / ${b.code}–${b.detail}</span>
            <span class="weld-legend"><i></i>용접 개소</span>
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
                <span class="tiny">현장 상황 · ${b.drawer.length}</span>
                <span class="drawer-hint">눌러서 확인 — 절차서의 빈칸이 여기 있습니다</span>
              </div>
              ${b.drawer.map(d => `
                <details class="drawer">
                  <summary><span class="ic">${d.icon}</span><span class="tt">${d.title}</span><span class="sm">${d.short}</span></summary>
                  <div class="db">${d.body}</div>
                </details>`).join('')}
            </div>

            <div class="note-card">${b.env} · <b>내일 07:00 −3 °C 예보</b><br>
              추운 아침과 바람은 절차서의 예열·가스 차폐 판단에 그대로 영향을 줍니다.</div>
          </div>
        </div>

        <div class="scene-foot on">
          <button class="btn primary" type="button" id="btnToWps">WPS작성 시작 <span class="arrow" aria-hidden="true">→</span></button>
          <button class="btn ghost" type="button" id="btnBackCall">이전</button>
        </div>
      </div>`;
    $('#btnToWps', root).addEventListener('click', () => show('wps'));
    $('#btnBackCall', root).addEventListener('click', () => show('call', {skipIntro:true}));
    narrate('n_brief', seq);
  }

  /* ======================================================================
     장면 3 — 공백 WPS
     ====================================================================== */
  function renderWps(){
    const root = sceneEl('wps');
    const seq = state.seq;
    const groups = {};
    FIELDS.forEach(f => (groups[f.sec] = groups[f.sec] || []).push(f));

    const secHTML = Object.keys(groups).sort().map(k => {
      const s = SECTIONS[k];
      const cls = groups[k].length === 1 ? ' one' : (groups[k].length === 3 ? ' three' : '');
      return `<div class="wps-section">
        <div class="sec-head"><span class="n">${s.n}</span><span>${s.ko}</span><span class="en">${s.en}</span></div>
        <div class="sec-grid${cls}">${groups[k].map(fieldHTML).join('')}</div>
      </div>`;
    }).join('');

    root.innerHTML = `
      <div class="scene-inner">
        <div class="scene-head">
          <div>
            <div class="scene-kicker">장면 3 · 작성</div>
            <h2 class="scene-title">빈 WPS 한 장</h2>
            <p class="scene-sub">칸을 누르면 근거가 열리고, 근거를 두 번 누르면 닫힙니다. 보기는 고르고, 수치는 직접 계산해 적으세요. <b class="hl-blue">파란 점</b>은 현장 정보, <b class="hl-amber">주황 점</b>은 AWS D1.1 2025년판 원문입니다. ⭐는 감리가 먼저 보는 칸.</p>
          </div>
          <div class="tray" id="tray" aria-label="놓친 정보">
            <span class="tray-k">놓친 정보</span>
            ${TRAY.map(t => `<span class="tray-i" data-tray="${t.fid}"><i>?</i>${t.label}</span>`).join('')}
          </div>
        </div>

        <div class="legend">
          <span><i class="catdot e"></i><b>필수</b> Essential — 바꾸면 새 WPS·재인정 <em>Table 5.5</em></span>
          <span><i class="catdot s"></i><b>추가필수</b> Supplementary — 충격시험(CVN) 시 <em>Table 6.8</em></span>
          <span><i class="catdot n"></i><b>비필수</b> Nonessential — 허용폭 안에서 변경 <em>Table 5.5</em></span>
        </div>

        <div class="wps-shell">
          <div class="wps-doc" id="wpsDoc">
            <div class="doc-head">
              <div class="doc-title">
                <span class="en">Welding Procedure Specification</span>
                <span class="ko">용접절차 지시서</span>
                <span class="sub">AWS D1.1/D1.1M:2025 · Carbon Steel · Fillet</span>
              </div>
              <div class="doc-no">
                WPS No. <b>WPS-A36-F01</b> · Rev. <b>0</b><br>
                Supporting PQR(s) <b>None (Prequalified)</b> · CVN <b>No</b><br>
                기준 규격 <b>AWS D1.1/D1.1M:2025</b> · Clause 5 사전인정 · Page 1 / 1<br>
                작성 <b>${SCENARIO.meta.me}</b>
              </div>
            </div>
            ${secHTML}
            <div class="doc-foot">
              <div>교육용으로 재구성한 서식입니다. 조항·표 번호와 영문 인용은 AWS D1.1/D1.1M:2025 원문을 따랐고, 수치는 교육용 대표값입니다.<br>실제 제작에는 계약 지정 판본과 발주처 시방서를 적용하세요.</div>
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
    measureBar();
    narrate('n_wps', seq);
  }

  function fieldHTML(f){
    const filled = state.answers[f.id];
    let ctl = '';
    if(f.ui === 'chips'){
      ctl = `<div class="chip-row" data-field="${f.id}">` + f.options.map(o =>
        `<button type="button" class="chip${filled === o ? ' on' : ''}" data-val="${esc(o)}">${esc(o)}</button>`
      ).join('') + `</div>`;
    } else if(f.ui === 'select'){
      ctl = `<select data-field="${f.id}" aria-label="${esc(f.label)} 보기 선택">
        <option value="">— 보기에서 선택 —</option>` +
        f.options.map(o => `<option value="${esc(o)}"${filled === o ? ' selected' : ''}>${esc(o)}</option>`).join('') +
        `</select>`;
    } else {
      ctl = `<div class="${f.unit ? 'has-unit' : ''}">
        <input type="${f.ui === 'number' ? 'number' : 'text'}" ${f.ui === 'number' ? 'step="0.01"' : ''} ${f.decimal || f.ui === 'number' ? 'inputmode="decimal"' : ''}
          data-field="${f.id}" placeholder="${esc(f.ph || '')}"${filled ? ` value="${esc(filled)}"` : ''}
          autocomplete="off" spellcheck="false">
        ${f.unit ? `<span class="unit">${f.unit}</span>` : ''}
      </div>`;
    }
    const c = CAT[f.cat] || CAT.e;

    return `<div class="field k-${f.kind}" data-fid="${f.id}" data-cat="${f.cat}">
      <div class="lab">
        <b>${f.key ? '<span class="star">★</span> ' : ''}${f.label}<button class="qm" type="button" data-hint="${f.id}" aria-label="${esc(f.label)} 근거 보기">?</button></b>
        <em>${f.en}</em>
        <span class="cat cat-${f.cat}" title="${esc(c.tip)}">${c.label}</span>
      </div>
      <div class="ctl">${ctl}</div>
      <span class="kind-dot" aria-hidden="true"></span>
    </div>`;
  }

  function initFields(root){
    const acceptValue = t => {
      state.answers[t.dataset.field] = t.value;
      t.closest('.field').classList.remove('missing','bad');
      closePop();
      updateFillCount();
    };
    root.addEventListener('input', e => {
      const t = e.target;
      if(t.matches('input[data-field], select[data-field]')) acceptValue(t);
    });
    root.addEventListener('change', e => {
      const t = e.target;
      if(t.matches('select[data-field]')) acceptValue(t);
    });

    root.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if(chip){
        const row = chip.closest('.chip-row');
        $$('.chip', row).forEach(c => c.classList.remove('on'));
        chip.classList.add('on');
        state.answers[row.dataset.field] = chip.dataset.val;
        chip.closest('.field').classList.remove('missing','bad');
        closePop();
        updateFillCount();
        return;
      }
      const qm = e.target.closest('.qm');
      if(qm){ e.stopPropagation(); return; }
    });

    $$('.field', root).forEach(el => {
      const f = FIELDS.find(x => x.id === el.dataset.fid);
      if(!f) return;
      /* 근거는 호버가 아니라 문항을 눌렀을 때 열린다(입력·선택 조작 방해 금지) */
      /* 문항 카드·라벨을 누르면 근거가 열린다. input·select·칩 조작은 방해하지 않는다. */
      el.addEventListener('click', e => {
        if(e.target.closest('input, select, option, .chip, .qm')) return;
        openPop(el, f, true);
      });
      const qm = $('.qm', el);
      if(qm) qm.addEventListener('click', ev => { ev.stopPropagation(); openPop(el, f, true); });
    });
  }

  const CAN_HOVER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ======================================================================
     팝오버 — 규격서 원문 카드 + 한글 해석 + 현장 의미
     ====================================================================== */
  const pop = $('#pop');
  let popTimer = null, popField = null, popEl = null;

  function scheduleClose(){ clearTimeout(popTimer); popTimer = setTimeout(closePop, 260); }

  function closePop(){
    pop.classList.remove('on');
    pop.hidden = true;
    popField = null; popEl = null;
    $$('.field.act').forEach(e => e.classList.remove('act'));
  }

  function specCard(spec, small){
    const tbl = spec.table ? `<table class="spec-table"><caption>${esc(spec.table.cap)}</caption><tbody>${
      spec.table.rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>` : '';
    return `<div class="spec${small ? ' small' : ''}">
      <div class="spec-head">
        <span class="std">AWS D1.1/D1.1M:2025</span>
        <span class="loc">${esc(spec.ref || '')}</span>
      </div>
      <div class="spec-body">
        ${spec.quote ? `<blockquote>${esc(spec.quote)}</blockquote>` : ''}
        ${tbl}
      </div>
      <div class="spec-foot">원문 발췌 · American Welding Society</div>
    </div>`;
  }

  function closeBtnHTML(){
    return `<button class="pop-x" type="button" aria-label="근거 닫기" title="닫기 (두 번 눌러도 닫힙니다)">×</button>`;
  }

  function openPop(el, f, pinned){
    clearTimeout(popTimer);
    if(popField === f.id && pop.classList.contains('on') && !pinned) return;

    popField = f.id; popEl = el;
    $$('.field.act').forEach(e => e.classList.remove('act'));
    el.classList.add('act');

    const p = f.pop;
    if(p.kind === 'field'){
      pop.innerHTML = `
        <div class="pop-top">
          <span class="src given">현장 정보</span>
          <span class="ref mono">${esc(p.ref || '')}</span>
        </div>
        <h4>${p.title}</h4>
        <p>${p.body}</p>
        ${p.spec ? specCard(p.spec, true) : ''}
        ${p.calc ? calcBox(p.calc) : ''}
        ${closeBtnHTML()}`;
    } else {
      pop.innerHTML = `
        ${specCard(p)}
        <div class="pop-ko">
          <div class="kh">한글 해석</div>
          <p>${p.ko}</p>
          ${p.calc ? calcBox(p.calc) : ''}
          <div class="kh site">현장 의미</div>
          <p>${p.site}</p>
        </div>
        ${closeBtnHTML()}`;
    }
    bindPopClose();
    pop.hidden = false;
    pop.classList.remove('on');
    requestAnimationFrame(() => {
      if(popField !== f.id) return;      // 그 사이 닫혔으면 되살리지 않는다
      placePop(el);
      pop.classList.add('on');
    });
  }

  function placePop(el){
    const vw = window.innerWidth, vh = window.innerHeight;
    const bar = $('.submit-bar');
    const barRect = bar ? bar.getBoundingClientRect() : null;
    const barH = barRect ? Math.min(barRect.height, 180) : 0;
    /* 제출 바는 sticky라서 화면 맨 아래보다 위에 떠 있을 수 있다 — 실제 상단을 경계로 쓴다 */
    const barTop = barRect && barRect.height > 0 ? Math.min(barRect.top, vh) : vh;
    const limitBottom = barTop - 10;          // 팝오버 하단이 넘지 않아야 하는 선
    const r = el.getBoundingClientRect();
    const mobile = vw < 780;

    pop.style.maxHeight = '';
    if(mobile){
      /* 모바일: 화면을 덮지 않는 컴팩트 시트 — 높이를 줄이고 내부 스크롤 */
      pop.classList.add('sheet');
      pop.style.left = pop.style.top = pop.style.width = '';
      pop.style.setProperty('--sheet-bottom', Math.max(0, vh - limitBottom) + 'px');
      const cap = Math.max(150, Math.min(vh * 0.42, limitBottom - 130));
      pop.style.maxHeight = cap + 'px';
      return;
    }
    pop.classList.remove('sheet');
    pop.classList.remove('side-r','side-l');
    pop.style.setProperty('--sheet-bottom', '0px');
    const w = Math.min(430, vw - 24);
    pop.style.width = w + 'px';
    const ph = pop.offsetHeight;
    const maxH = Math.max(200, limitBottom - 72);
    const clampTop = t => Math.min(Math.max(72, t), Math.max(72, limitBottom - Math.min(ph, maxH)));
    const rightRoom = vw - r.right - 16;
    const leftRoom = r.left - 16;
    let left, top;
    if(rightRoom >= w){                       // 칸 오른쪽에 붙인다 — 칸을 가리지 않는다
      left = r.right + 14; top = clampTop(r.top - 18);
      pop.classList.add('side-r');
    } else if(leftRoom >= w){                 // 오른쪽이 좁으면 왼쪽
      left = r.left - w - 14; top = clampTop(r.top - 18);
      pop.classList.add('side-l');
    } else {                                  // 좁은 화면: 아래 → 위
      const below = limitBottom - r.bottom - 14;
      const above = r.top - 78;
      if(ph <= below || below >= above){ top = clampTop(r.bottom + 10); }
      else { top = clampTop(r.top - Math.min(ph, maxH) - 10); }
      left = Math.min(Math.max(12, r.left + r.width * 0.22), vw - w - 12);
      pop.classList.toggle('flip', top < r.top);
    }
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    if(ph > maxH) pop.style.maxHeight = Math.max(180, maxH) + 'px';
  }

  /* 계산 조건 박스 — 정답을 넣어주지 않고 조건·공식만 보여준다 */
  function calcBox(calc){
    return `<div class="calc-box">
      <div class="cb-h">${esc(calc.cap || '계산 조건')}</div>
      <table class="calc-table"><tbody>${
        calc.rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
      ${calc.note ? `<div class="cb-note">${esc(calc.note)}</div>` : ''}
    </div>`;
  }

  /* 근거 닫기 — 더블클릭 · 모바일 더블탭 · × 버튼 */
  let lastTap = 0;
  function bindPopClose(){
    const x = $('.pop-x', pop);
    if(x) x.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); closePop(); });
  }
  function dblClose(e){
    if(pop.hidden) return;
    /* 더블클릭은 텍스트 선택을 남기지 않도록 막는다 */
    const sel = window.getSelection && window.getSelection();
    if(sel && sel.removeAllRanges) sel.removeAllRanges();
    e.preventDefault();
    closePop();
  }
  pop.addEventListener('dblclick', dblClose);
  pop.addEventListener('touchend', e => {
    if(pop.hidden) return;
    const now = Date.now();
    if(now - lastTap < 340){ e.preventDefault(); closePop(); lastTap = 0; }
    else lastTap = now;
  }, {passive:false});

  pop.addEventListener('mouseenter', () => clearTimeout(popTimer));
  pop.addEventListener('mouseleave', () => { if(CAN_HOVER) scheduleClose(); });
  document.addEventListener('click', e => {
    if(pop.hidden) return;
    if(e.target.closest('#pop') || e.target.closest('.field')) return;
    closePop();
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closePop(); });
  /* 스크롤해도 팝오버를 닫지 않고 위치만 따라가게 한다 (포커스 스크롤로 사라지던 문제) */
  let scrollRaf = null;
  window.addEventListener('scroll', () => {
    if(pop.hidden || !popEl || pop.classList.contains('sheet')) return;
    if(scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => { scrollRaf = null; if(popEl && !pop.hidden) placePop(popEl); });
  }, {passive:true});
  window.addEventListener('resize', () => { if(popEl && !pop.hidden) placePop(popEl); });

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

  function measureBar(){
    const bar = $('.submit-bar');
    if(bar) document.documentElement.style.setProperty('--barbar', bar.getBoundingClientRect().height + 'px');
  }

  /* ── 채점 ──────────────────────────────────────────────── */
  const norm = v => String(v == null ? '' : v).toLowerCase()
    .replace(/\s+/g, '').replace(/[()]/g, '').replace(/[·,.]/g, '').replace(/-/g, '');

  function checkField(f, val){
    if(val === undefined || String(val).trim() === '') return false;
    /* 자유 입력(와이어 지름·전류·전압) — 유효한 수치나 범위가 있으면 통과 */
    if(f.lenient){
      const nums = String(val).match(/\d+(?:[.,]\d+)?/g);
      return !!nums && nums.some(n => parseFloat(String(n).replace(',', '.')) > 0);
    }
    if(f.ui === 'chips' || f.ui === 'select') return Array.isArray(f.answer) ? f.answer.includes(val) : val === f.answer;
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
      else {
        if(el){ el.classList.add('bad'); }
        errors.push({ f, val: state.answers[f.id] });
      }
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
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.transition = 'none';
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.transition = 'opacity .5s'; el.style.opacity = '0'; }, 3200);
  }

  /* ======================================================================
     장면 4 — 결과
     ====================================================================== */
  function renderResult(res){
    if(!res) return show('landing');
    const root = sceneEl('result');
    const seq = state.seq;
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
        <div class="res-visual" id="resVisual">${beamSVG('pass', null, '232 104 330 180')}</div>
        <div class="res-copy">
          <div class="res-badge ok">● 검사 통과</div>
          <div class="res-score"><span class="n">${score}</span><span class="d">/ 100</span></div>
          <h2 class="res-title">이 한 장으로 현장이 움직였습니다</h2>
          <p class="res-sub">치명 오류 0건${soft.length ? ` · 보완 권고 ${soft.length}건` : ''}. 이프로의 절차서로 용접이 진행됐고, 다음 날 현장 기록이 도착합니다.</p>
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

      (async () => {
        AU.fx('sfx_success', .55);
        /* 말풍선은 내레이션과 동시에 차례로 쌓아 빈 상자를 남기지 않는다 */
        const box = $('#thanksLines', root);
        const bubbles = (async () => {
          for(const l of SCENARIO.successLog){
            if(!alive(seq)) return;
            const p = document.createElement('div');
            p.className = 'say';
            p.innerHTML = `<b>${esc(l.who)}</b><span class="msg-time">${esc(l.time || '')}</span> ${l.t}`;
            box.appendChild(p);
            requestAnimationFrame(() => p.classList.add('in'));
            await wait(Math.max(900, Math.min(2600, 420 + l.t.length * 38)));
          }
        })();
        await narrate('n_pass', seq);
        await bubbles;
        if(!alive(seq)) return;
        await wait(300);
        if(!alive(seq)) return;
        await narrate('n_end_pass', seq);
      })();
    } else {
      root.innerHTML = `<div class="res-wrap"><div class="res-grid">
        <div class="res-visual fail-visual" id="resVisual">
          <div class="collapse-stage" id="collapseStage">${collapseSVG(ft.id)}</div>
          <div class="dust-layer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
        <div class="res-copy">
          <div class="res-badge bad">● 부적합 — ${ft.label}</div>
          <div class="res-score"><span class="n">${score}</span><span class="d">/ 100</span></div>
          <h2 class="res-title">${ft.label}${ft.where !== '—' ? ` — ${ft.where}에서 시작` : ''}</h2>
          <p class="res-sub">${ft.desc}</p>
          <div class="thanks-call fail">
            <div class="ct"><div class="av">박</div>
              <div class="who"><b>${SCENARIO.meta.caller}</b><span>${SCENARIO.meta.callerRole} · 긴급</span></div></div>
            <div id="failLines"></div>
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
      runCollapse(ft, root, seq);
    }

    const again = $('#btnAgain', root);
    if(again) again.addEventListener('click', () => {
      errors.forEach(e => { delete state.answers[e.f.id]; });
      show('wps');
      toast('틀린 칸만 비웠습니다. 맞힌 칸은 그대로 남아 있습니다.');
    });
    const rs = $('#btnRestart2', root);
    if(rs) rs.addEventListener('click', restart);
  }

  /* ── 불합격: 철골 붕괴 연출 ─────────────────────────────── */
  function runCollapse(ft, root, seq){
    const stage = $('#collapseStage', root);
    const visual = $('#resVisual', root);
    const flash = $('#flash');
    const impact = $('#impactText');

    if(stage) stage.classList.add('crack');
    later(() => AU.fx('sfx_crack', .9), 350);

    later(() => {
      if(!alive(seq)) return;
      if(stage) stage.classList.add('run');
      if(visual) visual.classList.add('shake-hard');
      AU.fx('sfx_collapse', .95);
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 700);
      flash.classList.add('on');
      impact.textContent = '붕괴';
      impact.classList.add('on');
      setTimeout(() => { impact.classList.remove('on'); }, 2100);
    }, 1150);

    later(() => { if(visual) visual.classList.remove('shake-hard'); }, 2600);

    (async () => {
      await wait(1500);
      if(!alive(seq)) return;
      const box = $('#failLines', root);
      for(const l of SCENARIO.failLog){
        if(!alive(seq)) return;
        const p = document.createElement('div');
        p.className = 'say alert';
        p.innerHTML = `<b>${esc(l.who)}</b><span class="msg-time">${esc(l.time || '')}</span> ${l.t}`;
        box.appendChild(p);
        requestAnimationFrame(() => p.classList.add('in'));
        await wait(Math.max(800, Math.min(2400, 420 + l.t.length * 40)));
      }
      if(!alive(seq)) return;
      await narrate('n_fail', seq);
      if(!alive(seq)) return;
      await narrate(ft.cause || 'n_cause_reject', seq);
      if(!alive(seq)) return;
      await narrate('n_end_fail', seq);
    })();

    later(() => {
      if(!alive(seq)) return;
      const z = $('#errZone');
      if(z) z.style.opacity = '1';
    }, 5200);
  }

  /* ======================================================================
     철골 단면 SVG — intact / pass (필렛 마커 포함)
     ====================================================================== */
  function beamSVG(mode, fracId, view){
    const vb = view || '152 18 418 356';
    const isFail = mode === 'fail';
    const crack = {
      hydrogen:'M282 156 L272 144 L264 132 L254 120',
      throat:  'M284 166 L302 176 L320 186 L338 176',
      fusion:  'M282 178 L318 178 L356 178',
      porosity:'M290 172 L318 172 L346 172',
      reject:  ''
    }[fracId || 'hydrogen'];

    return `<svg viewBox="${vb}" width="100%" role="img"
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

      <g class="grid" opacity=".2">
        ${Array.from({length:17},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="400" stroke="#1b2128" stroke-width="1"/>`).join('')}
        ${Array.from({length:10},(_,i)=>`<line x1="0" y1="${i*40}" x2="680" y2="${i*40}" stroke="#1b2128" stroke-width="1"/>`).join('')}
      </g>

      <g class="web-part">
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
        <text x="330" y="30" fill="#59636f" font-size="9" font-family="monospace">H-300×300</text>
      </g>

      <g class="bracket-part">
        <rect x="280" y="178" width="230" height="22" fill="url(#steelG)"/>
        <rect x="280" y="178" width="230" height="22" fill="url(#hatch)" opacity=".5"/>
        <rect x="280" y="178" width="230" height="22" fill="none" stroke="#4d5763" stroke-width="1.2"/>
        <text x="330" y="172" fill="#6f7a87" font-size="9.5" font-family="monospace">BRACKET 12t</text>
        <circle cx="470" cy="189" r="4.5" fill="#0b0f13" stroke="#4d5763"/>
      </g>

      <g class="weld-group">
        <path d="M280 178 L280 156 L306 178 Z" fill="url(#weld${mode === 'pass' ? 'Pass' : ''}G)" stroke="#8b97a5" stroke-width=".8"/>
        <path d="M280 200 L280 222 L306 200 Z" fill="url(#weld${mode === 'pass' ? 'Pass' : ''}G)" stroke="#8b97a5" stroke-width=".8"/>
        ${mode === 'pass' ? `
          <path d="M280 178 L280 156 L306 178" fill="none" stroke="#7cf0b0" stroke-width="2.2" filter="url(#glow)" opacity=".9"/>
          <path d="M280 200 L280 222 L306 200" fill="none" stroke="#7cf0b0" stroke-width="2.2" filter="url(#glow)" opacity=".9"/>` : ''}
      </g>

      ${fraсIdSafe()}

      ${mode === 'intact' ? `<g class="weld-pulse" aria-hidden="true">
        <circle cx="287" cy="169" r="9"/>
        <circle cx="287" cy="209" r="9"/>
      </g>` : ''}

      ${isFail && crack ? `<path class="crack-line" d="${crack}" fill="none" stroke="#ff5d4d" stroke-width="2.6" filter="url(#glow)"/>` : ''}

      <g stroke="#3d4652" stroke-width="1" fill="none">
        <line x1="306" y1="150" x2="306" y2="228" stroke="#ff9a3c" stroke-width="1" opacity=".5"/>
      </g>
      <text x="312" y="246" fill="#ff9a3c" font-size="10" font-family="monospace">3F · FILLET 6</text>
      <text x="250" y="392" fill="#6f7a87" font-size="9.5" font-family="monospace">ASTM A36 · 12t</text>

      ${mode === 'pass' ? `
        <g opacity=".95"><rect x="382" y="104" width="150" height="34" rx="4" fill="none" stroke="#4bd29a" stroke-width="1.4" transform="rotate(-6 457 121)"/>
        <text x="408" y="128" fill="#8ff0c4" font-size="15" font-family="monospace" font-weight="700" transform="rotate(-6 457 121)">PASS</text></g>` : ''}
    </svg>`;
  }
  function fraсIdSafe(){ return ''; }

  /* ======================================================================
     불합격 — 철골 골조 붕괴 SVG (기둥 좌굴 · 보 낙하 · 파단 스파크 · 먼지)
     ====================================================================== */
  function collapseSVG(kind){
    const debris = [[-52,-30,26,6,14],[-30,-58,18,5,-22],[40,-26,30,6,18],[66,-48,16,4,-16],
                    [-16,24,22,5,28],[52,30,24,5,-26],[-70,10,14,4,40],[78,4,18,4,-38]]
      .map(([dx,dy,w,h,rot],i)=>`<rect class="deb" x="300" y="246" width="${w}" height="${h}" rx="1"
        style="--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg;animation-delay:${0.55 + i*0.03}s"/>`).join('');

    return `<svg viewBox="0 0 660 470" width="100%" role="img" aria-label="철골 골조 붕괴 장면" class="collapse-svg">
      <defs>
        <linearGradient id="csSteel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#4a545f"/><stop offset=".6" stop-color="#252c34"/><stop offset="1" stop-color="#141a20"/>
        </linearGradient>
        <pattern id="csHatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#333c46" stroke-width="1.3"/>
        </pattern>
        <filter id="csGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <rect x="0" y="0" width="660" height="470" fill="#080a0c"/>
      <g opacity=".18">
        ${Array.from({length:15},(_,i)=>`<line x1="${i*48}" y1="0" x2="${i*48}" y2="470" stroke="#1b2128"/>`).join('')}
        ${Array.from({length:10},(_,i)=>`<line x1="0" y1="${i*48}" x2="660" y2="${i*48}" stroke="#1b2128"/>`).join('')}
      </g>

      <!-- 지반 -->
      <line x1="30" y1="430" x2="630" y2="430" stroke="#2c343d" stroke-width="2"/>
      <g opacity=".7">
        ${Array.from({length:14},(_,i)=>`<line x1="${44+i*42}" y1="430" x2="${34+i*42}" y2="444" stroke="#232a32" stroke-width="2"/>`).join('')}
      </g>

      <g class="frame">
        <!-- 기둥 -->
        <g class="col col-l">
          <rect x="150" y="96" width="30" height="334" fill="url(#csSteel)"/>
          <rect x="150" y="96" width="30" height="334" fill="url(#csHatch)" opacity=".55"/>
          <rect x="150" y="96" width="30" height="334" fill="none" stroke="#55606c" stroke-width="1.2"/>
          <rect x="136" y="424" width="58" height="8" fill="#39424d"/>
        </g>
        <g class="col col-r">
          <rect x="480" y="96" width="30" height="334" fill="url(#csSteel)"/>
          <rect x="480" y="96" width="30" height="334" fill="url(#csHatch)" opacity=".55"/>
          <rect x="480" y="96" width="30" height="334" fill="none" stroke="#55606c" stroke-width="1.2"/>
          <rect x="466" y="424" width="58" height="8" fill="#39424d"/>
        </g>

        <!-- 상부 보 -->
        <g class="beam beam-top">
          <rect x="150" y="84" width="360" height="26" fill="url(#csSteel)"/>
          <rect x="150" y="84" width="360" height="26" fill="url(#csHatch)" opacity=".5"/>
          <rect x="150" y="84" width="360" height="26" fill="none" stroke="#55606c" stroke-width="1.2"/>
        </g>

        <!-- 중간 보 -->
        <g class="beam beam-mid">
          <rect x="180" y="266" width="300" height="22" fill="url(#csSteel)"/>
          <rect x="180" y="266" width="300" height="22" fill="url(#csHatch)" opacity=".5"/>
          <rect x="180" y="266" width="300" height="22" fill="none" stroke="#55606c" stroke-width="1.2"/>
        </g>

        <!-- 브래킷 + 필렛 -->
        <g class="bracket-g">
          <rect x="252" y="236" width="96" height="30" fill="url(#csSteel)"/>
          <rect x="252" y="236" width="96" height="30" fill="url(#csHatch)" opacity=".5"/>
          <rect x="252" y="236" width="96" height="30" fill="none" stroke="#6a7684" stroke-width="1.2"/>
          <path d="M252 236 L252 222 L266 236 Z" fill="#7d8896"/>
          <path d="M348 236 L348 222 L334 236 Z" fill="#7d8896"/>
          <circle class="weld-hot" cx="252" cy="230" r="4"/>
          <circle class="weld-hot" cx="348" cy="230" r="4" style="animation-delay:.2s"/>
        </g>

        <!-- 가새 -->
        <g class="brace">
          <line x1="180" y1="288" x2="330" y2="110" stroke="#39424d" stroke-width="6"/>
          <line x1="480" y1="288" x2="330" y2="110" stroke="#39424d" stroke-width="6"/>
        </g>

        <!-- 용접부 균열 -->
        <path class="cs-crack" d="M252 230 L240 246 L246 262 L232 280" fill="none"
          stroke="#ff6152" stroke-width="2.6" filter="url(#csGlow)"/>

        <!-- 스파크 -->
        <g class="cs-sparks">
          ${[[-30,-26],[26,-18],[-18,22],[20,26],[4,-34],[-40,6]].map(([dx,dy],i)=>
            `<line class="cs-spark" x1="252" y1="230" x2="252" y2="230" stroke="${i%2?'#ffb066':'#fff1c9'}"
              stroke-width="1.8" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${0.03*i}s"/>`).join('')}
        </g>
      </g>

      <!-- 낙하 파편 -->
      <g class="debris">${debris}</g>

      <!-- 잔해 -->
      <g class="rubble" aria-hidden="true">
        <polygon points="150,430 214,430 236,404 190,412" fill="#4a545f"/>
        <polygon points="330,430 424,430 398,398 356,408" fill="#3f4954"/>
        <polygon points="452,430 540,430 512,410 470,414" fill="#4a545f"/>
        <rect x="252" y="404" width="86" height="16" rx="2" fill="#555f6b" transform="rotate(-9 295 412)"/>
        <rect x="404" y="398" width="60" height="12" rx="2" fill="#4d5763" transform="rotate(12 434 404)"/>
      </g>

      <!-- 판정 스탬프 -->
      <g class="cs-stamp" aria-hidden="true">
        <rect x="392" y="146" width="208" height="48" rx="4" fill="none" stroke="#ff5d4d" stroke-width="2.6" transform="rotate(-7 496 170)"/>
        <text x="424" y="180" fill="#ff7b6b" font-size="23" font-weight="700" font-family="'Pretendard Variable',sans-serif" transform="rotate(-7 496 170)">붕괴</text>
      </g>

      <!-- 먼지 -->
      <g class="cs-dust">
        <ellipse cx="210" cy="428" rx="90" ry="26" fill="#8d99a6" opacity=".0"/>
        <ellipse cx="400" cy="430" rx="120" ry="30" fill="#7b8794" opacity=".0"/>
        <ellipse cx="320" cy="424" rx="70" ry="22" fill="#9aa6b3" opacity=".0"/>
      </g>
    </svg>`;
  }

  /* ======================================================================
     기타
     ====================================================================== */
  function restart(){
    clearTimers();
    state.answers = {};
    closePop();
    AU.stopAll();
    show('landing');
    window.scrollTo({top:0});
  }

  /* 시작 */
  AU.init();
  $('#btnStart').addEventListener('click', () => { AU.startBgm(); show('call'); });
  $('#btnRestart').addEventListener('click', () => {
    if(state.scene === 'landing') return;
    if(confirm('처음부터 다시 시작할까요? 작성한 내용은 사라집니다.')) restart();
  });
  const mute = $('#btnMute');
  if(mute) mute.addEventListener('click', () => AU.setMuted(!AU.muted));
  const bgmBtn = $('#btnBgm');
  if(bgmBtn) bgmBtn.addEventListener('click', () => AU.setBgm(!AU.bgmOn));
  /* QA 훅 — 배경음악 덕킹·토글 상태 확인용(읽기 전용) */
  window.__wpsAudio = {
    get bgmVol(){ return AU.bgm ? Math.round(AU.bgm.volume * 1000) / 1000 : null; },
    get muted(){ return AU.muted; },
    get bgmOn(){ return AU.bgmOn; }
  };

  document.addEventListener('keydown', e => {
    if(state.scene === 'landing' && (e.key === 'Enter' || e.key === ' ')){
      e.preventDefault(); AU.startBgm(); show('call');
    }
  });
})();
