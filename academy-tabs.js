/* ── Monster Hoops Academy Tab Bar ── */
(function () {
  'use strict';

  const ADMIN_EMAILS = ['monsterhoops.official@gmail.com'];
  const TABS = [
    { id: 'home',    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`, label: '홈',    href: 'index.html' },
    { id: 'classes', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`, label: '수업',   href: 'classes.html' },
    { id: 'chat',    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.55 20.55 16 20 16H8L4 20V5C4 4.45 4.45 4 5 4H20C20.55 4 21 4.45 21 5V15Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`, label: '채팅',   href: 'messages.html' },
    { id: 'mypage',  icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, label: '마이',   href: 'mypage.html' },
  ];

  /* 현재 페이지 ID 추정 */
  function currentPageId() {
    const p = location.pathname.split('/').pop().replace('.html','');
    if (p === 'index' || p === '' || p === 'online_academy') return 'home';
    return p; // classes, messages, mypage
  }

  /* CSS 주입 */
  function injectStyle() {
    const s = document.createElement('style');
    s.textContent = `
      #mh-academy-tabbar {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 8000;
        background: rgba(28,28,30,.92);
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        border-top: 1px solid rgba(255,255,255,.08);
        display: flex; align-items: stretch;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        transform: translateY(100%);
        transition: transform .4s cubic-bezier(.22,1,.36,1);
      }
      #mh-academy-tabbar.visible { transform: translateY(0); }
      .mh-tab-btn {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 3px; padding: 10px 0 8px;
        color: rgba(255,255,255,.35); cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: color .2s;
        position: relative;
      }
      .mh-tab-btn.active { color: #4ade80; }
      .mh-tab-btn svg { transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
      .mh-tab-btn.active svg { transform: scale(1.08); }
      .mh-tab-label { font-size: 10px; font-weight: 700; letter-spacing: -.01em; font-family: 'Pretendard Variable', sans-serif; }
      .mh-tab-badge {
        position: absolute; top: 7px; right: calc(50% - 14px);
        background: #ff453a; color: #fff; font-size: 9px; font-weight: 800;
        border-radius: 99px; min-width: 16px; height: 16px;
        display: flex; align-items: center; justify-content: center;
        padding: 0 4px; font-family: 'Pretendard Variable', sans-serif;
        border: 1.5px solid rgba(28,28,30,.9);
      }
      /* 탭바 있을 때 pb 추가 보정 */
      body.has-academy-tabs .pb {
        height: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
      }
      /* 플로팅 버튼 탭바 위로 올리고 좌측 유지 */
      body.has-academy-tabs #mh-float-auth {
        bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
        left: 16px !important;
        right: auto !important;
      }
    `;
    document.head.appendChild(s);
  }

  /* 탭바 DOM 생성 */
  function buildTabBar() {
    const bar = document.createElement('div');
    bar.id = 'mh-academy-tabbar';
    const active = currentPageId();
    TABS.forEach(tab => {
      const btn = document.createElement('div');
      btn.className = 'mh-tab-btn' + (tab.id === active ? ' active' : '');
      btn.dataset.tab = tab.id;
      btn.innerHTML = tab.icon +
        `<span class="mh-tab-label">${tab.label}</span>`;
      btn.addEventListener('click', () => {
        if (tab.id === active) return;
        location.href = tab.href;
      });
      bar.appendChild(btn);
    });
    document.body.appendChild(bar);
    document.body.classList.add('has-academy-tabs');
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('visible')));
    return bar;
  }

  /* 배지 업데이트 (채팅 미읽음) */
  window.mhSetTabBadge = function(tabId, count) {
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (!btn) return;
    let badge = btn.querySelector('.mh-tab-badge');
    if (!count) { badge?.remove(); return; }
    if (!badge) { badge = document.createElement('div'); badge.className = 'mh-tab-badge'; btn.appendChild(badge); }
    badge.textContent = count > 99 ? '99+' : count;
  };

  /* 초기화 — Firebase Auth 체크 후 아카데미 회원만 노출 */
  function init() {
    const isOnline = navigator.onLine !== false;
    if (!isOnline) return;

    const base = location.pathname.replace(/\/[^/]*$/, '/');
    import(base + 'firebase-config.js').then(({ auth, db }) => {
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(({ doc, getDoc }) => {

          onAuthStateChanged(auth, async user => {
            const existing = document.getElementById('mh-academy-tabbar');
            if (!user) { existing?.remove(); document.body.classList.remove('has-academy-tabs'); return; }

            // 어드민은 memberType 체크 없이 바로 표시
            if (ADMIN_EMAILS.includes(user.email)) {
              if (!existing) buildTabBar();
              return;
            }

            // Firestore에서 memberType 확인
            try {
              const snap = await getDoc(doc(db, 'users', user.uid));
              const memberType = snap.exists() ? snap.data().memberType : 'online';
              if (memberType !== 'academy') { existing?.remove(); document.body.classList.remove('has-academy-tabs'); return; }
            } catch(e) {
              console.warn('[academy-tabs] Firestore error:', e);
              return;
            }

            if (!existing) buildTabBar();
          });
        });
      });
    }).catch(() => {});
  }

  injectStyle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
