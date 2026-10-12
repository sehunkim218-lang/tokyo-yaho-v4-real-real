/* 도쿄 야호 — 앱 로직
   화면은 data/*.json 을 읽어서 그리기만 한다. 내용이 없으면 "들어올 자리" 화면을 보여 준다.
   개인 기록(메모, 체크, 미션, 퀴즈 답, 참여 코드)은 이 기기의 localStorage 에만 저장한다. */
(function () {
  'use strict';

  /* ================= 기본 도구 ================= */
  const app = document.getElementById('app');
  const tabbar = document.getElementById('tabbar');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const has = (v) => !(v == null || v === '' || (Array.isArray(v) && v.length === 0));
  const NEED = '<span class="need">[확인 필요]</span>';
  // 값이 없으면 [확인 필요], 값 안에 "[확인 필요]" 글자가 있으면 표시로 바꿔 줌
  const val = (v) => (has(v) ? esc(v).replace(/\[확인 필요\]/g, NEED) : NEED);

  const store = {
    get(k, d) { try { const v = localStorage.getItem('ty.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ty.' + k, JSON.stringify(v)); } catch (e) { toast('이 기기에 저장하지 못했어요. 저장 공간을 확인해 주세요.'); } }
  };

  const ICONS = {
    home: 'M4 11l8-6 8 6v9h-5v-6H9v6H4z', calendar: 'M5 6h14v14H5zM5 10h14M9 4v4M15 4v4',
    pin: 'M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5',
    phone: 'M6 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z',
    bed: 'M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3M7 11.5a1.5 1.5 0 1 0 0-.01',
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z', quake: 'M3 12h3l2-5 3 10 3-8 2 3h5',
    bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2', chat: 'M4 5h16v11H9l-5 4z', rule: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3',
    yen: 'M7 4l5 7 5-7M12 11v9M8 13h8M8 16.5h8', check: 'M5 12.5l4.5 4.5L19 7', chevR: 'M9 5l7 7-7 7', chevL: 'M15 5l-7 7 7 7',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2',
    refresh: 'M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5',
    map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    quiz: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    pencil: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3', lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', swap: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',
    walk: 'M13 4.5a1.5 1.5 0 1 0 0-.01M10 21l2-6 3 3v3M12 15l-1-5 3-2 2 3 3 1M11 10l-3 2-1 3',
    train: 'M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 11h14M8 20l2-3M16 20l-2-3',
    food: 'M7 4v7M5 4v4a2 2 0 0 0 4 0V4M7 11v9M16 4c-1.7 0-3 2-3 5s1.3 4 3 4v7', flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    alert: 'M12 4l9 16H3zM12 10v4M12 17h.01', close: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14', wave: 'M3 14c1.5 0 2.3-1.5 4.5-1.5S10 14 12 14s2.3-1.5 4.5-1.5S19.5 14 21 14M3 18.5c1.5 0 2.3-1.5 4.5-1.5S10 18.5 12 18.5s2.3-1.5 4.5-1.5 3 1.5 4.5 1.5M12 9.5a3 3 0 1 0 0-.01M12 3v1.5M6.5 5.5l1 1M17.5 5.5l-1 1',
    bridge: 'M2 16h20M5 19V7M19 19V7M5 8c2.5 4 11.5 4 14 0M9 16v-4.5M12 16v-4M15 16v-4.5', bolt: 'M13 2.5L5 13.5h6l-1.5 8 8.5-11.5h-6z',
    film: 'M4 10h16v10H4zM4 10l1.2-5 15 0-1.2 5M9.5 5l-1.6 5M15 5l-1.6 5', castle: 'M4 21V10h3V7h2v3h2V4l1-1 1 1v6h2V7h2v3h3v11zM10 21v-4a2 2 0 0 1 4 0v4',
    temple: 'M2.5 9.5L12 4l9.5 5.5M5 9.5h14M4 13h16M6.5 13l-1.5 2.5h14L17.5 13M7 15.5V21M17 15.5V21M3.5 21h17M10 21v-3h4v3', plane: 'M3 14l8-2.5V6a1.5 1.5 0 0 1 3 0v5.5l8 2.5v2l-8-1.5V19l2.5 1.5V22L12 21l-4.5 1v-1.5L10 19v-4.5L3 16z', sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4',
    cloud: 'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.1 3.5 3.5 0 0 0 7 18z', rain: 'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 7.1 3.5 3.5 0 0 0 7 14zM8 17l-1 3M12 17l-1 3M16 17l-1 3',
    snow: 'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 7.1 3.5 3.5 0 0 0 7 14zM8 18h.01M12 20h.01M16 18h.01M10 21h.01M14 22h.01',
    suncloud: 'M8 3v1.5M3.5 7.5H2M4.3 3.8l1 1M11.7 3.8l-1 1M5.2 10.2A3.5 3.5 0 1 1 11 6.6M9 19h8.5a3.5 3.5 0 0 0 .4-6.98 5 5 0 0 0-9.6 1.6A2.7 2.7 0 0 0 9 19z',
    search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20', arrow: 'M12 3l6 16-6-4-6 4z', star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z'
  };
  const ic = (n, s = 24, w = 1.8) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" stroke-width="${w}" aria-hidden="true"><path d="${ICONS[n] || ICONS.help}"></path></svg>`;

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  const pad2 = (n) => String(n).padStart(2, '0');
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  function fmtDate(iso) { if (!iso) return null; const d = new Date(iso + 'T00:00:00'); if (isNaN(d)) return null; return `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})`; }
  function fmtStamp(ms) { if (!ms) return null; const d = new Date(ms); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

  /* ================= 데이터 ================= */
  const NAMES = ['trip', 'schedule', 'places', 'notices', 'contacts', 'phrases', 'etiquette', 'emergency', 'lost', 'checklist', 'missions', 'quiz', 'dishes'];
  const DEFAULTS = {
    trip: { hotel: {}, exchange: {}, map: {} }, schedule: { days: [] }, places: [], notices: { items: [] }, contacts: [],
    phrases: { categories: [], allergens: [] }, etiquette: [], emergency: { situations: [], lostWay: { steps: [] } },
    lost: { situations: [] }, checklist: [], missions: { place: [], photo: [] }, quiz: [], dishes: {}
  };
  // ?data=examples 로 열면 data/examples/ 의 형식 예시를 먼저 읽는다 (채워진 화면 확인용)
  const EXAMPLES = new URLSearchParams(location.search).get('data') === 'examples';
  const D = {};

  async function getJSON(path, opts) {
    const r = await fetch(path, opts); if (!r.ok) throw new Error(path); return r.json();
  }
  async function loadData() {
    await Promise.all(NAMES.map(async (n) => {
      let v = null;
      if (EXAMPLES) { try { v = await getJSON('data/examples/' + n + '.json'); } catch (e) { v = null; } }
      if (v == null) { try { v = await getJSON('data/' + n + '.json'); } catch (e) { v = null; } }
      D[n] = v == null ? DEFAULTS[n] : v;
    }));
    D.trip.hotel = D.trip.hotel || {}; D.trip.exchange = D.trip.exchange || {}; D.trip.map = D.trip.map || {};
    D.schedule.days = D.schedule.days || []; D.notices.items = D.notices.items || [];
    D.missions.place = D.missions.place || []; D.missions.photo = D.missions.photo || [];
  }
  const placeById = (id) => (D.places || []).find((p) => p.id === id);

  // 공지만 인터넷에서 새로 받아 온다
  async function refreshNotices(silent) {
    if (!navigator.onLine) { if (!silent) toast('인터넷에 연결되지 않았어요. 저장된 공지를 보여 줘요.'); return false; }
    try {
      const path = (EXAMPLES ? 'data/examples/' : 'data/') + 'notices.json';
      const n = await getJSON(path + '?t=' + Date.now(), { cache: 'no-store' });
      D.notices = n; D.notices.items = n.items || [];
      store.set('noticeFetchedAt', Date.now());
      if (!silent) toast('공지를 새로 받았어요.');
      return true;
    } catch (e) { if (!silent) toast('공지를 받지 못했어요. 잠시 뒤 다시 해 보세요.'); return false; }
  }

  /* ================= 오프라인 저장 (진입 화면의 진행률) ================= */
  let cacheState = { pct: store.get('cachedVersion') === self.APP_CACHE ? 100 : 0, busy: false, error: null };
  async function cacheAll() {
    if (!('caches' in window)) { cacheState = { pct: 0, busy: false, error: '이 브라우저는 오프라인 저장을 지원하지 않아요.' }; paintCache(); return; }
    if (cacheState.busy || cacheState.pct === 100) return;
    cacheState.busy = true; cacheState.error = null;
    try {
      const c = await caches.open(self.APP_CACHE);
      const files = self.APP_FILES; let done = 0;
      for (const f of files) {
        if (!(await c.match(f))) { const r = await fetch(f, { cache: 'reload' }); if (!r.ok) throw new Error(f); await c.put(f, r); }
        done++; cacheState.pct = Math.round((done / files.length) * 100); paintCache();
      }
      store.set('cachedVersion', self.APP_CACHE);
    } catch (e) {
      cacheState.error = navigator.onLine ? '저장하다 멈췄어요. 다시 시도해 주세요.' : '인터넷이 끊겨서 저장하지 못했어요. 와이파이에서 다시 열어 주세요.';
    }
    cacheState.busy = false; paintCache();
  }
  function cacheHTML() {
    const p = cacheState.pct, done = p === 100;
    const line = cacheState.error
      ? `<div class="status" style="color: var(--shu)">${ic('alert', 20, 2)}${esc(cacheState.error)}</div><button class="btn btn-quiet btn-sm btn-auto" data-act="retryCache">다시 저장하기</button>`
      : done ? `<div class="status">${ic('check', 20, 2.4)}오프라인 저장 완료 · 이제 데이터 없이도 열려요</div>`
        : `<div class="status">${ic('refresh', 20, 2)}오프라인 저장 중 <span style="color: var(--ginkgo-deep)">${p}%</span></div>`;
    return `${line}
      <div class="progress ${done ? 'done' : ''}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="오프라인 저장"><div style="width:${p}%"></div></div>
      <div class="small muted">${done ? '일정·장소·도움말·일본어 문장을 모두 이 폰에 담았어요.' : '와이파이가 있을 때 끝까지 기다려 주세요. 창을 닫지 마세요.'}</div>`;
  }
  function paintCache() { const el = document.getElementById('cache'); if (el) el.innerHTML = cacheHTML(); }

  /* ================= 공통 조각 ================= */
  const TABS = [['home', 'home', '홈'], ['schedule', 'calendar', '일정'], ['places', 'pin', '장소'], ['help', 'help', '도움'], ['me', 'user', '나']];
  function paintTabs(active) {
    tabbar.innerHTML = TABS.map(([r, i, l]) => `<a href="#/${r}" ${r === active ? 'aria-current="page"' : ''}><span class="face">${ic(i, 24, r === active ? 2 : 1.8)}</span>${l}</a>`).join('');
  }
  function header(title, jp, back, right = '') {
    const top = back || right ? `<div class="hd-top">${back ? `<a class="back" href="${back}" aria-label="뒤로">${ic('chevL', 26, 2)}</a>` : '<span></span>'}${right}</div>` : '';
    return `<header class="hd">${top}<div class="kicker" lang="ja">${jp}</div><h1 class="h1">${title}</h1></header>`;
  }
  function slot(kicker, title, body, ghosts, icon) {
    const g = ghosts ? `<div class="ghosts">${ghosts.map((r) => `<div>${r.map((t) => `<span class="ghost">${t}</span>`).join('')}</div>`).join('')}</div>` : '';
    return `<section class="slot"><div class="slot-row">${icon ? `<div class="slot-ic">${ic(icon, 22)}</div>` : ''}<div style="display:flex;flex-direction:column;gap:4px">
      <div class="kicker">${kicker}</div><div class="slot-t">${title}</div><div class="slot-b">${body}</div></div></div>${g}</section>`;
  }
  const chips = (items, active, act) => `<div class="chips">${items.map((t, i) => `<button type="button" class="chip" aria-pressed="${i === active}" data-act="${act}" data-i="${i}">${esc(t)}</button>`).join('')}</div>`;
  const photo = (src, label, h) => `<div class="photo" style="${h ? 'height:' + h + 'px' : ''}">${src ? `<img src="${esc(src)}" alt="${esc(label)}" loading="lazy">` : `<span>${ic('camera', 16)}${esc(label)} 자리</span>`}</div>`;
  function steps(list) {
    return `<ol class="steps">${(list || []).map((s, i) => `<li><span class="n">${i + 1}</span><div class="st"><b>${val(s.title)}</b>${s.detail ? `<span>${val(s.detail)}</span>` : ''}</div></li>`).join('')}</ol>`;
  }

  /* ================= 일정 계산 ================= */
  function allItems() {
    const out = [];
    D.schedule.days.forEach((d, di) => (d.items || []).forEach((it, ii) => {
      let at = null;
      if (d.date && /^\d{1,2}:\d{2}$/.test(it.time || '')) { at = new Date(d.date + 'T' + it.time.padStart(5, '0') + ':00'); if (isNaN(at)) at = null; }
      out.push(Object.assign({}, it, { di, ii, at }));
    }));
    return out;
  }
  function nowNext() {
    const now = Date.now(); const timed = allItems().filter((x) => x.at).sort((a, b) => a.at - b.at);
    let cur = null, next = null;
    for (const x of timed) { if (x.at <= now) cur = x; else { next = x; break; } }
    const nextMeet = timed.find((x) => x.at > now && x.type === '집결') || null;
    return { cur, next, nextMeet, timed: timed.length };
  }
  function countdown(to) {
    const m = Math.max(0, Math.round((to - Date.now()) / 60000));
    const h = Math.floor(m / 60), mm = m % 60;
    return h > 0 ? `${h}시간 ${pad2(mm)}분` : `${mm}분`;
  }

  /* ================= 화면: 진입 ================= */
  function vEntry() {
    const leaves = Array.from({ length: 12 }, (_, i) => {
      const k = ['g', 'r', 'g', 'o'][i % 4];
      return `<span class="leaf ${k}" style="left:${6 + ((i * 41) % 90)}%;animation-duration:${9 + (i % 5) * 2}s;animation-delay:${-i * 1.7}s"></span>`;
    }).join('');
    const err = ui.entryErr ? `<div class="err" role="alert">${esc(ui.entryErr)}</div>` : '';
    return `<section class="entry">
      <div class="vert" aria-hidden="true" lang="ja">東京<small>修学旅行</small></div>
      <div class="leaves" aria-hidden="true">${leaves}</div>
      <div style="display:flex;flex-direction:column;gap:8px;position:relative">
        <div class="kicker" lang="ja">東京 · 修学旅行</div>
        <h1 class="display">${esc(D.trip.title || '도쿄 야호')}</h1>
        <p style="margin:0;font-size:17px;color:var(--slate-deep)">${esc(D.trip.subtitle || '2026 도쿄 수학여행 가이드북')}</p>
      </div>
      <form class="field" data-form="join" novalidate>
        <label class="label" for="code">참여 코드</label>
        <input class="input" id="code" name="code" autocomplete="off" autocapitalize="characters" placeholder="선생님께 받은 코드" value="${esc(store.get('code', ''))}">
        ${err}
        <button class="btn btn-primary" type="submit" style="min-height:60px;font-size:18px">시작하기</button>
      </form>
      <div id="cache" style="display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid var(--line)">${cacheHTML()}</div>
    </section>`;
  }

  /* ================= 화면: 홈 ================= */
  function noticeMeta() {
    const at = fmtStamp(store.get('noticeFetchedAt', null));
    return `<div class="meta">${ic('refresh', 16)}${at ? '마지막 갱신 ' + at : '마지막 갱신 — · 연결되면 자동으로 확인'}
      <button class="linkbtn" data-act="refreshNotices">지금 새로 받기</button></div>`;
  }
  function homeHeader() {
    return `<header class="hd" style="gap:12px;padding-bottom:8px">
        <div><span class="pill ${navigator.onLine ? 'on-line' : ''}">${ic('check', 16, 2.2)}${navigator.onLine ? '연결됨 · 공지 확인 가능' : '오프라인 · 저장본으로 열림'}</span></div>
        <div style="display:flex;flex-direction:column;gap:4px"><div class="kicker" lang="ja">ホーム</div><h1 class="h1">${esc(D.trip.title || '도쿄 야호')}</h1></div></header>`;
  }
  function vHome() {
    const items = D.notices.items;
    const pinned = items.find((n) => n.pinned) || items[0];
    const noticeBox = pinned
      ? `<section class="card card-soft" style="gap:8px"><div class="kicker" style="color:var(--ginkgo-deep);display:flex;gap:6px;align-items:center">${ic('flag', 16, 2)}${pinned.pinned ? '고정 공지' : '최신 공지'}</div>
          <div style="font-size:18px;line-height:26px;font-weight:700">${val(pinned.title)}</div>${pinned.body ? `<div style="font-size:15px;line-height:22px">${val(pinned.body)}</div>` : ''}
          ${items.length > 1 ? `<a href="#/notices" style="font-weight:700;min-height:44px;display:inline-flex;align-items:center">공지 ${items.length}개 모두 보기</a>` : ''}</section>`
      : (D.schedule.days.some((d) => (d.items || []).length)
        ? `<section class="card card-line" style="gap:2px;flex-direction:row;align-items:center"><span style="color:var(--slate-deep)">${ic('flag', 20)}</span><div style="display:flex;flex-direction:column;padding-left:8px"><b>선생님 공지 · 아직 없어요</b><span class="small muted">인터넷에 연결되면 새로 받아 와요.</span></div></section>`
        : slot('고정 공지', '아직 받은 공지가 없어요', '인터넷에 연결되면 선생님 공지를 새로 받아 와요. 공지 말고는 모두 오프라인으로 열려요.', null, 'flag'));

    const nn = nowNext();
    const hasSched = D.schedule.days.some((d) => (d.items || []).length);
    if (!pinned && !hasSched) {
      const h = D.trip.hotel || {};
      const row = (icn, t, sub, ok) => `<li>${ic(icn, 22)}<span class="lb"><b>${t}</b><span class="small">${sub}</span></span><span class="st-wait ${ok ? 'st-ok' : ''}">${ok ? '준비됨' : '기다리는 중'}</span></li>`;
      return homeHeader() + `<div class="body">
        <section class="wait"><div class="kicker" lang="ja">準備中</div><div class="t">학교 일정 공개를 기다리는 중이에요</div>
          <div class="d">내용이 정해지면 이 화면에 지금 할 일과 다음 집결까지 남은 시간이 떠요. 일본어 문장, 생활 규칙, 재난 요령은 도움 탭에서 지금도 볼 수 있어요.</div>
          <ul>${row('flag', '선생님 공지', '인터넷이 연결되면 자동으로 받아요', false)}
            ${row('calendar', '지금 · 다음 일정', '학교 일정이 공개되면 채워져요', false)}
            ${row('clock', '다음 집결까지 남은 시간', '집결 시각이 정해지면 세기 시작해요', false)}
            ${row('bed', '숙소 이름 · 주소', '확정되면 일본어로 보여 줄 수 있어요', has(h.name_ja))}</ul></section>
        ${noticeMeta()}
        <div class="quick"><a class="q-shu" href="#/help/contacts">${ic('phone', 28, 2)}긴급 연락</a><a class="q-ink" href="#/help/hotel">${ic('bed', 28, 2)}숙소 보여주기</a></div></div>`;
    }
    let schedBox;
    const tc = todayCard();
    if (!hasSched) {
      schedBox = slot('지금 · 다음 일정', '일정이 공개되면 여기에 떠요', '지금 하는 일정과 바로 다음 일정이 시각·장소와 함께 나와요.', [['시각', '일정 제목', '장소'], ['다음', '시각', '일정 제목']], 'calendar');
    } else if (!nn.timed) {
      schedBox = '';
    } else {
      const row = (x, tag) => x ? `<a href="#/schedule/${x.di}"><div class="when"><span class="tag" ${tag === '다음' ? 'style="color:var(--slate-deep)"' : ''}>${tag}</span><b>${esc(x.time)}</b></div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-grow:1"><span class="tt">${val(x.title)}</span><span class="small muted">${x.placeId && placeById(x.placeId) ? esc(placeById(x.placeId).name_ko) : val(x.place)}</span></div>${ic('chevR', 20)}</a>`
        : `<div class="row"><div class="when"><span class="tag">${tag}</span></div><span class="muted">${tag === '지금' ? '진행 중인 일정이 없어요' : '남은 일정이 없어요'}</span></div>`;
      schedBox = `<section class="nn">${row(nn.cur, '지금')}${row(nn.next, '다음')}</section>`;
    }

    const meet = nn.nextMeet
      ? `<section class="card card-shu" style="gap:6px"><div class="kicker" style="color:var(--shu)">다음 집결까지 · <span lang="ja">集合</span></div>
          <div class="count live" id="countdown" data-to="${nn.nextMeet.at.getTime()}">${countdown(nn.nextMeet.at)}</div>
          <div style="font-size:15px;line-height:22px">${val(nn.nextMeet.title)} · ${esc(nn.nextMeet.time)}</div></section>`
      : `<section class="card" style="gap:4px"><div class="kicker">다음 집결까지 · <span lang="ja">集合</span></div><div class="count empty">--시간 --분</div>
          <div style="font-size:15px;line-height:22px;color:var(--slate-deep)">집결 시각과 장소가 확정되면 남은 시간을 세어 드려요.</div></section>`;

    return homeHeader() + `
      <div class="body">${tc}${weatherCard()}${exploreTiles()}${noticeBox}${noticeMeta()}${schedBox}${nn.timed ? meet : ''}${changesLink()}
        <div class="quick"><a class="q-shu" href="#/help/contacts">${ic('phone', 28, 2)}긴급 연락</a><a class="q-ink" href="#/help/hotel">${ic('bed', 28, 2)}숙소 보여주기</a></div></div>`;
  }
  function tripDays() { return D.schedule.days.filter((d) => d.date); }
  function dayDiff(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000); }
  function todayCard() {
    const ds = tripDays(); if (!ds.length) return '';
    const t = todayISO(), first = ds[0], last = ds[ds.length - 1];
    if (t < first.date) {
      const n = dayDiff(first.date, t);
      const fi = D.schedule.days.indexOf(first);
      const todo = [['Visit Japan Web QR 만들기', '입국용·세관용, 한 사람에 하나씩', '#/help/airport'], ['보조배터리 2개까지', '부치는 짐에 넣지 않아요', '#/help/airport'], ['준비물 체크', '챙긴 것을 표시해 둬요', '#/help/checklist']];
      return `<section class="today"><div class="dd"><span class="kicker" lang="ja">出発まで</span><b>D-${n}</b><span>${fmtDate(first.date)} ${esc(first.label)}</span></div>
        <div class="kicker" style="margin-top:4px">출발 전에 할 일</div>
        <ul class="todo">${todo.map((x) => `<li><a href="${x[2]}">${ic('check', 18, 2.2)}<span><b>${x[0]}</b><small>${x[1]}</small></span>${ic('chevR', 18)}</a></li>`).join('')}</ul>
        <a class="linkrow" href="#/schedule/${fi + 1 < D.schedule.days.length ? fi + 1 : fi}">첫날 일정 미리 보기 ${ic('chevR', 18, 2)}</a></section>`;
    }
    if (t > last.date) return `<section class="today"><div class="dd"><span class="kicker" lang="ja">おつかれさま</span><b style="font-size:28px">여행이 끝났어요</b><span>나 탭에서 기록과 미션을 마무리해요.</span></div></section>`;
    const d = ds.find((x) => x.date === t);
    if (!d) return '';
    const di = D.schedule.days.indexOf(d);
    const ps = []; (d.items || []).forEach((it) => { const p = it.placeId && placeById(it.placeId); if (p && !ps.includes(p)) ps.push(p); });
    const warn = ps.map((p) => p.rules && p.rules[0]).filter(Boolean).slice(0, 3);
    return `<section class="today"><div class="dd"><span class="kicker" lang="ja">今日</span><b style="font-size:30px">${esc(d.label)} · ${fmtDate(d.date)}</b>${d.region ? `<span>${val(d.region)}</span>` : ''}</div>
      ${d.meals ? `<div class="small"><b>식사</b> ${['조', '중', '석'].map((k) => `${k} ${val(d.meals[k])}`).join(' · ')}</div>` : ''}
      ${ps.length ? `<div class="kicker" style="margin-top:4px">오늘 가는 곳</div><div class="tplaces">${ps.map((p) => `<a href="#/place/${encodeURIComponent(p.id)}">${esc(p.name_ko)}${ic('chevR', 16, 2)}</a>`).join('')}</div>` : ''}
      ${warn.length ? `<div class="kicker" style="margin-top:4px;color:var(--shu)">오늘 주의</div><ul class="blist">${warn.map((w) => `<li>${val(w)}</li>`).join('')}</ul>` : ''}
      <a class="linkrow" href="#/schedule/${di}">오늘 일정 전체 보기 ${ic('chevR', 18, 2)}</a></section>`;
  }
  function dishCredits(list) {
    const ks = [...new Set((list || []).map((x) => x.dish).filter((k) => dish(k)))];
    if (!ks.length) return '';
    return `<details class="srcs"><summary>음식 사진 출처 ${ks.length}장</summary><ul>${ks.map((k) => { const d = dish(k); return `<li>${esc(d.name)}: <a href="${esc(d.page)}" target="_blank" rel="noopener">${esc(d.author)} · ${esc(d.license)}</a> (Wikimedia Commons)</li>`; }).join('')}</ul></details>`;
  }
  // 홈: 먹거리·명소·쇼핑·지도로 가는 칸
  function exploreTiles() {
    const ps = D.places || []; if (!ps.length) return '';
    const pic = (id) => { const p = placeById(id); return p && p.photo ? p.photo : ''; };
    const dsrc = (k) => (dish(k) ? dish(k).src : '');
    const gl = (p, k) => (p[k] || []).filter((x) => x.guide !== false);
    const nFood = ps.reduce((a, p) => a + gl(p, 'food').length, 0), nSee = ps.reduce((a, p) => a + (p.sights || []).length, 0), nShop = ps.reduce((a, p) => a + (p.shops || []).length, 0);
    const t = (href, img, kick, title, sub, cls = '') => `<a class="xtile ${cls}" href="${href}" style="${img ? `background-image:url('${esc(img)}')` : ''}"><span class="xk">${kick}</span><b>${title}</b><span class="xs">${sub} ${ic('chevR', 16, 2.4)}</span></a>`;
    return `<section class="explore"><div class="sec-title" style="padding:0"><h2 class="h2">오늘 뭐 하지?</h2><span class="kicker" lang="ja">さがす</span></div>
      <div class="xgrid">${t('#/eat', dsrc('ramen') || pic('divercity'), '먹거리 · ' + nFood + '곳', '배꼽시계<br>울리면 여기', '먹을 곳 모아보기', 'wide')}
        ${t('#/see', pic('rainbow-bridge'), '명소 · ' + nSee + '곳', '인생샷<br>건지러 가자', '볼거리 모아보기')}
        ${t('#/shop', pic('akihabara'), '쇼핑 · ' + nShop + '곳', '지갑 열리는<br>시간', '스포츠 용품점')}
        ${t('#/map', pic('disneysea'), '지도 · 도장 ' + ((D.missions && D.missions.place) || []).length + '개', '도장 깨러<br>출발!', '지도에서 찾기', 'wide')}</div></section>`;
  }
  // 먹거리·명소·쇼핑 모아보기 (장소별, 날짜로 거르기)
  const GUIDE = {
    eat: { key: 'food', title: '먹거리', ja: 'グルメ', lead: '배고프면 일단 여기부터. 장소마다 먹을 곳을 모았어요.' },
    see: { key: 'sights', title: '명소', ja: 'みどころ', lead: '놓치면 아쉬운 것만 골랐어요. 어디에 있는지도 같이 적었어요.' },
    shop: { key: 'shops', title: '쇼핑', ja: 'かいもの', lead: '스포츠 용품점 위주로 모았어요. ★는 추천이에요.' }
  };
  function vGuide(kind) {
    const g = GUIDE[kind]; if (!g) return vHome();
    const days = D.schedule.days.filter((d) => /일차$/.test(d.label || ''));
    const chipsL = ['전체'].concat(days.map((d) => `${d.label} ${fmtDate(d.date) || ''}`));
    if (ui.gday >= chipsL.length) ui.gday = 0;
    const dn = ui.gday ? parseInt(days[ui.gday - 1].label, 10) : 0;
    const items = (p) => (p[g.key] || []).filter((x) => x.guide !== false);
    const ps = (D.places || []).filter((p) => items(p).length && (!dn || (p.days || []).includes(dn)));
    const body = ps.length ? ps.map((p) => `<section class="gsec2"><a class="ghead" href="#/place/${encodeURIComponent(p.id)}">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : badge(p, 48)}<span><b>${esc(p.name_ko)}</b><small>${esc(placeDays(p))}</small></span>${ic('chevR', 20)}</a>
        ${glist(items(p), { links: kind === 'shop' })}</section>`).join('')
      : slot(g.title, '이날은 모아 둔 곳이 없어요', '다른 날짜를 골라 보세요.', null, 'pin');
    const credits = kind === 'eat' ? dishCredits(ps.flatMap((p) => items(p))) : '';
    return header(g.title, g.ja, '#/home') + `<div style="margin-top:-4px">${chips(chipsL, ui.gday, 'gday')}</div>
      <div class="body gap-16" style="padding-top:12px"><p class="lead" style="margin:0">${g.lead}</p>${body}
      ${kind === 'eat' ? '<div class="small muted">음식 사진은 그 가게가 아니라 음식 종류를 보여주는 예시예요.</div>' : ''}${credits}</div>`;
  }
  function allChanges() { return (D.places || []).filter((p) => p.changes && p.changes.length); }
  function changesLink() {
    const ps = allChanges(); if (!ps.length) return '';
    const n = ps.reduce((a, p) => a + p.changes.length, 0);
    return `<a class="pcard" href="#/changes" style="align-items:center"><span class="slot-ic" style="flex-shrink:0">${ic('flag', 22)}</span><div class="c" style="flex-grow:1"><span class="ko">최근에 바뀐 것 ${n}건</span><span class="small muted">휴업·공사·규정 변경을 한 번에 봐요</span></div>${ic('chevR', 22)}</a>`;
  }
  function vChanges() {
    const ps = allChanges();
    const at = ps.map((p) => p.checkedAt).filter(Boolean).sort().pop();
    return header('최근에 바뀐 것', 'お知らせ', '#/home') + `<div class="body gap-12"><div class="small muted">${at ? fmtDate(at) + ' 조사 기준이에요. ' : ''}출발 직전에 공식 사이트에서 한 번 더 확인해요.</div>
      ${ps.length ? ps.map((p) => `<section class="card card-line" style="gap:8px"><a href="#/place/${encodeURIComponent(p.id)}" class="chg-h"><b>${esc(p.name_ko)}</b>${ic('chevR', 18, 2)}</a><ul class="blist">${p.changes.map((c) => `<li>${val(c)}</li>`).join('')}</ul></section>`).join('')
        : slot('바뀐 것', '아직 정리된 내용이 없어요', '휴업이나 공사 소식이 생기면 여기에 모여요.', null, 'flag')}</div>`;
  }
  function vAirport() {
    const ap = placeById('narita-airport');
    const ins = [{ title: '입국심사', detail: 'Visit Japan Web 입국 QR과 여권을 보여줘요. 한 사람씩.' }, { title: '짐 찾기', detail: '부친 짐을 찾아요.' }, { title: '세관', detail: 'Visit Japan Web 세관 QR과 IC여권을 전자신고 단말기에 찍어요.' }, { title: '집합', detail: '집합 장소 [확인 필요]' }];
    const outs = [{ title: '체크인', detail: '출발 2시간 전까지 공항 도착. 항공사·터미널 [확인 필요]' }, { title: '보안검색', detail: '액체는 100ml 이하 용기를 1L 지퍼백에. 보조배터리는 들고 타요.' }, { title: '세관', detail: '필요한 사람만 (면세품 확인 등)' }, { title: '출국심사', detail: '얼굴인증 게이트를 쓰면 여권에 도장이 안 찍혀요.' }, { title: '탑승구', detail: '보안검색 뒤 식당은 장소 화면 참고' }];
    return header('공항 · 입출국', '空港', '#/help') + `<div class="body gap-20">
      <div class="sec-title"><h2 class="h2">도착할 때 · 10/20</h2><span class="kicker" lang="ja">入国</span></div>${steps(ins)}
      <div class="sec-title"><h2 class="h2">떠날 때 · 10/23</h2><span class="kicker" lang="ja">出国</span></div>${steps(outs)}
      ${ap && ap.rules ? `<section class="card card-shu" style="gap:8px"><div class="kicker" style="color:var(--shu)">짐 규정</div><ul class="blist">${ap.rules.map((r) => `<li>${val(r)}</li>`).join('')}</ul></section>` : ''}
      ${ap ? `<a class="btn btn-quiet" href="#/place/narita-airport">${ic('plane', 22, 2)}나리타공항 터미널·식당 보기</a>` : ''}</div>`;
  }
  /* ================= 날씨: 일본 기상청(気象庁) 도쿄 예보 ================= */
  // 인터넷이 될 때 기상청 JSON을 받아 이 폰에 저장하고, 오프라인이면 마지막 저장본을 보여 줌
  const JMA_URL = 'https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json';
  const JMA_PAGE = 'https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=130000';
  const WX = { 100: '맑음', 101: '맑고 때때로 흐림', 102: '맑고 한때 비', 103: '맑고 때때로 비', 104: '맑고 한때 눈', 105: '맑고 때때로 눈', 106: '맑고 한때 비나 눈', 107: '맑고 때때로 비나 눈', 108: '맑고 한때 비나 뇌우',
    110: '맑다가 때때로 흐림', 111: '맑다가 흐림', 112: '맑다가 한때 비', 113: '맑다가 때때로 비', 114: '맑다가 비', 115: '맑다가 한때 눈', 116: '맑다가 때때로 눈', 117: '맑다가 눈', 118: '맑다가 비나 눈', 119: '맑다가 비나 뇌우',
    120: '맑고 아침저녁 한때 비', 121: '맑고 오전 한때 비', 122: '맑고 저녁 한때 비', 123: '맑고 산간 뇌우', 124: '맑고 산간 눈', 125: '맑고 오후 뇌우', 126: '맑다가 낮부터 비', 127: '맑다가 저녁부터 비', 128: '맑다가 밤에 비',
    130: '오전 안개 뒤 맑음', 131: '맑고 새벽 안개', 132: '맑고 아침저녁 흐림', 140: '맑고 때때로 비, 천둥', 160: '맑고 한때 눈이나 비', 170: '맑고 때때로 눈이나 비', 181: '맑다가 눈이나 비',
    200: '흐림', 201: '흐리고 때때로 맑음', 202: '흐리고 한때 비', 203: '흐리고 때때로 비', 204: '흐리고 한때 눈', 205: '흐리고 때때로 눈', 206: '흐리고 한때 비나 눈', 207: '흐리고 때때로 비나 눈', 208: '흐리고 한때 비나 뇌우', 209: '안개',
    210: '흐리다가 때때로 맑음', 211: '흐리다가 맑음', 212: '흐리다가 한때 비', 213: '흐리다가 때때로 비', 214: '흐리다가 비', 215: '흐리다가 한때 눈', 216: '흐리다가 때때로 눈', 217: '흐리다가 눈', 218: '흐리다가 비나 눈', 219: '흐리다가 비나 뇌우',
    220: '흐리고 아침저녁 한때 비', 221: '흐리고 오전 한때 비', 222: '흐리고 저녁 한때 비', 223: '흐리고 낮에 때때로 맑음', 224: '흐리다가 낮부터 비', 225: '흐리다가 저녁부터 비', 226: '흐리다가 밤에 비', 228: '흐리다가 낮부터 눈', 229: '흐리다가 저녁부터 눈', 230: '흐리다가 밤에 눈', 231: '흐리고 해안에 안개',
    240: '흐리고 때때로 비, 천둥', 250: '흐리고 때때로 눈, 천둥', 260: '흐리고 한때 눈이나 비', 270: '흐리고 때때로 눈이나 비', 281: '흐리다가 눈이나 비',
    300: '비', 301: '비, 때때로 맑음', 302: '비, 때때로 그침', 303: '비, 때때로 눈', 304: '비나 눈', 306: '큰비', 308: '비바람 강함', 309: '비, 한때 눈', 311: '비 그친 뒤 맑음', 313: '비 그친 뒤 흐림', 314: '비 뒤 때때로 눈', 315: '비 뒤 눈',
    316: '비나 눈 뒤 맑음', 317: '비나 눈 뒤 흐림', 320: '오전 비 뒤 맑음', 321: '오전 비 뒤 흐림', 322: '비, 아침저녁 한때 눈', 323: '비, 낮부터 맑음', 324: '비, 저녁부터 맑음', 325: '비, 밤에 맑음', 326: '비, 저녁부터 눈', 327: '비, 밤에 눈', 328: '비, 한때 강하게', 329: '비, 한때 진눈깨비',
    340: '눈이나 비', 350: '비, 천둥', 361: '눈이나 비 뒤 맑음', 371: '눈이나 비 뒤 흐림',
    400: '눈', 401: '눈, 때때로 맑음', 402: '눈, 때때로 그침', 403: '눈, 때때로 비', 405: '큰눈', 406: '눈보라', 407: '폭설과 강풍', 409: '눈, 한때 비', 411: '눈 그친 뒤 맑음', 413: '눈 그친 뒤 흐림', 414: '눈 뒤 비', 420: '오전 눈 뒤 맑음', 421: '오전 눈 뒤 흐림', 422: '눈, 낮부터 비', 423: '눈, 저녁부터 비', 425: '눈, 한때 강하게', 426: '눈 뒤 진눈깨비', 427: '눈, 한때 진눈깨비', 450: '눈, 천둥' };
  function wxKo(code) { const c = +code; if (WX[c]) return WX[c]; return ({ 1: '맑음', 2: '흐림', 3: '비', 4: '눈' })[Math.floor(c / 100)] || '—'; }
  function wxIc(code) { const c = +code, a = Math.floor(c / 100), t = wxKo(code); if (a === 3) return 'rain'; if (a === 4) return 'snow'; if (/비|뇌우/.test(t)) return 'rain'; if (/눈/.test(t)) return 'snow'; if (a === 1) return c === 100 ? 'sun' : 'suncloud'; return /맑/.test(t) ? 'suncloud' : 'cloud'; }
  function parseJMA(j) {
    const days = {}; let pops6 = [];
    const day = (iso) => { const k = iso.slice(0, 10); return days[k] || (days[k] = { date: k }); };
    const area = (ts, code) => (ts.areas || []).find((a) => a.area && a.area.code === code);
    const wk = j[1], sh = j[0];
    if (wk && wk.timeSeries) {
      const a = area(wk.timeSeries[0], '130010'), t = area(wk.timeSeries[1] || {}, '44132');
      wk.timeSeries[0].timeDefines.forEach((iso, i) => { const d = day(iso); if (a) { d.code = a.weatherCodes[i]; if (a.pops[i] !== '') d.pop = +a.pops[i]; if (a.reliabilities && a.reliabilities[i]) d.rel = a.reliabilities[i]; } if (t) { if (t.tempsMin[i] !== '') d.min = +t.tempsMin[i]; if (t.tempsMax[i] !== '') d.max = +t.tempsMax[i]; } });
    }
    if (sh && sh.timeSeries) {
      const a = area(sh.timeSeries[0], '130010');
      if (a) sh.timeSeries[0].timeDefines.forEach((iso, i) => { const d = day(iso); d.code = a.weatherCodes[i]; d.ja = (a.weathers[i] || '').replace(/　+/g, ' '); });
      const p = sh.timeSeries[1] && area(sh.timeSeries[1], '130010');
      if (p) { pops6 = sh.timeSeries[1].timeDefines.map((iso, i) => ({ t: iso, pop: p.pops[i] === '' ? null : +p.pops[i] })); const mx = {}; sh.timeSeries[1].timeDefines.forEach((iso, i) => { const k = iso.slice(0, 10); if (p.pops[i] !== '') mx[k] = Math.max(mx[k] == null ? 0 : mx[k], +p.pops[i]); }); Object.keys(mx).forEach((k) => { day(k).pop = mx[k]; }); }
      const t = sh.timeSeries[2] && area(sh.timeSeries[2], '44132');
      if (t) {
        const per = {};
        sh.timeSeries[2].timeDefines.forEach((iso, i) => { const k = iso.slice(0, 10), hh = iso.slice(11, 13); (per[k] = per[k] || {})[hh === '09' ? 'max' : 'min'] = +t.temps[i]; });
        Object.keys(per).forEach((k) => { const d = day(k), v = per[k]; if (v.max != null) d.max = v.max; if (v.min != null && v.min !== v.max) d.min = v.min; else if (v.min != null && v.max == null) d.min = v.min; });
      }
    }
    return { pops6, report: (sh && sh.reportDatetime) || (wk && wk.reportDatetime) || null, days: Object.values(days).sort((x, y) => (x.date < y.date ? -1 : 1)) };
  }
  let wxBusy = false;
  async function refreshWeather(manual) {
    if (wxBusy || !navigator.onLine) { if (manual && !navigator.onLine) toast('인터넷이 연결되면 기상청 예보를 받아요.'); return; }
    wxBusy = true;
    try {
      const r = await fetch(JMA_URL, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
      const w = parseJMA(await r.json()); w.fetchedAt = Date.now(); store.set('weather', w);
      if (manual) toast('기상청 예보를 새로 받았어요.');
    } catch (e) { if (manual) toast('예보를 받지 못했어요. 잠시 뒤 다시 해 보세요.'); }
    wxBusy = false;
    const h = (location.hash || '').replace(/^#\/?/, '');
    if (h === '' || h === 'home' || h === 'weather') rerender(true);
  }
  const NORMAL = { min: 12.8, max: 20.4, label: '10월 하순 평년값' };
  const wd = (iso) => '일월화수목금토'[new Date(iso + 'T00:00:00').getDay()];
  const isTrip = (iso) => { const t = D.trip || {}; return t.startDate && t.endDate && iso >= t.startDate && iso <= t.endDate; };
  function wxRow(d, big) {
    const today = d.date === todayISO();
    return `<li class="wxr ${isTrip(d.date) ? 'trip' : ''} ${today ? 'is-today' : ''}"><span class="wd"><b>${today ? '오늘' : (+d.date.slice(5, 7)) + '/' + (+d.date.slice(8, 10))}</b><small>${wd(d.date)}${isTrip(d.date) ? ' · 여행' : ''}</small></span>
      <span class="wi">${d.code ? ic(wxIc(d.code), big ? 30 : 26, 1.9) : ''}</span>
      <span class="wt"><b>${d.code ? esc(wxKo(d.code)) : '—'}</b>${big && d.ja ? `<small lang="ja">${esc(d.ja)}</small>` : ''}${d.pop != null ? `<small>강수확률 ${d.pop}%</small>` : ''}</span>
      <span class="wtemp">${d.max != null ? `<b>${d.max}°</b>` : '<b>—</b>'}<small>${d.min != null ? d.min + '°' : '—'}</small></span></li>`;
  }
  function wxTip(ds) {
    const tip = [];
    if (ds.some((d) => d.pop != null && d.pop >= 50)) tip.push('비 올 확률이 높은 날이 있어요. 접는 우산을 챙겨요.');
    if (ds.some((d) => d.min != null && d.min <= 14)) tip.push('아침이 쌀쌀한 날이 있어요. 얇은 겉옷을 챙겨요.');
    return tip;
  }
  const SKY = (code) => { const a = Math.floor(+code / 100), t = wxKo(code); if (a >= 3 || /비|눈/.test(t) && a === 2) return 'rain'; if (a === 2) return 'cloud'; return 'clear'; };
  const wIcon = (code, size) => { const k = wxIc(code); return `<span class="wic ${k}">${ic(k, size, 2)}</span>`; };
  function wxNow(w) { const ds = (w && w.days || []).filter((d) => d.date >= todayISO()); return { ds, d0: ds[0] }; }
  function weatherCard() {
    const w = store.get('weather', null);
    const { ds, d0 } = wxNow(w);
    if (!d0) return `<a class="wxcard sky-clear" href="#/weather"><div class="wxtop"><span class="city">도쿄 <i lang="ja">東京</i></span><span class="src">기상청</span></div>
        <div class="wxnow"><span class="wic sun">${ic('sun', 52, 1.8)}</span><div><b class="tmp">${Math.round(NORMAL.max)}°</b><span class="cond">10월 하순 평년 최고 기온</span></div></div>
        <div class="wxf">인터넷이 연결되면 일본 기상청 예보를 받아요 · 평년 최저 ${NORMAL.min}° 최고 ${NORMAL.max}°</div></a>`;
    return `<a class="wxcard sky-${SKY(d0.code)}" href="#/weather"><div class="wxtop"><span class="city">도쿄 <i lang="ja">東京</i></span><span class="src">기상청 예보 ${ic('chevR', 14, 2.4)}</span></div>
      <div class="wxnow">${wIcon(d0.code, 52)}<div><b class="tmp">${d0.max != null ? d0.max + '°' : '—'}</b><span class="cond">${esc(wxKo(d0.code))}</span><span class="hl">${d0.max != null ? '최고 ' + d0.max + '°' : ''}${d0.min != null ? ' · 최저 ' + d0.min + '°' : ''}${d0.pop != null ? ' · 비 ' + d0.pop + '%' : ''}</span></div></div>
      <ul class="wxs">${ds.slice(1, 5).map((d) => `<li class="${isTrip(d.date) ? 'trip' : ''}"><small>${(+d.date.slice(8, 10))}일 ${wd(d.date)}</small>${d.code ? wIcon(d.code, 24) : ''}<b>${d.max != null ? d.max + '°' : '—'}</b><small class="lo">${d.min != null ? d.min + '°' : ''}</small></li>`).join('')}</ul>
      <div class="wxf">${navigator.onLine ? '' : '오프라인 저장본 · '}기상청 발표 ${w.report ? fmtStamp(Date.parse(w.report)) : '—'}</div></a>`;
  }
  function vWeather() {
    const w = store.get('weather', null);
    const { ds, d0 } = wxNow(w);
    const tips = wxTip(ds);
    const tripIn = ds.some((d) => isTrip(d.date));
    const sky = d0 ? SKY(d0.code) : 'clear';
    const lo = Math.min(...ds.map((d) => (d.min != null ? d.min : d.max != null ? d.max - 6 : 99))), hi = Math.max(...ds.map((d) => (d.max != null ? d.max : -99)));
    const bar = (d) => { if (d.max == null || !isFinite(lo) || hi <= lo) return ''; const mn = d.min != null ? d.min : d.max; const L = (mn - lo) / (hi - lo) * 100, R = (d.max - lo) / (hi - lo) * 100; return `<span class="rng"><i style="left:${L}%;width:${Math.max(6, R - L)}%"></i></span>`; };
    const p6 = (w && w.pops6 || []).filter((x) => Date.parse(x.t) + 6 * 3600e3 > Date.now()).slice(0, 6);
    const hh = (iso) => { const d = new Date(iso); return (d.getDate() !== new Date().getDate() ? '내일 ' : '') + d.getHours() + '시'; };
    return `<div class="wxpage sky-${sky}">
      <div class="hd-top" style="padding:16px 20px 0"><a class="back" href="#/home" aria-label="뒤로" style="color:#fff">${ic('chevL', 26, 2)}</a><button class="wxbtn" data-act="wxRefresh">${ic('refresh', 16, 2.2)}새로 받기</button></div>
      <div class="wxhero">
        <span class="city">도쿄 <i lang="ja">東京</i></span>
        ${d0 ? `${wIcon(d0.code, 76)}<b class="tmp">${d0.max != null ? d0.max + '°' : '—'}</b><span class="cond">${esc(wxKo(d0.code))}</span>${d0.ja ? `<span class="ja" lang="ja">${esc(d0.ja)}</span>` : ''}
          <span class="hl">${d0.max != null ? '최고 ' + d0.max + '°' : ''}${d0.min != null ? ' · 최저 ' + d0.min + '°' : ''}</span>`
        : `<span class="wic sun">${ic('sun', 76, 1.8)}</span><b class="tmp">${Math.round(NORMAL.max)}°</b><span class="cond">아직 받은 예보가 없어요</span><span class="hl">10월 하순 평년 최저 ${NORMAL.min}° · 최고 ${NORMAL.max}°</span>`}
      </div>
      <div class="wxbody">
        ${p6.length ? `<section class="glass"><div class="gt">${ic('rain', 16, 2)}6시간 강수확률</div><ul class="p6">${p6.map((x) => `<li><small>${hh(x.t)}</small><span class="drop" style="--p:${x.pop || 0}"></span><b>${x.pop == null ? '—' : x.pop + '%'}</b></li>`).join('')}</ul></section>` : ''}
        ${ds.length ? `<section class="glass"><div class="gt">${ic('calendar', 16, 2)}주간 예보 · 최저 / 최고</div><ul class="wk">${ds.map((d) => `<li class="${isTrip(d.date) ? 'trip' : ''}">
            <span class="wd"><b>${d.date === todayISO() ? '오늘' : wd(d.date)}</b><small>${+d.date.slice(5, 7)}/${+d.date.slice(8, 10)}${isTrip(d.date) ? ' · 여행' : ''}</small></span>
            <span class="wi">${d.code ? wIcon(d.code, 28) : ''}<small>${d.pop != null ? d.pop + '%' : ''}</small></span>
            <span class="lo">${d.min != null ? d.min + '°' : '—'}</span>${bar(d)}<span class="hi">${d.max != null ? d.max + '°' : '—'}</span></li>
            <li class="sub">${d.code ? esc(wxKo(d.code)) : ''}${d.rel ? ` · 신뢰도 ${esc(d.rel)}` : ''}</li>`).join('')}</ul></section>` : ''}
        ${ds.length && !tripIn ? `<div class="gnote">여행 날짜(10/19~23)는 기상청 주간예보(7일)에 들어오면 노란 표시로 떠요. 출발 일주일 전쯤부터 보여요.</div>` : ''}
        ${tips.length ? `<section class="glass"><div class="gt">${ic('bag', 16, 2)}예보로 본 준비물</div><ul class="gl2">${tips.map((t) => `<li>${t}</li>`).join('')}</ul></section>` : ''}
        <section class="glass"><div class="gt">${ic('clock', 16, 2)}10월 하순 평년값 · 도쿄</div><div class="nm"><span><small>최저</small><b>${NORMAL.min}°</b></span><span><small>최고</small><b>${NORMAL.max}°</b></span><span><small>강수량</small><b>61.3mm</b></span></div><div class="gnote" style="padding:6px 0 0">1991~2020년 평균 (기상청)</div></section>
        <div class="gnote">${w ? `기상청 발표 ${w.report ? fmtStamp(Date.parse(w.report)) : '—'} · 받은 시각 ${fmtStamp(w.fetchedAt)}${navigator.onLine ? '' : ' · 오프라인 저장본'}<br>` : ''}예보 지역: 도쿄 지방, 기온: 도쿄 관측소. 날씨 이름은 기상청 코드를 한국어로 옮겼어요. 나리타(지바현)는 조금 다를 수 있어요.<br>출처: <a href="${JMA_PAGE}" target="_blank" rel="noopener">気象庁ホームページ</a></div>
      </div></div>`;
  }
  function vNotices() {
    const items = D.notices.items;
    return header('공지', 'お知らせ', '#/home') + `<div class="body">${noticeMeta()}${items.length ? items.map((n) =>
      `<section class="card ${n.pinned ? 'card-soft' : 'card-line'}" style="gap:6px">${n.pinned ? '<div class="kicker" style="color:var(--ginkgo-deep)">고정</div>' : ''}
        <div style="font-size:17px;font-weight:700">${val(n.title)}</div>${n.body ? `<div style="font-size:15px;line-height:22px">${val(n.body)}</div>` : ''}${n.date ? `<div class="small muted">${esc(n.date)}</div>` : ''}</section>`).join('')
      : slot('공지', '아직 받은 공지가 없어요', '인터넷에 연결되면 새 공지를 받아 와요.', null, 'flag')}</div>`;
  }

  /* ================= 화면: 일정 ================= */
  const TYPE_IC = { '이동': 'train', '관람': 'eye', '식사': 'food', '집결': 'flag', '자유시간': 'walk' };
  function vSchedule(dayArg) {
    const days = D.schedule.days;
    if (dayArg != null && days[+dayArg]) { ui.day = +dayArg; ui.dayPicked = true; }
    if (!ui.dayPicked) { const t = days.findIndex((x) => x.date === todayISO()); if (t >= 0) ui.day = t; }
    if (days.length && ui.day >= days.length) ui.day = 0;
    if (!days.length) {
      const ph = ['1일차', '2일차', '3일차']; if (ui.day >= ph.length) ui.day = 0;
      return header('일정', '予定') + `<div class="days" role="group" aria-label="날짜">${ph.map((l, i) => `<button class="day" type="button" aria-pressed="${i === ui.day}" data-act="day" data-i="${i}"><b>${l}</b><span>[날짜]</span></button>`).join('')}</div>
        <div class="body gap-20" id="swipe">${slot(ph[ui.day] + ' 일정', ph[ui.day] + ' 일정이 아직 공개되지 않았어요', '공개되면 이 날짜의 일정이 시각 순서로 채워져요. 옆으로 밀면 다음 날짜로 가요.', [['09:00', '이동', '일정 제목', '장소'], ['12:00', '식사', '일정 제목', '장소'], ['14:00', '집결', '집결 장소']], 'calendar')}
        <div style="display:flex;flex-direction:column;gap:8px"><div class="kicker">일정 종류</div><div class="types">${Object.keys(TYPE_IC).map((t) => `<span class="type ${t === '자유시간' ? 'free' : ''}" style="${t === '집결' ? 'background:var(--shu);color:#fff' : ''}">${ic(TYPE_IC[t], 16)}${t}</span>`).join('')}</div></div></div>`;
    }
    const d = days[ui.day];
    const nn = nowNext();
    const list = (d.items || []).length ? d.items.map((it, ii) => {
      const isNow = nn.cur && nn.cur.di === ui.day && nn.cur.ii === ii;
      let isPast = false;
      if (!isNow && d.date && /^\d{1,2}:\d{2}$/.test(it.time || '')) { const at = new Date(d.date + 'T' + it.time.padStart(5, '0') + ':00'); isPast = at < Date.now(); }
      const p = it.placeId ? placeById(it.placeId) : null;
      const href = p ? `#/place/${encodeURIComponent(p.id)}` : null;
      const tag = href ? 'a' : 'div';
      const meet = it.type === '집결';
      return `<${tag} class="item ${meet ? 'meet' : ''} ${isNow ? 'now' : ''} ${isPast ? 'past' : ''}" ${href ? `href="${href}"` : ''} ${isNow ? 'aria-current="true"' : ''}>
        <div class="t">${has(it.time) ? val(it.time) : `<span class="seq" aria-label="${ii + 1}번째">${ii + 1}</span>`}</div>
        <div class="c"><span class="tagrow">${isNow ? '<span class="nowtag">지금</span>' : ''}<span class="type ${it.type === '자유시간' ? 'free' : ''}">${ic(TYPE_IC[it.type] || 'calendar', 14, 2)}${esc(it.type || '일정')}</span></span>
          <span class="ti">${val(it.title)}</span>
          ${p || it.place ? `<span class="sub">${ic('pin', 16)}${p ? esc(p.name_ko) + ' <span lang="ja">' + esc(p.name_ja || '') + '</span>' : val(it.place)}</span>` : ''}
          ${it.memo ? `<span class="sub">${val(it.memo)}</span>` : ''}</div>${href ? ic('chevR', 20) : ''}</${tag}>`;
    }).join('') : slot(d.label || '이날', '이날 일정이 아직 없어요', '일정이 확정되면 여기에 시각 순서로 나와요.', null, 'calendar');
    return header('일정', '予定') + `<div class="days" role="group" aria-label="날짜">${days.map((x, i) => `<button class="day" type="button" aria-pressed="${i === ui.day}" data-act="day" data-i="${i}"><b>${esc(x.label || (i + 1) + '일차')}</b><span>${fmtDate(x.date) || '[날짜]'}</span></button>`).join('')}</div>
      <div class="body gap-12" id="swipe">${d.region || d.meals ? `<section class="dayinfo">${d.region ? `<div>${ic('pin', 18, 2)}<span class="kicker">지역</span><b>${val(d.region)}</b></div>` : ''}${d.meals ? `<div>${ic('food', 18, 2)}<span class="kicker">식사</span><b>${['조', '중', '석'].map((k) => `${k} ${val(d.meals[k])}`).join(' · ')}</b></div>` : ''}</section>` : ''}
        <div class="small muted">항목을 누르면 그 장소로 가요. 집결은 붉은 칸이에요. 옆으로 밀면 다음 날짜.${D.schedule.days.some((x) => x.items.some((i) => !i.time)) ? ' 시각은 학교에서 정해지면 들어가요.' : ''}</div>${list}</div>`;
  }

  /* ================= 화면: 장소 ================= */
  function viewSwitch(active) {
    return `<nav class="switch" aria-label="보기 방식"><a href="#/places" ${active === 0 ? 'aria-current="page"' : ''}>${ic('list', 18)}목록</a><a href="#/map" ${active === 1 ? 'aria-current="page"' : ''}>${ic('map', 18)}지도</a></nav>`;
  }
  function placeCats() { const s = []; (D.places || []).forEach((p) => { if (p.category && !s.includes(p.category)) s.push(p.category); }); return ['전체'].concat(s); }
  function vPlaces() {
    const cats = placeCats(); if (D.places.length && ui.placeCat >= cats.length) ui.placeCat = 0;
    const cat = cats[ui.placeCat];
    const list = (D.places || []).filter((p) => cat === '전체' || p.category === cat);
    const body = !D.places.length
      ? slot('장소 목록', ui.placeCat ? `‘${['전체', '절·신사', '거리', '전망', '박물관', '공원'][ui.placeCat]}’ 장소가 아직 없어요` : '아직 등록된 장소가 없어요', '장소가 들어오면 사진, 한글 이름, 일본어 이름, 한 줄 소개가 카드로 쌓여요. 위 분류로 걸러 볼 수 있어요.', [['사진', '한글 이름', '日本語名'], ['한 줄 소개']], 'pin')
      : list.map((p) => `<a class="pcard ${p.photo ? 'big' : ''}" href="#/place/${encodeURIComponent(p.id)}">${p.photo ? `<div class="pthumb">${photo(p.photo, p.name_ko || '사진')}${badge(p, 40)}${placeDays(p) ? `<span class="pdays">${esc(placeDays(p))}</span>` : ''}</div>` : badge(p, 64)}
          <div class="c">${p.category ? `<span class="kicker">${esc(p.category)}</span>` : ''}<span class="ko">${val(p.name_ko)}</span>
          <span class="ja" lang="ja">${esc(p.name_ja || '')}</span><span class="small muted">${val(p.intro)}</span></div></a>`).join('');
    const PH = ['전체', '절·신사', '거리', '전망', '박물관', '공원'];
    if (!D.places.length && ui.placeCat >= PH.length) ui.placeCat = 0;
    const cchips = D.places.length ? chips(cats, ui.placeCat, 'placeCat') : chips(PH, ui.placeCat, 'placeCat');
    return header('장소', '場所', null, viewSwitch(0)) + cchips + `<div class="body gap-12" style="padding-top:16px">${body}</div>`;
  }
  function inforow(icn, label, v) {
    return `<div class="inforow">${ic(icn, 22)}<div class="c"><span class="kicker">${label}</span><span class="v">${val(v)}</span></div></div>`;
  }
  // 볼거리·먹을 곳·가게 한 줄: 이름(일본어) / 어디 / 설명
  const dish = (k) => (D.dishes || {})[k];
  function glist(list, opt = {}) {
    return `<ul class="glist">${list.map((x) => { const d = x.dish && dish(x.dish);
      return `<li>${d ? `<figure class="dthumb"><img src="${esc(d.src)}" alt="${esc(d.name)} 예시 사진" loading="lazy"><figcaption>${esc(d.name)}</figcaption></figure>` : ''}${x.star ? `<span class="star" aria-label="추천">${ic('star', 16, 2)}</span>` : ''}<div class="gl">
      <b>${esc(x.name)}${x.ja ? ` <span lang="ja">${esc(x.ja)}</span>` : ''}</b>${x.where ? `<span class="where">${ic('pin', 14, 2)}${val(x.where)}</span>` : ''}
      ${x.desc ? `<span class="d">${val(x.desc)}</span>` : ''}${x.note ? `<span class="note">${ic('alert', 14, 2)}${val(x.note)}</span>` : ''}
      ${x.url && opt.links ? `<a class="src" href="${esc(x.url)}" target="_blank" rel="noopener">공식 페이지 (인터넷 필요)</a>` : ''}</div></li>`; }).join('')}</ul>`;
  }
  function placeTabs(p) {
    const t = [['all', '한눈에']];
    if (p.sights && p.sights.length) t.push(['sights', '볼거리']);
    if (p.food && p.food.length) t.push(['food', '먹을 곳']);
    if (p.shops && p.shops.length) t.push(['shops', '스포츠 용품']);
    if (p.rules && p.rules.length) t.push(['rules', '안전·규칙']);
    return t;
  }
  function vPlace(id) {
    const p = placeById(decodeURIComponent(id || ''));
    if (!p) return header('장소', '場所', '#/places') + `<div class="body">${slot('장소', '이 장소 정보가 아직 없어요', '장소 목록으로 돌아가 다른 장소를 골라 주세요.', null, 'pin')}</div>`;
    if (ui.ptabFor !== p.id) { ui.ptabFor = p.id; ui.ptab = 0; }
    const tabs = placeTabs(p); if (ui.ptab >= tabs.length) ui.ptab = 0;
    const cur = tabs[ui.ptab][0];
    const days = D.schedule.days;
    const dayPills = (p.days || []).map((n) => { const i = days.findIndex((d) => d.label === n + '일차'); return i >= 0 ? `<a class="pill" href="#/schedule/${i}">${ic('calendar', 14, 2)}${esc(days[i].label)} · ${fmtDate(days[i].date) || ''}</a>` : ''; }).join('');
    const bullets = (list) => `<ul class="blist">${list.map((t) => `<li>${val(t)}</li>`).join('')}</ul>`;
    let body = '';
    if (cur === 'all') {
      const pts = (p.points && p.points.length) ? p.points.map((t, i) => `<li><span class="n">${i + 1}</span><span>${val(t)}</span></li>`).join('') : `<li>${NEED}</li>`;
      const rows = [['clock', '예상 체류 시간', p.stay], ['train', '가는 법', p.access], ['calendar', '운영 시간', p.hours], ['yen', '비용', p.fee]].filter((r) => has(r[2])).map((r) => inforow(r[0], r[1], r[2])).join('');
      const rel = (p.related || []).map(placeById).filter(Boolean);
      body = `<section class="points"><div class="kicker" style="color:var(--ginkgo-deep)">꼭 볼 것</div><ol class="plist">${pts}</ol></section>
        ${has(p.description) ? `<p class="lead">${val(p.description)}</p>` : ''}
        ${rows ? `<div>${rows}</div>` : ''}
        ${p.changes && p.changes.length ? `<section class="card card-soft" style="gap:8px"><div class="kicker" style="color:var(--ginkgo-deep);display:flex;gap:6px;align-items:center">${ic('flag', 16, 2)}최근에 바뀐 것${p.checkedAt ? ` · ${fmtDate(p.checkedAt)} 조사` : ''}</div>${bullets(p.changes)}</section>` : ''}
        ${rel.length ? `<div style="display:flex;flex-direction:column;gap:8px"><div class="kicker">같이 보기</div>${rel.map((r) => `<a class="pcard" href="#/place/${encodeURIComponent(r.id)}"><div class="c"><span class="ko">${esc(r.name_ko)}</span><span class="ja" lang="ja">${esc(r.name_ja || '')}</span></div>${ic('chevR', 20)}</a>`).join('')}</div>` : ''}
        ${p.sources && p.sources.length ? `<details class="srcs"><summary>출처 ${p.sources.length}곳 보기 · 출발 전에 한 번 더 확인해요</summary><ul>${p.sources.map((x) => `<li><a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a></li>`).join('')}${p.photoCredit ? `<li>사진: <a href="${esc(p.photoCredit.page)}" target="_blank" rel="noopener">Wikimedia Commons · ${esc(p.photoCredit.author)} · ${esc(p.photoCredit.license)}</a> (크기만 줄임)</li>` : ''}</ul></details>` : ''}`;
    } else if (cur === 'sights') body = glist(p.sights);
    else if (cur === 'food') body = `${glist(p.food)}<div class="small muted">음식 사진은 그 가게가 아니라 음식 종류를 보여주는 예시예요. 영업시간·가격은 바뀔 수 있어요.</div>${dishCredits(p.food)}`;
    else if (cur === 'shops') body = `${glist(p.shops, { links: true })}<div class="small muted">★는 조사한 친구의 추천이에요. 영업시간은 바뀔 수 있어요.</div>`;
    else if (cur === 'rules') body = `<section class="card card-shu" style="gap:8px"><div class="kicker" style="color:var(--shu);display:flex;gap:6px;align-items:center">${ic('alert', 16, 2)}꼭 지켜요</div>${bullets(p.rules)}</section>`;
    const next = tabs[ui.ptab + 1];
    return `<header class="hd" style="padding-bottom:0"><div class="hd-top"><a class="back" href="#/places" aria-label="뒤로">${ic('chevL', 26, 2)}</a>${p.category ? `<span class="pill">${esc(p.category)}</span>` : ''}</div>
        ${p.photo ? `<figure class="hero"><img src="${esc(p.photo)}" alt="${esc(p.name_ko)} 사진">${badge(p, 44)}</figure>${credit(p)}` : ''}
        <div class="ptitle"><span class="kicker" lang="ja">${esc(p.name_ja || '')}</span><h1 class="h1">${val(p.name_ko)}</h1>
          ${dayPills ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${dayPills}</div>` : ''}<p>${val(p.intro)}</p></div>
        <div class="pact"><a class="btn btn-ink" href="#/show/${encodeURIComponent(p.id)}">${ic('chat', 22, 2)}일본어로 보여주기</a>${hasPos(p) ? `<a class="btn btn-quiet" href="#/map/${encodeURIComponent(p.id)}" aria-label="지도에서 보기">${ic('map', 22, 2)}지도</a>` : ''}</div></header>
      ${tabs.length > 1 ? `<div class="ptabs">${chips(tabs.map((t) => t[1]), ui.ptab, 'ptab')}</div>` : ''}
      <div class="body gap-20" style="padding-top:16px">${body}
        ${next ? `<button type="button" class="btn btn-quiet" data-act="ptab" data-i="${ui.ptab + 1}">다음: ${esc(next[1])} ${ic('chevR', 20, 2)}</button>` : ''}</div>`;
  }
  function vShow(id) {
    const p = placeById(decodeURIComponent(id || ''));
    if (!p) return vPlaces();
    return `<section class="full"><div class="hd-top"><a class="back" href="#/place/${encodeURIComponent(p.id)}" aria-label="닫기">${ic('chevL', 28, 2)}</a><span class="small muted" style="font-weight:700">상대에게 보여 주세요</span></div>
      <div class="bar" style="background:var(--ink)"></div>
      <div class="j1" lang="ja">${esc(p.name_ja || '')}</div>
      ${p.yomi ? `<div lang="ja" style="font-size:20px;color:var(--slate-deep)">${esc(p.yomi)}</div>` : ''}
      <div class="j2" lang="ja">ここへ行きたいです。</div>
      <div class="foot" style="padding-top:16px;border-top:1px solid var(--line)"><span style="font-size:17px">${esc(p.name_ko || '')}에 가고 싶어요.</span><span class="small muted">코코에 이키타이데스</span></div></section>`;
  }
  const CAT_IC = { '공항': 'plane', '공원·바다': 'wave', '쇼핑': 'bag', '거리': 'bolt', '체험': 'film', '테마파크': 'castle', '절': 'temple' };
  const placeIc = (p) => (p && (p.icon && ICONS[p.icon] ? p.icon : CAT_IC[p.category])) || 'pin';
  const badge = (p, size = 48) => `<span class="badge" style="width:${size}px;height:${size}px">${ic(placeIc(p), Math.round(size * 0.52), 2)}</span>`;
  const credit = (p) => { const c = p.photoCredit; if (!c) return ''; return `<div class="credit">${c.caption ? esc(c.caption) + ' · ' : ''}사진 <a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.author)}</a> · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a></div>`; };
  const hasPos = (p) => p && ((p.lat != null && p.lng != null) || (p.map && p.map.x != null && p.map.y != null));
  function vMap(sel) {
    if (sel) { ui.mapSel = decodeURIComponent(sel); ui.mapAuto = true; }
    const ms = MAPS();
    if (ui.mapIdx >= ms.length) ui.mapIdx = 0;
    return header('장소', '場所', null, viewSwitch(1)) + `<div id="mapzone"><div class="msearch">${ic('search', 20, 2.2)}<input id="mq" type="search" data-input="mapq" placeholder="장소·역 검색 (예: 아키하바라, 新宿)" autocomplete="off" enterkeyhint="search" aria-label="장소나 역 이름 검색"><ul id="mres" class="mres" hidden></ul></div>${ms.length > 1 ? `<div style="margin-top:4px">${chips(ms.map((m) => m.name), ui.mapIdx, 'mapPick')}</div>` : ''}<div class="mapwrap"><div id="map" aria-label="${esc(ms[ui.mapIdx].name)} 지도. 두 손가락으로 벌리면 확대돼요."></div>
        <div class="maptools"><button type="button" class="mapbtn" data-act="zoomIn" aria-label="확대">+</button><button type="button" class="mapbtn" data-act="zoomOut" aria-label="축소">−</button>
        <button type="button" class="mapbtn" data-act="locate" aria-label="내 위치 보기">${ic('compass', 26, 2)}</button></div>
        <div class="mapattr" id="mapattr"></div>
        <div class="stopsheet" id="stopsheet" hidden></div></div>
      <div class="body" style="padding-top:16px" id="mapcard">${mapCard()}</div></div>`;
  }
  function placeDays(p) {
    const days = D.schedule.days;
    return (p.days || []).map((n) => { const d = days.find((x) => x.label === n + '일차'); return d ? `${d.label} ${fmtDate(d.date) || ''}` : ''; }).filter(Boolean).join(' · ');
  }
  function mapCard() {
    const places = D.places || [];
    const off = places.filter((p) => !hasPos(p));
    const cur = MAPCACHE[ui.mapIdx];
    const here = places.filter((p) => hasPos(p) && (!cur || inMap(p, cur)));
    const row = (p, act) => `<li><button type="button" class="stoprow ${p.id === ui.mapSel ? 'on' : ''}" ${act}>${badge(p, 44)}<span class="c"><b>${esc(p.short || p.name_ko)}</b><small>${esc(placeDays(p) || p.category || '')}</small></span>${ic('chevR', 20)}</button></li>`;
    let h = `<div class="small muted">${ic('pin', 14, 2)} 지도 위 아이콘을 누르면 그 장소로 확대되고 정보 카드가 떠요. '외 2곳'처럼 묶인 아이콘은 누르면 펼쳐져요. 아래 목록을 눌러도 돼요.</div>`;
    if (!places.length) return h + slot('가이드북 장소', '지도에 찍을 장소가 아직 없어요', '장소가 정해지면 아이콘으로 표시돼요.', null, 'pin');
    h += `<div class="sec-title" style="padding:0;margin:4px 0 0"><h2 class="h2">${esc(MAPS()[ui.mapIdx].name)} 지도의 장소</h2><span class="kicker">${here.length}곳</span></div>
      <ul class="stoplist">${here.map((p) => row(p, `data-act="pickStop" data-id="${esc(p.id)}"`)).join('')}</ul>`;
    MAPS().forEach((m, j) => {
      if (j === ui.mapIdx || !MAPCACHE[j]) return;
      const there = places.filter((p) => inMap(p, MAPCACHE[j]) && !inMap(p, cur));
      if (there.length) h += `<div class="kicker" style="margin-top:8px">${esc(m.name)} 지도에 있어요 · 누르면 지도가 바뀌어요</div><ul class="stoplist">${there.map((p) => row(p, `data-act="goStop" data-id="${esc(p.id)}"`)).join('')}</ul>`;
    });
    if (off.length) h += `<div class="small muted">지도 위치가 아직 없는 장소: ${off.map((p) => `<a href="#/place/${encodeURIComponent(p.id)}">${esc(p.name_ko || p.id)}</a>`).join(', ')}</div>`;
    h += `<div class="small muted">나침반 버튼은 GPS로 내 위치를 보여 줘요 (인터넷 없이도 돼요).</div>`;
    return h;
  }
  function sheetHTML(p, spin) {
    const ms = (D.missions && D.missions.place || []).find((m) => m.placeId === p.id);
    const got = ms && store.get('missions', {})[ms.id];
    const fact = (icn, label, v) => has(v) ? `<div class="fact">${ic(icn, 18, 2)}<span><small>${label}</small>${val(v)}</span></div>` : '';
    return `<button type="button" class="sx" data-act="closeStop" aria-label="닫기">${ic('close', 22, 2.2)}</button>
      <div class="sh-top"><div class="disc ${spin ? 'spin' : ''} ${got ? 'got' : ''} ${p.photo ? 'ph' : ''}">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : ic(placeIc(p), 34, 2)}${p.photo ? `<span class="mini">${ic(got ? 'check' : placeIc(p), 16, 2.2)}</span>` : ''}</div>
        <div class="sh-name"><span class="kicker" lang="ja">${esc(p.name_ja || '')}</span><b>${esc(p.name_ko)}</b><small>${esc(placeDays(p))}</small></div></div>
      <p class="sh-intro">${val(p.intro)}</p>${p.photoCredit ? `<div class="credit" style="margin-top:-4px">사진 ${esc(p.photoCredit.author)} · ${esc(p.photoCredit.license)}</div>` : ''}
      ${fact('train', '가는 법', p.access)}${fact('clock', '시간', p.hours)}
      ${ms ? `<div class="mis ${got ? 'got' : ''}"><span><small>미션</small>${val(ms.title)}</span><button type="button" class="btn btn-sm ${got ? 'btn-quiet' : 'btn-primary'} btn-auto" data-act="stamp" data-id="${esc(ms.id)}">${got ? ic('check', 18, 2.4) + '도장 받음' : '도장 받기'}</button></div>` : ''}
      ${navBox()}<button type="button" class="btn btn-quiet btn-sm" data-act="navPlace" data-id="${esc(p.id)}">${ic('arrow', 18, 2.2)}내 위치에서 방향 보기</button>
      <div class="sh-btns"><a class="btn btn-ink btn-sm" href="#/place/${encodeURIComponent(p.id)}">자세히 보기</a><a class="btn btn-quiet btn-sm" href="#/show/${encodeURIComponent(p.id)}">일본어로</a></div>`;
  }
  let MAP = null, MAPS_TRIED = false, meMarker = null, placeMarkers = {};
  const MAPCACHE = [];
  // 지도 여러 장: trip.json의 map.maps로 바꿀 수 있음
  const MAPS = () => (D.trip.map && D.trip.map.maps) || [
    { name: '도쿄', data: (D.trip.map && D.trip.map.data) || 'data/map/tokyo.json' },
    { name: '나리타', data: 'data/map/narita.json' }];
  const inMap = (p, data) => { if (!p || !data || p.lat == null || p.lng == null) return false; const [[s, w], [n, e]] = data.bounds; return p.lat >= s && p.lat <= n && p.lng >= w && p.lng <= e; };
  async function loadAllMaps() {
    if (!MAPS_TRIED) {
      MAPS_TRIED = true;
      await Promise.all(MAPS().map(async (m, j) => { try { MAPCACHE[j] = await getJSON(m.data); } catch (e) { MAPCACHE[j] = null; } }));
    }
    return MAPCACHE;
  }
  async function loadMapData() { await loadAllMaps(); return MAPCACHE[ui.mapIdx] || null; }
  function mapEmptyHTML() {
    const places = D.places || [];
    return `<div class="body"><section class="mapempty">${ic('map', 40, 1.6)}<div style="font-size:17px;font-weight:700;color:var(--ink)">지도 데이터가 아직 없어요</div>
      <div style="font-size:15px;line-height:22px">오프라인 지도가 들어오면 여기에서 확대해 볼 수 있어요. 지금은 아래 목록으로 장소를 찾을 수 있어요.</div></section>
      <div class="sec-title"><h2 class="h2">지도 없이 보기</h2><span class="kicker" lang="ja">一覧</span></div>
      ${places.length ? places.map((p) => `<a class="pcard" href="#/place/${encodeURIComponent(p.id)}"><div class="c"><span class="ko">${val(p.name_ko)}</span><span class="ja" lang="ja">${esc(p.name_ja || '')}</span></div></a>`).join('')
        : slot('장소', '등록된 장소가 없어요', '장소가 들어오면 여기에 나와요.', null, 'pin')}</div>`;
  }
  function destroyMap() { if (NAVWATCH != null && navigator.geolocation) { navigator.geolocation.clearWatch(NAVWATCH); NAVWATCH = null; } navLine = null; targetMarker = null; if (MAP) { try { MAP.stop(); MAP.off(); MAP.eachLayer((l) => { if (l.off) l.off(); }); MAP.remove(); } catch (e) { /* 지우는 중 오류는 무시 */ } MAP = null; } meMarker = null; placeMarkers = {}; }
  const pmIcon = (n, on, cls = '') => L.divIcon({ className: '', html: `<div class="pm ${on ? 'on' : ''} ${cls}">${n}</div>`, iconSize: [44, 44], iconAnchor: [22, 22] });
  const stopIcon = (p, on, n = 1, nolabel = false) => L.divIcon({ className: '', html: `<div class="stop ${on ? 'on' : ''} ${nolabel && !on ? 'nolabel' : ''}"><span class="ring"></span><span class="disc">${ic(placeIc(p), 26, 2)}${n > 1 ? `<span class="cnt">+${n - 1}</span>` : ''}</span><span class="tail"></span><span class="nm">${esc(p.short || p.name_ko)}${n > 1 ? ` 외 ${n - 1}곳` : ''}</span></div>`, iconSize: [64, 70], iconAnchor: [32, 62] });
  // 가까이 붙은 아이콘은 하나로 묶어 보여 줌 (누르면 그 근처로 확대)
  let grpOf = {};
  function refreshStops() {
    const ids = Object.keys(placeMarkers); if (!MAP || !ids.length) return;
    const order = ids.slice().sort((a, b) => (b === ui.mapSel) - (a === ui.mapSel));
    const pos = {}; ids.forEach((id) => { pos[id] = MAP.latLngToContainerPoint(placeMarkers[id].getLatLng()); });
    const done = new Set(); grpOf = {};
    order.forEach((id) => { if (done.has(id)) return; const g = order.filter((o) => !done.has(o) && Math.abs(pos[o].x - pos[id].x) < 72 && Math.abs(pos[o].y - pos[id].y) < 58); g.forEach((o) => done.add(o)); grpOf[id] = g; });
    // 이름표가 바로 아래 아이콘에 가리면 이름표만 숨김 (확대하면 다시 보임)
    const leads = Object.keys(grpOf);
    const hidden = new Set(leads.filter((a) => leads.some((b) => b !== a && pos[b].y - pos[a].y > 0 && pos[b].y - pos[a].y < 96 && Math.abs(pos[b].x - pos[a].x) < 80)));
    ids.forEach((id) => {
      const m = placeMarkers[id], lead = !!grpOf[id];
      m.setIcon(stopIcon(placeById(id), id === ui.mapSel, lead ? grpOf[id].length : 1, hidden.has(id)));
      const el = m.getElement(); if (el) el.style.display = lead ? '' : 'none';
      m.setZIndexOffset(id === ui.mapSel ? 2000 : 1000);
    });
  }
  function showSheet(p, spin) {
    const sh = document.getElementById('stopsheet'); if (!sh) return;
    if (!p) { sh.hidden = true; sh.innerHTML = ''; return; }
    sh.innerHTML = sheetHTML(p, spin); sh.hidden = false; sh.scrollTop = 0;
  }
  function selectPlace(id, fly = true) {
    ui.mapSel = id;
    const p = placeById(id);
    if (ui.navTarget && (!p || ui.navTarget.name !== p.name_ko)) stopNav();
    if (targetMarker && p) { targetMarker.remove(); targetMarker = null; ui.searchTarget = null; }
    refreshStops();
    const c = document.getElementById('mapcard'); if (c) c.innerHTML = mapCard();
    if (!p || !MAP || !placeMarkers[id]) { showSheet(null); return; }
    showSheet(p, true);
    if (fly) {
      // 카드에 가리지 않게 지도 위쪽에 오도록 살짝 아래로 중심을 잡음
      const z = Math.max(MAP.getZoom(), 15.5), H = MAP.getSize().y;
      const pt = MAP.project([p.lat, p.lng], z).add([0, H * 0.24]);
      MAP.flyTo(MAP.unproject(pt, z), z, { duration: 0.8 });
    }
  }
  function closeStop() {
    ui.mapSel = null; showSheet(null);
    if (targetMarker) { targetMarker.remove(); targetMarker = null; } if (navLine) { navLine.remove(); navLine = null; }
    stopNav(); ui.searchTarget = null;
    refreshStops();
    const c = document.getElementById('mapcard'); if (c) c.innerHTML = mapCard();
  }
  async function initMap() {
    const el = document.getElementById('map');
    if (!el) return;
    // Leaflet 1.9: 지도를 지운 뒤 남은 그리기 예약이 실행되면 오류가 나서 막아 둠
    if (window.L && L.Canvas && !L.Canvas.prototype._yahoSafe) { const r = L.Canvas.prototype._redraw; L.Canvas.prototype._redraw = function () { if (this._ctx) r.call(this); }; L.Canvas.prototype._yahoSafe = true; }
    await loadAllMaps();
    if (ui.mapAuto) {
      ui.mapAuto = false;
      const sp = (D.places || []).find((p) => p.id === ui.mapSel);
      const j = MAPCACHE.findIndex((m) => inMap(sp, m));
      if (j >= 0 && j !== ui.mapIdx) { ui.mapIdx = j; rerender(true); return; }
    }
    const data = await loadMapData();
    if (!document.getElementById('map')) return;
    const mc0 = document.getElementById('mapcard'); if (mc0) mc0.innerHTML = mapCard();
    const img = D.trip.map && D.trip.map.image;
    if (!window.L || (!data && !img)) { const z = document.getElementById('mapzone'); if (z) z.innerHTML = mapEmptyHTML(); return; }
    destroyMap();
    const places = D.places || [];
    let toLL;
    if (data) {
      const bounds = L.latLngBounds(data.bounds);
      MAP = L.map(el, { zoomControl: false, attributionControl: false, preferCanvas: true, minZoom: (data.minZoom || 11) - 1, maxZoom: 18, zoomSnap: 0.5, maxBounds: bounds.pad(0.05), maxBoundsViscosity: 0.8 });
      drawVector(data);
      document.getElementById('mapattr').textContent = data.attribution || '© OpenStreetMap contributors';
      toLL = (p) => (p.lat != null && p.lng != null ? [p.lat, p.lng] : null);
      const inThis = places.filter((p) => inMap(p, data));
      if (inThis.length > 1) MAP.fitBounds(L.latLngBounds(inThis.map(toLL)), { paddingTopLeft: [60, 70], paddingBottomRight: [80, 50], maxZoom: 14 });
      if (MAP.getZoom() < 10.5) MAP.setZoom(10.5, { animate: false });
      else MAP.setView(data.center || bounds.getCenter(), data.zoom || 12);
      MAP.on('click', () => { if (ui.mapSel) closeStop(); });
    } else {
      const im = new Image(); im.src = img;
      await new Promise((r) => { im.onload = r; im.onerror = r; });
      const w = im.naturalWidth || 1000, h = im.naturalHeight || 1000;
      MAP = L.map(el, { crs: L.CRS.Simple, zoomControl: false, attributionControl: false, minZoom: -3, maxZoom: 3, zoomSnap: 0.25 });
      const bb = [[0, 0], [h, w]]; L.imageOverlay(img, bb).addTo(MAP); MAP.fitBounds(bb); MAP.setMaxBounds(L.latLngBounds(bb).pad(0.2));
      document.getElementById('mapattr').textContent = (D.trip.map && D.trip.map.attribution) || '';
      toLL = (p) => (p.map && p.map.x != null ? [h * (1 - p.map.y / 100), w * p.map.x / 100] : null);
    }
    places.forEach((p) => {
      const ll = toLL(p); if (!ll) return;
      if (data && !inMap(p, data)) return;
      const m = L.marker(ll, { icon: stopIcon(p, false), keyboard: true, title: p.name_ko || '', zIndexOffset: 1000 }).addTo(MAP);
      m.on('click', () => {
        const g = grpOf[p.id];
        if (g && g.length > 1) {
          // 묶인 장소들이 서로 떨어져 보일 때까지 필요한 만큼 확대
          const lls = g.map((i) => toLL(placeById(i)));
          let z = Math.ceil(MAP.getZoom()) + 1;
          const apart = (zz) => lls.every((a, i) => lls.every((b, j) => { if (i >= j) return true; const pa = MAP.project(a, zz), pb = MAP.project(b, zz); return Math.abs(pa.x - pb.x) >= 80 || Math.abs(pa.y - pb.y) >= 70; }));
          while (z < 18 && !apart(z)) z++;
          MAP.flyTo(L.latLngBounds(lls).getCenter(), z, { duration: 0.8 });
        }
        else selectPlace(p.id);
      });
      placeMarkers[p.id] = m;
    });
    if (data) { MAP.on('zoomend', refreshStops); refreshStops(); }
    const mc = document.getElementById('mapcard'); if (mc) mc.innerHTML = mapCard();
    if (ui.mapSel && placeMarkers[ui.mapSel]) setTimeout(() => { selectPlace(ui.mapSel); if (ui.navTarget) startNav(ui.navTarget); }, 250);
    else if (ui.searchTarget && data && inMap(ui.searchTarget, data)) setTimeout(() => { showTarget(ui.searchTarget); if (ui.navTarget) startNav(ui.navTarget); }, 250);
    const h = D.trip.hotel || {};
    if (data && inMap(h, data)) L.marker([h.lat, h.lng], { icon: pmIcon(ic('bed', 22, 2), false, 'hotel'), title: '숙소', zIndexOffset: 900 }).addTo(MAP).on('click', () => { location.hash = '#/help/hotel'; });
  }

  /* 벡터 지도 그리기: data/map/tokyo.json (OpenStreetMap 데이터를 가공한 파일) */
  const MAPSTYLE = {
    land: { fill: '#faf7f0' }, park: { fill: '#e2e7d3' }, water: { fill: '#d3e0e6' },
    river: { color: '#b9ccd6', weight: 3 },
    road: { color: '#ffffff', weight: 3, casing: '#e3dbcc' }, major: { color: '#fff6e0', weight: 5, casing: '#dccfae' },
    runway: { color: '#c9c2b4', weight: 9 }, terminal: { fill: '#e3dbcc' },
    rail: { color: '#6f655c', weight: 2 }, subway: { color: '#8a9ba8', weight: 1.5, dash: '4 4' }
  };
  function unpack(arr) { const out = []; for (let i = 0; i < arr.length; i += 2) out.push([arr[i] / 1e5, arr[i + 1] / 1e5]); return out; }
  function drawVector(data) {
    const R = L.canvas({ padding: 0.5 });
    const L_ = data.layers || {};
    const poly = (list, st) => { if (list && list.length) L.polygon(list.map((pg) => pg.map(unpack)), { renderer: R, stroke: false, fillColor: st.fill, fillOpacity: 1, interactive: false }).addTo(MAP); };
    const line = (list, color, weight, dash) => { if (list && list.length) return L.polyline(list.map(unpack), { renderer: R, color, weight, dashArray: dash, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(MAP); };
    poly(L_.land, MAPSTYLE.land); poly(L_.park, MAPSTYLE.park); poly(L_.water, MAPSTYLE.water);
    line(L_.runway, MAPSTYLE.runway.color, MAPSTYLE.runway.weight); poly(L_.terminal, MAPSTYLE.terminal);
    // 지도 범위 밖은 바다처럼 보이지 않게 흐린 색으로 덮음
    if (data.bounds) { const [[s, w], [n, e]] = data.bounds; L.polygon([[[s - 5, w - 5], [s - 5, e + 5], [n + 5, e + 5], [n + 5, w - 5]], [[s, w], [n, w], [n, e], [s, e]]], { renderer: R, stroke: false, fillColor: '#ebe5d8', fillOpacity: 1, interactive: false }).addTo(MAP); }
    line(L_.river, MAPSTYLE.river.color, MAPSTYLE.river.weight);
    const rc = line(L_.road, MAPSTYLE.road.casing, 5), r = line(L_.road, MAPSTYLE.road.color, 3);
    const mc = line(L_.major, MAPSTYLE.major.casing, 7), m = line(L_.major, MAPSTYLE.major.color, 5);
    line(L_.subway, MAPSTYLE.subway.color, MAPSTYLE.subway.weight, MAPSTYLE.subway.dash);
    line(L_.rail, MAPSTYLE.rail.color, MAPSTYLE.rail.weight);
    const scale = () => { const z = MAP.getZoom(); const k = z >= 16 ? 2 : z >= 14 ? 1.4 : 1; if (rc) { rc.setStyle({ weight: 4 * k }); r.setStyle({ weight: 2.2 * k }); } if (mc) { mc.setStyle({ weight: 6 * k }); m.setStyle({ weight: 4 * k }); } if (r) { const show = z >= 13.5; rc.setStyle({ opacity: show ? 1 : 0 }); r.setStyle({ opacity: show ? 1 : 0 }); } };
    // 역 점 + 이름표, 지역 이름, 명소 이름
    const dots = L.layerGroup().addTo(MAP), labels = L.layerGroup().addTo(MAP);
    const stations = data.stations || [], areas = data.areas || [], marks = data.landmarks || [];
    stations.forEach((s) => L.circleMarker([s[1], s[2]], { renderer: R, radius: 3.5, color: '#3e3833', weight: 2, fillColor: '#ffffff', fillOpacity: 1, interactive: false }).addTo(dots));
    const lab = (ll, html, cls, anchor) => L.marker(ll, { icon: L.divIcon({ className: '', html: `<div class="${cls}">${html}</div>`, iconSize: null, iconAnchor: anchor }), interactive: false, keyboard: false });
    function relabel() {
      labels.clearLayers();
      const z = MAP.getZoom(), b = MAP.getBounds().pad(0.1);
      const taken = new Set();
      // 겹치지 않게: 화면을 칸으로 나눠 칸마다 이름표 하나만
      const free = (ll, cw, chh) => { const pt = MAP.latLngToContainerPoint(ll); const k = Math.floor(pt.x / cw) + ':' + Math.floor(pt.y / chh); if (taken.has(k)) return false; taken.add(k); return true; };
      stations.forEach((s) => {
        const major = s[4] >= 5;
        if (!(z >= 14 || (z >= 12.5 && major) || (z >= 11.5 && s[4] >= 8))) return;
        if (!b.contains([s[1], s[2]]) || !free([s[1], s[2]], z >= 15 ? 90 : 110, 44)) return;
        lab([s[1], s[2]], `${esc(s[0])}${s[3] ? `<i>${esc(s[3])}</i>` : ''}`, 'st-label', [-8, 8]).addTo(labels);
      });
      if (z >= 13 && z < 15.5) areas.forEach((a) => { if (b.contains([a[1], a[2]]) && free([a[1], a[2]], 130, 60)) lab([a[1], a[2]], `${esc(a[0])}${a[3] ? `<i>${esc(a[3])}</i>` : ''}`, 'area-label', [30, 10]).addTo(labels); });
      if (z >= 15) marks.forEach((m) => { if (b.contains([m[1], m[2]]) && free([m[1], m[2]], 100, 36)) lab([m[1], m[2]], esc(m[0]), 'lm-label', [0, 8]).addTo(labels); });
      if (z < 12.5) dots.remove(); else if (!MAP.hasLayer(dots)) dots.addTo(MAP);
      scale();
    }
    MAP.on('zoomend moveend', relabel); MAP.whenReady(relabel);
  }
  /* ---------- 검색 (오프라인) ---------- */
  let SEARCH = null, SRES = [];
  const norm = (t) => String(t || '').toLowerCase().replace(/[\s·・\-()（）]/g, '').replace(/(역|駅)$/, '');
  function buildSearch() {
    if (SEARCH) return SEARCH;
    SEARCH = [];
    (D.places || []).forEach((p) => { if (p.lat != null) SEARCH.push({ kind: '장소', name: p.name_ko, sub: p.name_ja, keys: [p.name_ko, p.name_ja, p.short, p.yomi].map(norm), lat: p.lat, lng: p.lng, placeId: p.id, w: 100 }); });
    MAPCACHE.forEach((m, j) => {
      if (!m) return;
      (m.stations || []).forEach((st) => SEARCH.push({ kind: '역', name: st[0] + '駅', sub: st[3] ? st[3] + '역' : '', keys: [norm(st[0]), norm(st[3])], lat: st[1], lng: st[2], w: 50 + (st[4] || 0) }));
      (m.landmarks || []).forEach((l) => SEARCH.push({ kind: '명소', name: l[0], sub: '', keys: [norm(l[0])], lat: l[1], lng: l[2], w: 30 }));
      (m.areas || []).forEach((a) => SEARCH.push({ kind: '동네', name: a[0], sub: a[3] || '', keys: [norm(a[0]), norm(a[3])], lat: a[1], lng: a[2], w: 10 }));
    });
    return SEARCH;
  }
  function doSearch(q) {
    const box = document.getElementById('mres'); if (!box) return;
    const n = norm(q);
    if (!n) { box.hidden = true; box.innerHTML = ''; return; }
    const seen = new Set();
    SRES = buildSearch().map((x) => { const hit = x.keys.find((k) => k && k.includes(n)); if (!hit) return null; return Object.assign({ score: x.w + (hit.startsWith(n) ? 40 : 0) + (hit === n ? 60 : 0) }, x); })
      .filter(Boolean).sort((a, b) => b.score - a.score).filter((x) => { const k = x.name + Math.round(x.lat * 500); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
    box.hidden = false;
    box.innerHTML = SRES.length ? SRES.map((x, i) => `<li><button type="button" data-act="pickSearch" data-i="${i}"><span class="k">${esc(x.kind)}</span><span class="n"><b lang="ja">${esc(x.name)}</b>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span>${ic('chevR', 18)}</button></li>`).join('')
      : `<li class="none">찾는 이름이 없어요. 일본어나 다른 이름으로 써 보세요.</li>`;
  }
  /* ---------- 방향·거리 (오프라인 GPS) ---------- */
  let NAVWATCH = null, navLine = null, targetMarker = null, lastFix = null;
  const toRad = (d) => d * Math.PI / 180;
  function distM(a, b) { const R = 6371000, dLat = toRad(b[0] - a[0]), dLng = toRad(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
  function bearing(a, b) { const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0])); const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1])); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }
  const DIR8 = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const fmtDist = (m) => (m < 1000 ? Math.round(m / 10) * 10 + 'm' : (m / 1000).toFixed(m < 10000 ? 1 : 0) + 'km');
  function navBox() { return ui.navTarget ? `<div class="navbox" id="navinfo">${navText()}</div>` : ''; }
  function navText() {
    const t = ui.navTarget; if (!t) return '';
    if (!lastFix) return `<span class="ar">${ic('compass', 26, 2)}</span><span><b>내 위치를 찾는 중…</b><small>하늘이 보이는 곳에서 더 빨리 잡혀요. 인터넷은 필요 없어요.</small></span>`;
    const d = distM(lastFix, [t.lat, t.lng]), b = bearing(lastFix, [t.lat, t.lng]);
    const walk = Math.max(1, Math.round(d / 80));
    return `<span class="ar" style="transform:rotate(${Math.round(b)}deg)">${ic('arrow', 26, 2)}</span><span><b>${DIR8[Math.round(b / 45) % 8]}쪽으로 ${fmtDist(d)}</b><small>${esc(t.name)}까지 직선거리 · 걸으면 ${d > 3000 ? '멀어요, 전철을 타요' : '약 ' + walk + '분(직선 기준)'}<br>지도는 위쪽이 북쪽이에요. 실제 길은 더 길 수 있어요.</small></span>`;
  }
  function paintNav() {
    const box = document.getElementById('navinfo'); if (box) box.innerHTML = navText();
    if (!MAP || !ui.navTarget) return;
    const t = [ui.navTarget.lat, ui.navTarget.lng];
    if (lastFix) {
      if (meMarker) meMarker.setLatLng(lastFix); else meMarker = L.marker(lastFix, { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }), zIndexOffset: 2500, title: '내 위치' }).addTo(MAP);
      if (navLine) navLine.setLatLngs([lastFix, t]); else navLine = L.polyline([lastFix, t], { color: '#3e3833', weight: 4, dashArray: '2 10', lineCap: 'round', interactive: false }).addTo(MAP);
    }
  }
  function startNav(target) {
    ui.navTarget = target;
    if (!navigator.geolocation) { toast('이 기기에서는 위치를 쓸 수 없어요.'); return; }
    if (NAVWATCH == null) {
      let first = true;
      NAVWATCH = navigator.geolocation.watchPosition((pos) => {
        lastFix = [pos.coords.latitude, pos.coords.longitude]; paintNav();
        if (first && MAP && ui.navTarget) { first = false; const bb = L.latLngBounds([lastFix, [ui.navTarget.lat, ui.navTarget.lng]]); if (MAP.options.maxBounds && MAP.options.maxBounds.contains(lastFix)) MAP.flyToBounds(bb, { padding: [70, 70], maxZoom: 17, duration: 0.8 }); else toast('지금 위치가 이 지도 밖이라 거리와 방향만 보여줘요.'); }
      }, (err) => { toast(err.code === 1 ? '위치 권한이 꺼져 있어요. 설정에서 허용해 주세요.' : '위치를 찾지 못했어요. 하늘이 보이는 곳에서 다시 해 보세요.'); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 });
    }
    paintNav();
  }
  function stopNav() { if (NAVWATCH != null && navigator.geolocation) navigator.geolocation.clearWatch(NAVWATCH); NAVWATCH = null; ui.navTarget = null; if (navLine) { try { navLine.remove(); } catch (e) { /* 이미 지워짐 */ } } navLine = null; }
  function targetSheet(t) {
    return `<button type="button" class="sx" data-act="closeStop" aria-label="닫기">${ic('close', 22, 2.2)}</button>
      <div class="sh-top"><div class="disc tgt">${ic(t.kind === '역' ? 'train' : 'pin', 30, 2)}</div><div class="sh-name"><span class="kicker">${esc(t.kind)}</span><b lang="ja">${esc(t.name)}</b>${t.sub ? `<small>${esc(t.sub)}</small>` : ''}</div></div>
      ${navBox()}${ui.navTarget && NAVWATCH != null ? '' : `<button type="button" class="btn btn-primary btn-sm" data-act="navStart">${ic('arrow', 18, 2.2)}내 위치에서 방향 보기</button>`}
      <a class="btn btn-quiet btn-sm" href="#/help/phrase/3/1">${ic('chat', 18, 2)}'여기에 가고 싶어요' 일본어 보기</a>`;
  }
  function showTarget(t, fly = true) {
    if (!MAP) return;
    if (targetMarker) targetMarker.remove();
    targetMarker = L.marker([t.lat, t.lng], { icon: L.divIcon({ className: '', html: `<div class="tgtpin">${ic(t.kind === '역' ? 'train' : 'pin', 22, 2.2)}</div>`, iconSize: [44, 52], iconAnchor: [22, 50] }), zIndexOffset: 2400, title: t.name }).addTo(MAP);
    const sh = document.getElementById('stopsheet'); if (sh) { sh.innerHTML = targetSheet(t); sh.hidden = false; }
    if (fly) { const z = Math.max(MAP.getZoom(), 16), H = MAP.getSize().y; MAP.flyTo(MAP.unproject(MAP.project([t.lat, t.lng], z).add([0, H * 0.22]), z), z, { duration: 0.8 }); }
    paintNav();
  }
  function locate() {
    if (!MAP) return;
    if (!navigator.geolocation) { toast('이 기기에서는 위치를 쓸 수 없어요.'); return; }
    toast('내 위치를 찾는 중…');
    navigator.geolocation.getCurrentPosition((pos) => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (MAP.options.crs === L.CRS.Simple) { toast('그림 지도에서는 내 위치를 표시할 수 없어요.'); return; }
      if (meMarker) meMarker.setLatLng(ll); else meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }), zIndexOffset: 2000, title: '내 위치' }).addTo(MAP);
      const other = MAPCACHE.findIndex((m, j) => j !== ui.mapIdx && inMap({ lat: ll[0], lng: ll[1] }, m));
      if (MAP.options.maxBounds && !MAP.options.maxBounds.contains(ll)) toast(other >= 0 ? `지금 위치는 ${MAPS()[other].name} 지도에 있어요. 위에서 ${MAPS()[other].name}을(를) 눌러 주세요.` : `지금 위치가 ${MAPS()[ui.mapIdx].name} 지도 밖이에요.`); else MAP.setView(ll, Math.max(MAP.getZoom(), 16));
    }, (err) => { toast(err.code === 1 ? '위치 권한이 꺼져 있어요. 설정에서 허용해 주세요.' : '위치를 찾지 못했어요. 하늘이 보이는 곳에서 다시 해 보세요.'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }

  /* ================= 화면: 도움 ================= */
  function vHelp() {
    const t = (href, icn, b, s, cls = '') => `<a class="tile ${cls}" href="#/help/${href}">${ic(icn, 28, 2)}<span><b>${b}</b><small lang="ja">${s}</small></span></a>`;
    return header('도움', '助け') + `<div class="body"><div class="tiles">
      ${t('contacts', 'phone', '긴급 연락', '110 · 119', 'shu')}${t('hotel', 'bed', '숙소 보여주기', 'ホテル', 'ink')}
      ${t('lostway', 'compass', '길을 잃었을 때', '迷子')}${t('disaster', 'quake', '지진·재난', '地震')}
      ${t('lost', 'bag', '분실·도난', '紛失')}${t('phrases', 'chat', '필수 일본어', '日本語')}
      ${t('etiquette', 'rule', '생활 규칙', 'マナー')}${t('exchange', 'yen', '환율 계산기', '円 ↔ 원')}
      ${t('checklist', 'check', '준비물 체크', '持ち物')}${t('airport', 'plane', '공항 · 입출국', '空港')}</div>
      <div style="margin-top:12px">${changesLink()}</div></div>`;
  }
  const tel = (n) => String(n).replace(/[^\d+]/g, '');
  function contactCard(c) {
    const ok = has(c.phone);
    return `<section class="contact"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-size:17px;font-weight:700">${esc(c.role)}</span>${c.role_ja ? `<span class="ja" lang="ja" style="font-size:15px">${esc(c.role_ja)}</span>` : ''}</div>
      <div class="muted" style="font-size:15px">${c.name === undefined ? '' : val(c.name)}</div>
      <div class="row">${ok ? `<span class="num ${String(c.phone).length > 5 ? 'long' : ''}">${esc(c.phone)}</span><a class="call" href="tel:${tel(c.phone)}">${ic('phone', 22, 2)}전화</a>`
        : `<span class="num long" style="color:var(--slate)">번호 ${NEED}</span><button type="button" class="call off" data-act="noNumber" style="border:0" aria-label="전화 (번호 확인 필요)">${ic('phone', 22, 2)}전화</button>`}</div></section>`;
  }
  function vContacts() {
    const list = D.contacts || [];
    const pub = list.filter((c) => !c.group), school = list.filter((c) => c.group);
    const hotel = D.trip.hotel || {};
    const hotelCard = { role: '숙소 프런트', role_ja: 'フロント', name: hotel.name_ko || hotel.name_ja || null, phone: hotel.phone };
    return header('긴급 연락', '緊急連絡', '#/help') + `<div class="body gap-12">
      <div class="muted" style="font-size:15px;line-height:22px">내 폰이 꺼졌다면 번호를 다른 사람에게 보여주고 걸어 달라고 하세요.</div>
      ${pub.map(contactCard).join('')}
      <div class="sec-title"><h2 class="h2">학교 · 숙소</h2><span class="kicker" lang="ja">引率</span></div>
      ${school.map(contactCard).join('')}${contactCard(hotelCard)}</div>`;
  }
  function vHotel() {
    const h = D.trip.hotel || {};
    return `<section class="dark"><div class="hd-top"><a class="back" href="#/help" aria-label="닫기">${ic('chevL', 28, 2)}</a><span class="small" style="font-weight:700;opacity:.85">화면을 그대로 보여 주세요</span></div>
      <div lang="ja" style="font-size:22px;line-height:32px;font-weight:700">このホテルに行きたいです。</div>
      <div class="plate"><span class="kicker" lang="ja">ホテル名 · 숙소 이름</span><div class="v1" lang="ja">${val(h.name_ja)}</div>${h.name_ko ? `<div class="small muted">${val(h.name_ko)}</div>` : ''}</div>
      <div class="plate"><span class="kicker" lang="ja">住所 · 주소</span><div class="v2" lang="ja">${val(h.address_ja)}</div></div>
      <div class="plate" style="background:#4a433d;color:var(--paper)"><span class="kicker" style="color:var(--paper);opacity:.85" lang="ja">電話 · 전화</span><div class="v2">${has(h.phone) ? `<a href="tel:${tel(h.phone)}" style="color:inherit">${esc(h.phone)}</a>` : val(null)}</div></div>
      <div class="small" style="margin-top:auto;opacity:.85">화면 밝기를 최대로 올려 두면 잘 보여요.${has(h.name_ja) ? '' : ' 숙소 정보는 학교에서 확정되면 일본어로 채워져요.'}</div></section>`;
  }
  function vLostWay() {
    const lw = (D.emergency && D.emergency.lostWay) || { steps: [] };
    const ph = lw.phrase;
    return header('길을 잃었을 때', '迷子になったら', '#/help') + `<div class="body gap-20">
      ${lw.steps && lw.steps.length ? steps(lw.steps) : slot('행동 요령', '아직 내용이 없어요', '길을 잃었을 때 할 일이 순서대로 들어와요.', null, 'compass')}
      <a class="btn btn-ink" href="#/help/hotel">${ic('bed', 22, 2)}숙소 보여주기</a><a class="btn btn-shu" href="#/help/contacts">${ic('phone', 22, 2)}긴급 연락</a>
      ${ph ? `<section class="card" style="gap:6px"><span class="kicker">이렇게 말해요</span><span lang="ja" style="font-size:22px;line-height:30px;font-weight:900">${esc(ph.ja)}</span><span class="small muted">${esc(ph.yomi || '')} · ${esc(ph.ko || '')}</span></section>` : ''}</div>`;
  }
  function vSituations(kind) {
    const src = kind === 'disaster' ? D.emergency : D.lost;
    const sits = (src && src.situations) || [];
    const title = kind === 'disaster' ? ['지진·재난', '地震・災害'] : ['분실·도난', '紛失・盗難'];
    const k = kind === 'disaster' ? 'disSit' : 'lostSit';
    if (!sits.length) return header(title[0], title[1], '#/help') + `<div class="body">${slot('상황별 행동', '아직 내용이 없어요', '상황마다 단계별 행동과 주의가 들어와요.', null, 'alert')}</div>`;
    if (ui[k] >= sits.length) ui[k] = 0;
    const s = sits[ui[k]];
    let extra = '';
    if (kind === 'disaster') {
      if (s.cautions && s.cautions.length) extra += `<section class="warn"><div class="h">${ic('alert', 20, 2)}주의</div>${s.cautions.map((c) => `<div style="font-size:15px;line-height:22px">${val(c)}</div>`).join('')}</section>`;
      (D.emergency.words || []).forEach((w) => { extra += `<section class="card" style="gap:6px"><span class="kicker">알아 둘 말</span><span lang="ja" style="font-size:20px;line-height:28px;font-weight:900">${esc(w.ja)} · ${esc(w.yomi || '')}</span><span class="small muted">${esc(w.ko || '')}</span></section>`; });
      extra += `<div class="mini"><a href="tel:119"><span>구급·소방 <span lang="ja">救急・消防</span></span><b>119</b></a><a href="tel:110"><span>경찰 <span lang="ja">警察</span></span><b>110</b></a></div>`;
    } else {
      if (s.needs && s.needs.length) extra += `<section class="card" style="gap:10px"><div class="kicker">필요한 것</div><div class="tags">${s.needs.map((n) => `<span class="tag-w">${val(n)}</span>`).join('')}</div>${s.needsNote ? `<div class="small muted">${val(s.needsNote)}</div>` : ''}</section>`;
      if (s.contacts && s.contacts.length) extra += `<div class="sec-title"><h2 class="h2">연락처</h2><span class="kicker" lang="ja">連絡先</span></div><div class="mini">${s.contacts.map((c) => has(c.phone)
        ? `<a href="tel:${tel(c.phone)}"><span>${esc(c.label)}</span><b>${esc(c.phone)}</b></a>` : `<button type="button" class="mbox" data-act="noNumber" style="border:0;text-align:left;font-family:inherit"><span>${esc(c.label)}</span>${NEED}</button>`).join('')}</div>`;
    }
    return header(title[0], title[1], '#/help') + chips(sits.map((x) => x.name), ui[k], k) + `<div class="body gap-20" style="padding-top:16px">${steps(s.steps)}${extra}</div>`;
  }
  function vPhrases() {
    const cats = (D.phrases && D.phrases.categories) || [];
    if (!cats.length) return header('필수 일본어', '日本語', '#/help') + `<div class="body">${slot('일본어 문장', '아직 문장이 없어요', '상황별로 한국어·일본어·읽는 법이 들어와요.', null, 'chat')}</div>`;
    if (ui.phCat >= cats.length) ui.phCat = 0;
    const c = cats[ui.phCat];
    return header('필수 일본어', '日本語', '#/help') + chips(cats.map((x) => x.name), ui.phCat, 'phCat') + `<div class="body gap-12" style="padding-top:16px">
      ${c.allergy ? `<a class="btn btn-shu" href="#/help/allergy">${ic('expand', 22, 2)}알레르기 카드 크게 보여주기</a>` : ''}
      <div class="small muted">오른쪽 버튼을 누르면 상대에게 보여 줄 수 있게 화면 가득 커져요.</div>
      ${(c.phrases || []).map((p, i) => `<section class="phrase"><div class="c"><span class="muted" style="font-size:15px;line-height:22px">${esc(p.ko)}</span><span class="jp" lang="ja">${esc(p.ja)}</span><span class="yomi">${esc(p.yomi || '')}</span></div>
        <a class="round" href="#/help/phrase/${ui.phCat}/${i}" aria-label="크게 보여주기">${ic('expand', 22, 2)}</a></section>`).join('')}</div>`;
  }
  function vPhraseFull(ci, pi) {
    const c = ((D.phrases && D.phrases.categories) || [])[+ci]; const p = c && c.phrases && c.phrases[+pi];
    if (!p) return vPhrases();
    return `<section class="full"><div class="hd-top"><a class="back" href="#/help/phrases" aria-label="닫기">${ic('chevL', 28, 2)}</a><span class="small muted" style="font-weight:700">상대에게 보여 주세요</span></div>
      <div class="bar"></div><div class="j1" lang="ja">${esc(p.ja)}</div>
      <div style="display:flex;flex-direction:column;gap:4px;padding-top:16px;border-top:1px solid var(--line)"><span style="font-size:17px">${esc(p.ko)}</span><span class="yomi ja" style="font-size:15px">${esc(p.yomi || '')}</span></div></section>`;
  }
  function vAllergy() {
    const A = (D.phrases && D.phrases.allergens) || [];
    if (!A.length) return vPhrases();
    if (ui.allergen >= A.length) ui.allergen = 0;
    const a = A[ui.allergen];
    return `<section class="full"><div class="hd-top"><a class="back" href="#/help/phrases" aria-label="닫기">${ic('chevL', 28, 2)}</a><span class="small muted" style="font-weight:700">점원에게 보여 주세요</span></div>
      <div class="bar"></div>
      <div class="j1" lang="ja">私は<mark>${esc(a.ja)}</mark>アレルギーがあります。</div>
      <div class="j2" lang="ja">これに${esc(a.ja)}は入っていますか？</div>
      <div style="display:flex;flex-direction:column;gap:4px;padding-top:16px;border-top:1px solid var(--line)">
        <span>저는 ${esc(a.ko)} 알레르기가 있어요. 이 음식에 ${esc(a.ko)}${esc(a.josa || '이')} 들어 있나요?</span>
        <span class="ja" style="font-size:14px">와타시와 ${esc(a.yomi)} 아레루기가 아리마스 · 코레니 ${esc(a.yomi)}와 하잇테이마스카</span></div>
      <div class="foot"><span class="kicker">재료 바꾸기</span><div class="tags">${A.map((x, i) => `<button type="button" class="chip" aria-pressed="${i === ui.allergen}" data-act="allergen" data-i="${i}" style="min-height:52px">${esc(x.ko)} <span lang="ja">${esc(x.ja)}</span></button>`).join('')}</div></div></section>`;
  }
  function vEtiquette() {
    const list = D.etiquette || [];
    const cats = ['전체', '교통', '식사', '거리', '쇼핑'];
    list.forEach((x) => { if (x.category && !cats.includes(x.category)) cats.push(x.category); });
    if (ui.etCat >= cats.length) ui.etCat = 0;
    const cat = cats[ui.etCat]; const shown = list.filter((x) => cat === '전체' || x.category === cat);
    return header('생활 규칙', 'マナー', '#/help') + chips(cats, ui.etCat, 'etCat') + `<div class="body gap-12" style="padding-top:16px">${shown.length ? shown.map((r) =>
      `<section class="card card-line" style="gap:6px"><span class="kicker">${esc(r.category || '')}</span><span style="font-size:17px;line-height:24px;font-weight:700">${val(r.title)}</span><span class="muted" style="font-size:15px;line-height:22px">${val(r.desc)}</span></section>`).join('')
      : slot(cat, '이 분류에는 아직 규칙이 없어요', '규칙이 들어오면 제목과 설명이 여기에 나와요.', null, 'rule')}</div>`;
  }
  function vExchange() {
    const ex = D.trip.exchange || {}; const rate = Number(ex.krwPer100Jpy);
    const ok = has(ex.krwPer100Jpy) && rate > 0;
    const jpyIn = ui.exDir === 'jpy';
    const amt = parseFloat(String(ui.exAmt || '').replace(/,/g, ''));
    let out = '<span class="none">—</span>';
    if (ok && !isNaN(amt)) { const r = jpyIn ? amt * rate / 100 : amt * 100 / rate; out = Math.round(r).toLocaleString('ko-KR'); }
    const qs = jpyIn ? [100, 500, 1000, 5000] : [1000, 5000, 10000, 50000];
    return header('환율 계산기', '円 ↔ 원', '#/help') + `<div class="body gap-20">
      <section class="card ${ok ? 'card-line' : 'card-soft'}" style="gap:8px"><div class="kv"><b>적용 환율</b><span>100엔 = ${ok ? rate.toLocaleString('ko-KR') : NEED}원</span></div>
        <div class="kv"><b>기준일</b><span>${has(ex.baseDate) ? esc(ex.baseDate) : NEED}</span></div>
        ${ok ? '<div class="small muted">실제 환전·카드 결제 금액과 조금 다를 수 있어요.</div>' : '<div class="small" style="color:var(--ginkgo-deep)">환율이 들어오기 전에는 계산 결과가 나오지 않아요.</div>'}</section>
      <div class="field"><label class="label" for="amt">${jpyIn ? '엔 (円)' : '원 (₩)'}</label>
        <div class="calc-in"><span class="cur">${jpyIn ? '¥' : '₩'}</span><input id="amt" inputmode="decimal" placeholder="0" value="${esc(ui.exAmt || '')}" data-input="exAmt" autocomplete="off"></div></div>
      <button type="button" class="btn btn-quiet btn-sm btn-auto" style="align-self:flex-start" data-act="exSwap">${ic('swap', 20, 2)}${jpyIn ? '원 → 엔으로 바꾸기' : '엔 → 원으로 바꾸기'}</button>
      <div class="field"><span class="label">${jpyIn ? '원 (₩)' : '엔 (円)'}</span><div class="calc-out"><span class="cur">${jpyIn ? '₩' : '¥'}</span><span id="exOut">${out}</span></div></div>
      <div class="qa">${qs.map((q) => `<button type="button" data-act="exQuick" data-v="${q}">${jpyIn ? '¥' : '₩'}${q.toLocaleString('ko-KR')}</button>`).join('')}</div></div>`;
  }
  function vChecklist() {
    const base = D.checklist || []; const mine = store.get('myChecklist', []); const st = store.get('checks', {});
    const all = base.map((x) => Object.assign({ own: false }, x)).concat(mine.map((x) => Object.assign({ own: true }, x)));
    const done = all.filter((x) => st[x.id]).length;
    const pct = all.length ? Math.round(done / all.length * 100) : 0;
    const row = (x) => `<label class="check"><input type="checkbox" data-check="${esc(x.id)}" ${st[x.id] ? 'checked' : ''}><span class="box">${st[x.id] ? ic('check', 22, 2.6) : ''}</span>
      <span class="lb"><b>${esc(x.label)}</b>${x.note ? `<span class="small muted">${esc(x.note)}</span>` : ''}</span>${x.own ? `<button type="button" class="del" data-act="delItem" data-id="${esc(x.id)}" aria-label="${esc(x.label)} 지우기">${ic('close', 20, 2)}</button>` : ''}</label>`;
    return header('준비물 체크', '持ち物', '#/help') + `<div class="body">
      <section style="display:flex;flex-direction:column;gap:8px"><div class="kv"><b>챙긴 것</b><b>${done} / ${all.length}</b></div>
        <div class="progress"><div style="width:${pct}%;background:var(--slate-deep)"></div></div><div class="small muted">체크 표시와 직접 더한 항목은 이 폰에만 저장돼요.</div></section>
      <div>${all.length ? all.map(row).join('') : ''}</div>
      ${base.length ? '' : slot('학교 준비물', '학교 안내 준비물이 아직 없어요', '학교에서 준비물 목록이 나오면 여기에 더해져요.', null, 'bag')}
      <form class="addrow" data-form="addItem"><label class="sr" for="newItem">내 준비물 더하기</label><input id="newItem" name="item" placeholder="내 준비물 더하기" autocomplete="off"><button class="btn btn-primary btn-auto" type="submit" aria-label="더하기">${ic('plus', 22, 2.2)}</button></form></div>`;
  }

  /* ================= 화면: 나 ================= */
  function vMe() {
    const pm = D.missions.place, ph = D.missions.photo, qz = D.quiz || [];
    const done = store.get('missions', {});
    const got = pm.filter((m) => done[m.id]).length;
    const stamps = pm.length
      ? pm.map((m) => { const p = placeById(m.placeId); const ch = m.stamp || (p && p.name_ja ? p.name_ja[0] : '★'); return `<div class="stamp ${done[m.id] ? 'got' : ''}" role="img" aria-label="${esc(p ? p.name_ko : m.title)} ${done[m.id] ? '도장 받음' : '빈 칸'}" lang="ja">${esc(ch)}</div>`; }).join('')
      : ['東', '京', '秋', '旅'].map((c) => `<div class="stamp" role="img" aria-label="빈 도장 칸" lang="ja">${c}</div>`).join('');
    const mrow = (m, kind) => { const p = m.placeId ? placeById(m.placeId) : null;
      return `<label class="check mission"><input type="checkbox" data-mission="${esc(m.id)}" ${done[m.id] ? 'checked' : ''}><span class="box">${done[m.id] ? ic('check', 22, 2.6) : ''}</span>
        <span class="lb"><b>${val(m.title)}</b>${p ? `<span class="small muted">${ic(kind === 'photo' ? 'camera' : 'pin', 14)} ${esc(p.name_ko)}</span>` : ''}${m.desc ? `<span class="small muted">${val(m.desc)}</span>` : ''}</span></label>`; };
    const answered = store.get('quiz', {});
    const right = qz.filter((q) => answered[q.id] === q.answer).length;
    return header('나', 'わたし') + `<div class="body">
      <section class="card"><div class="kv"><b style="font-size:17px">디지털 스탬프</b><span class="small muted">${got}개 모음</span></div><div class="stamps">${stamps}</div>
        <div class="small muted">장소 미션을 마치면 도장이 찍혀요.</div></section>
      <div class="sec-title"><h2 class="h2">장소별 미션</h2></div>
      ${pm.length ? `<div>${pm.map((m) => mrow(m, 'place')).join('')}</div>` : slot('장소별 미션', '미션이 아직 없어요', '장소가 정해지면 장소마다 할 일이 생겨요.', [['장소', '미션 내용', '완료']], 'flag')}
      <div class="sec-title"><h2 class="h2">사진 미션</h2></div>
      ${ph.length ? `<div>${ph.map((m) => mrow(m, 'photo')).join('')}</div>` : slot('사진 미션', '사진 미션이 아직 없어요', '찍어 올 장면이 들어오면 체크하며 모을 수 있어요.', null, 'camera')}
      <div class="sec-title"><h2 class="h2">퀴즈</h2></div>
      ${qz.length ? `<a class="btn btn-quiet" href="#/me/quiz">${ic('quiz', 22, 2)}퀴즈 풀기 · ${right} / ${qz.length}</a>` : slot('퀴즈', '퀴즈가 아직 없어요', '문제가 들어오면 여기서 풀 수 있어요.', null, 'quiz')}
      <a class="btn btn-ink" href="#/me/memo" style="justify-content:flex-start;min-height:72px">${ic('pencil', 24, 2)}<span style="display:flex;flex-direction:column;align-items:flex-start;flex-grow:1"><span>여행 기록 · 메모</span><span class="small" style="opacity:.85;font-weight:400">날짜별로 직접 쓰기</span></span>${ic('chevR', 22)}</a></div>`;
  }
  function vQuiz() {
    const qz = D.quiz || []; const ans = store.get('quiz', {});
    const right = qz.filter((q) => ans[q.id] === q.answer).length;
    return header('퀴즈', 'クイズ', '#/me') + `<div class="body gap-12"><div class="kv"><span class="muted">맞힌 문제</span><b>${right} / ${qz.length}</b></div>
      ${qz.length ? qz.map((q, qi) => { const a = ans[q.id]; const answered = a != null;
        return `<section class="q"><span class="kicker">문제 ${qi + 1}</span><b style="font-size:17px;line-height:24px">${val(q.q)}</b><div class="opts">${(q.choices || []).map((c, ci) =>
          `<button type="button" class="opt ${answered && ci === q.answer ? 'right' : ''} ${answered && ci === a && a !== q.answer ? 'wrong' : ''}" data-act="answer" data-q="${esc(q.id)}" data-i="${ci}" ${answered ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>
          ${answered ? `<div style="font-size:15px;line-height:22px"><b>${a === q.answer ? '정답이에요!' : '아쉬워요.'}</b> ${q.explain ? val(q.explain) : ''}</div>` : ''}</section>`; }).join('')
        + `<button class="btn btn-quiet btn-sm" data-act="resetQuiz">처음부터 다시 풀기</button>`
      : slot('퀴즈', '퀴즈가 아직 없어요', '문제가 들어오면 여기서 풀 수 있어요.', null, 'quiz')}</div>`;
  }
  function vMemo() {
    const memos = store.get('memos', {}); const d = ui.memoDate || todayISO(); ui.memoDate = d;
    const others = Object.keys(memos).filter((k) => k !== d && memos[k] && memos[k].trim()).sort().reverse();
    return header('여행 기록', '旅の記録', '#/me') + `<div class="body">
      <section class="lock">${ic('lock', 22, 2)}<span>메모는 이 폰에만 저장돼요. 다른 사람에게 보이지 않고, 앱이나 사이트 데이터를 지우면 함께 지워져요.</span></section>
      <div class="field"><label class="label" for="mdate">날짜</label><input class="date" type="date" id="mdate" value="${esc(d)}" data-input="memoDate"></div>
      <div class="field"><label class="label" for="memo">${fmtDate(d) || esc(d)} 기록</label>
        <textarea class="memo" id="memo" data-input="memo" placeholder="오늘 본 것, 먹은 것, 기억하고 싶은 것을 적어 보세요.">${esc(memos[d] || '')}</textarea>
        <div class="small muted" id="memoState">쓰는 대로 자동 저장 · 인터넷 필요 없음</div></div>
      <div class="sec-title"><h2 class="h2">지난 기록</h2></div>
      ${others.length ? `<div class="entrylist">${others.map((k) => `<button type="button" data-act="openMemo" data-d="${esc(k)}"><span><b>${fmtDate(k) || esc(k)}</b><br><span class="small muted">${esc(memos[k].slice(0, 40))}${memos[k].length > 40 ? '…' : ''}</span></span>${ic('chevR', 20)}</button>`).join('')}</div>`
        : slot('지난 기록', '아직 쓴 기록이 없어요', '날짜마다 쓴 글이 여기에 쌓여요.', null, 'pencil')}</div>`;
  }

  /* ================= 라우터 ================= */
  const ui = { dayPicked: false, day: 0, placeCat: 0, mapSel: null, searchTarget: null, navTarget: null, gday: 0, ptab: 0, ptabFor: null, mapIdx: 0, mapAuto: false, disSit: 0, lostSit: 0, phCat: 0, allergen: 0, etCat: 0, exDir: 'jpy', exAmt: '', memoDate: null, entryErr: null };
  const FULL = ['help/hotel', 'help/allergy', 'help/phrase', 'entry', 'show'];
  let countdownTimer;
  function route(animate) {
    const h = (location.hash || '#/home').replace(/^#\/?/, '');
    const parts = h.split('/');
    if (!store.get('joined', false) && parts[0] !== 'entry') { location.replace('#/entry'); return; }
    let html; const tab = parts[0];
    switch (tab) {
      case 'entry': html = vEntry(); break;
      case 'home': case '': html = vHome(); break;
      case 'notices': html = vNotices(); break;
      case 'schedule': html = vSchedule(parts[1]); break;
      case 'places': html = vPlaces(); break;
      case 'place': html = vPlace(parts[1]); break;
      case 'map': html = vMap(parts[1]); break;
      case 'show': html = vShow(parts[1]); break;
      case 'changes': html = vChanges(); break;
      case 'eat': case 'see': case 'shop': html = vGuide(tab); break;
      case 'weather': html = vWeather(); break;
      case 'help':
        switch (parts[1]) {
          case 'contacts': html = vContacts(); break;
          case 'hotel': html = vHotel(); break;
          case 'lostway': html = vLostWay(); break;
          case 'disaster': html = vSituations('disaster'); break;
          case 'lost': html = vSituations('lost'); break;
          case 'phrases': html = vPhrases(); break;
          case 'phrase': html = vPhraseFull(parts[2], parts[3]); break;
          case 'allergy': html = vAllergy(); break;
          case 'etiquette': html = vEtiquette(); break;
          case 'exchange': html = vExchange(); break;
          case 'checklist': html = vChecklist(); break;
          case 'airport': html = vAirport(); break;
          default: html = vHelp();
        }
        break;
      case 'me': html = parts[1] === 'memo' ? vMemo() : parts[1] === 'quiz' ? vQuiz() : vMe(); break;
      default: html = vHome();
    }
    const full = FULL.some((f) => h === f || h.startsWith(f + '/'));
    document.body.classList.toggle('no-tab', full);
    const activeTab = { '': 'home', notices: 'home', changes: 'home', eat: 'home', weather: 'home', see: 'home', shop: 'home', place: 'places', show: 'places', map: 'places' }[tab] || tab;
    paintTabs(activeTab);
    destroyMap();
    app.classList.remove('enter');
    app.innerHTML = html;
    if (animate) { void app.offsetWidth; app.classList.add('enter'); }
    markOverflow();
    if (tab === 'map') initMap();
    clearInterval(countdownTimer);
    const cd = document.getElementById('countdown');
    if (cd) countdownTimer = setInterval(() => { cd.textContent = countdown(+cd.dataset.to); }, 30000);
    if (tab === 'entry') cacheAll();
  }
  function rerender(keepScroll) { const y = window.scrollY; route(false); if (keepScroll) window.scrollTo(0, y); }
  function markOverflow() {
    document.querySelectorAll('.chips, .days').forEach((el) => {
      const on = el.querySelector('[aria-pressed="true"]');
      if (on) { const l = on.offsetLeft - el.offsetLeft, r = l + on.offsetWidth; if (r > el.clientWidth - 24) el.scrollLeft = r - el.clientWidth + 48; }
      const f = () => el.classList.toggle('more', el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
      f(); el.addEventListener('scroll', f, { passive: true });
    });
  }

  /* ================= 이벤트 ================= */
  const ACT = {
    retryCache() { cacheState.error = null; cacheAll(); },
    refreshNotices() { refreshNotices(false).then(() => rerender(true)); },
    day(el) { ui.day = +el.dataset.i; ui.dayPicked = true; rerender(true); },
    placeCat(el) { ui.placeCat = +el.dataset.i; rerender(true); },
    ptab(el) { ui.ptab = +el.dataset.i; rerender(false); const t = document.querySelector('.ptabs'); if (t) window.scrollTo(0, Math.max(0, t.offsetTop - 8)); },
    pickStop(el) { const z = document.getElementById('mapzone'); if (z) window.scrollTo({ top: Math.max(0, z.offsetTop - 8), behavior: 'smooth' }); selectPlace(el.dataset.id); },
    goStop(el) { location.hash = '#/map/' + encodeURIComponent(el.dataset.id); },
    closeStop() { closeStop(); },
    stamp(el) { const d = store.get('missions', {}); const was = !!d[el.dataset.id]; d[el.dataset.id] = !was; store.set('missions', d); const p = placeById(ui.mapSel); if (p) showSheet(p, !was); if (!was) toast('도장을 받았어요! 나 탭에서 모은 도장을 볼 수 있어요.'); },
    gday(el) { ui.gday = +el.dataset.i; rerender(true); },
    pickSearch(el) {
      const x = SRES[+el.dataset.i]; if (!x) return;
      const box = document.getElementById('mres'); if (box) { box.hidden = true; } const q = document.getElementById('mq'); if (q) { q.value = ''; q.blur(); }
      stopNav();
      if (x.placeId) { location.hash = '#/map/' + encodeURIComponent(x.placeId); if (ui.mapSel === x.placeId) selectPlace(x.placeId); return; }
      const t = { kind: x.kind, name: x.name, sub: x.sub, lat: x.lat, lng: x.lng };
      ui.searchTarget = t; ui.mapSel = null;
      if ((location.hash || '') !== '#/map') history.replaceState(null, '', '#/map');
      const j = MAPCACHE.findIndex((m) => inMap(t, m));
      if (j >= 0 && j !== ui.mapIdx) { ui.mapIdx = j; rerender(true); return; }
      showSheet(null); refreshStops(); showTarget(t);
    },
    navStart() { if (ui.searchTarget) { startNav(ui.searchTarget); const sh = document.getElementById('stopsheet'); if (sh) sh.innerHTML = targetSheet(ui.searchTarget); paintNav(); } },
    navPlace(el) { const p = placeById(el.dataset.id); if (!p) return; startNav({ kind: '장소', name: p.name_ko, lat: p.lat, lng: p.lng }); showSheet(p, false); paintNav(); },
    wxRefresh() { refreshWeather(true); },
    mapPick(el) { ui.mapSel = null; ui.searchTarget = null; stopNav(); if ((location.hash || '') !== '#/map') history.replaceState(null, '', '#/map'); ui.mapIdx = +el.dataset.i; rerender(true); },
    zoomIn() { if (MAP) MAP.zoomIn(1); },
    zoomOut() { if (MAP) MAP.zoomOut(1); },
    locate() { locate(); },
    disSit(el) { ui.disSit = +el.dataset.i; rerender(true); },
    lostSit(el) { ui.lostSit = +el.dataset.i; rerender(true); },
    phCat(el) { ui.phCat = +el.dataset.i; rerender(true); },
    allergen(el) { ui.allergen = +el.dataset.i; rerender(true); },
    etCat(el) { ui.etCat = +el.dataset.i; rerender(true); },
    exSwap() { ui.exDir = ui.exDir === 'jpy' ? 'krw' : 'jpy'; ui.exAmt = ''; rerender(true); },
    exQuick(el) { ui.exAmt = el.dataset.v; rerender(true); },
    delItem(el) { store.set('myChecklist', store.get('myChecklist', []).filter((x) => x.id !== el.dataset.id)); rerender(true); },
    answer(el) { const a = store.get('quiz', {}); a[el.dataset.q] = +el.dataset.i; store.set('quiz', a); rerender(true); },
    resetQuiz() { store.set('quiz', {}); rerender(false); },
    openMemo(el) { ui.memoDate = el.dataset.d; rerender(false); },
    noop() {},
    noNumber() { toast('아직 번호가 정해지지 않았어요. 확정되면 여기서 바로 걸 수 있어요.'); }
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.check) { const s = store.get('checks', {}); s[t.dataset.check] = t.checked; store.set('checks', s); rerender(true); }
    if (t.dataset.mission) { const s = store.get('missions', {}); s[t.dataset.mission] = t.checked; store.set('missions', s); rerender(true); if (t.checked) toast('완료! 도장을 받았어요.'); }
    if (t.dataset.input === 'memoDate' && t.value) { ui.memoDate = t.value; rerender(false); }
  });
  let memoTimer;
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.input === 'exAmt') {
      ui.exAmt = t.value; const out = document.getElementById('exOut'); const ex = D.trip.exchange || {}; const rate = Number(ex.krwPer100Jpy);
      const amt = parseFloat(t.value.replace(/,/g, ''));
      if (out) out.innerHTML = rate > 0 && !isNaN(amt) ? Math.round(ui.exDir === 'jpy' ? amt * rate / 100 : amt * 100 / rate).toLocaleString('ko-KR') : '<span class="none">—</span>';
    }
    if (t.dataset.input === 'mapq') doSearch(t.value);
    if (t.dataset.input === 'memo') {
      clearTimeout(memoTimer); const st = document.getElementById('memoState'); if (st) st.textContent = '저장 중…';
      memoTimer = setTimeout(() => { const m = store.get('memos', {}); m[ui.memoDate] = t.value; store.set('memos', m); if (st) st.textContent = '이 폰에 저장했어요 · ' + fmtStamp(Date.now()); }, 400);
    }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target; e.preventDefault();
    if (f.dataset.form === 'join') {
      const code = (f.code.value || '').trim();
      const need = D.trip.joinCode;
      if (!code) { ui.entryErr = '참여 코드를 넣어 주세요.'; rerender(false); return; }
      if (has(need) && code.toUpperCase() !== String(need).toUpperCase()) { ui.entryErr = '코드가 맞지 않아요. 선생님께 다시 확인해 주세요.'; store.set('code', code); rerender(false); return; }
      ui.entryErr = null; store.set('code', code); store.set('joined', true);
      if (cacheState.pct < 100) toast('저장이 끝나기 전이에요. 와이파이에서 잠시 더 켜 두세요.');
      location.hash = '#/home';
    }
    if (f.dataset.form === 'addItem') {
      const v = (f.item.value || '').trim(); if (!v) return;
      const mine = store.get('myChecklist', []); mine.push({ id: 'my-' + Date.now(), label: v }); store.set('myChecklist', mine); rerender(true);
      const inp = document.getElementById('newItem'); if (inp) inp.focus();
    }
  });
  // 일정: 옆으로 밀어 날짜 넘기기
  let sx = null, sy = null;
  document.addEventListener('touchstart', (e) => { if (e.target.closest('#swipe')) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else sx = null; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    const n = D.schedule.days.length || 3;
    const nd = ui.day + (dx < 0 ? 1 : -1); if (nd < 0 || nd >= n) return;
    ui.day = nd; ui.dayPicked = true; rerender(false);
  }, { passive: true });
  window.addEventListener('hashchange', () => { route(true); window.scrollTo(0, 0); });
  window.addEventListener('online', () => { refreshNotices(true).then(() => rerender(true)); refreshWeather(false); });
  window.addEventListener('offline', () => rerender(true));

  /* ================= 시작 ================= */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  loadData().then(() => { route(true); { const w = store.get('weather', null); if (navigator.onLine && (!w || Date.now() - (w.fetchedAt || 0) > 60 * 60 * 1000)) refreshWeather(false); } if (navigator.onLine) refreshNotices(true).then((ok) => { if (ok && /home|notices/.test(location.hash || '#/home')) rerender(true); }); });
})();
