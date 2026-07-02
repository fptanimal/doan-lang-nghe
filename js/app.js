// ============================================================
// APP.JS — Shared utilities, state, auth & marketplace
// ============================================================

const App = (() => {
  // Cấu hình URL Backend Hugging Face của bạn ở đây khi deploy lên Git/Vercel
  const RENDER_BACKEND_URL = 'https://lamnguyendang-bandolangapi.hf.space';

  // Tự động phát hiện local hay production để chuyển hướng API
  const API_BASE_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '[::1]' || location.hostname.endsWith('hf.space'))
    ? '' 
    : RENDER_BACKEND_URL;

  // ── Helper: Chờ Firebase Auth module load xong ──
  function waitForFirebase(timeoutMs = 5000) {
    return new Promise((resolve) => {
      if (window.FirebaseAuth) { resolve(window.FirebaseAuth); return; }
      const timer = setTimeout(() => { resolve(null); }, timeoutMs);
      window.addEventListener('firebase-auth-ready', () => {
        clearTimeout(timer);
        resolve(window.FirebaseAuth);
      }, { once: true });
    });
  }

  // Ghi đè (Monkeypatch) hàm fetch toàn cục để tự động gắn API_BASE_URL
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      url = API_BASE_URL + url;
    }
    return originalFetch(url, options);
  };

  const STORAGE_KEY = 'langNghe_v2';
  const AUTH_KEY = 'langNghe_auth';

  // ── State Management ──
  function getState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }

  function setState(data) {
    const current = getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
  }

  function clearGame() {
    const state = getState();
    const { highScore, playerName, totalGames, bestStreak, dailyStreak, lastPlayDate } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore, playerName, totalGames, bestStreak, dailyStreak, lastPlayDate }));
  }

  // ── Auth System (localStorage) ──
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('langNghe_users')) || []; } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem('langNghe_users', JSON.stringify(users));
  }

  // ── Seed default admin account ──
  function seedAdminAccount() {
    const users = getUsers();
    const adminExists = users.some(u => u.email === 'lam.nguyendang610@gmail.com');
    if (!adminExists) {
      users.push({
        id: 'admin_001',
        email: 'lam.nguyendang610@gmail.com',
        password: 'NDL08012006@',
        displayName: 'Quản trị viên',
        role: 'admin',
        badges: [],
        gamesPlayed: 0,
        bestScore: 0,
        dailyStreak: 0,
        createdAt: new Date().toISOString()
      });
      saveUsers(users);
    }
  }
  seedAdminAccount();

  function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  }

  async function register(email, password, displayName) {
    let attempts = 0;
    while (!window.FirebaseAuth && attempts < 30) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (!window.FirebaseAuth) {
      // Fallback local storage khi không có Firebase
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        return { success: false, error: 'Email này đã được sử dụng' };
      }
      const newUser = { id: 'local_' + Date.now(), uid: 'local_' + Date.now(), email, password, displayName: displayName || email.split('@')[0], role: email === 'lam.nguyendang610@gmail.com' ? 'admin' : 'customer' };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    }
    const result = await window.FirebaseAuth.registerWithEmail(email, password, displayName);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  }

  async function verifyOtp(email, password, displayName, otp) {
    return { success: false, error: 'Vui lòng sử dụng đăng ký qua Email hoặc Google' };
  }

  async function login(email, password) {
    // 1. Kiểm tra tài khoản local trước (admin, tài khoản vừa tạo, v.v.)
    const localUsers = getUsers();
    const localUser = localUsers.find(u => u.email === email && u.password === password);
    if (localUser) {
      setCurrentUser(localUser);
      return { success: true, user: localUser };
    }
    if (email === 'lam.nguyendang610@gmail.com' && password === 'NDL08012006@') {
      const adminUser = { id: 'admin_001', uid: 'admin_001', email, displayName: 'Quản trị viên', role: 'admin' };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    // 2. Chờ Firebase load
    let attempts = 0;
    while (!window.FirebaseAuth && attempts < 30) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!window.FirebaseAuth) {
      return { success: false, error: 'Sai email hoặc mật khẩu' };
    }
    try {
      const result = await window.FirebaseAuth.loginWithEmail(email, password);
      if (result.success) {
        setCurrentUser(result.user);
      }
      return result;
    } catch (e) {
      return { success: false, error: 'Sai email hoặc mật khẩu' };
    }
  }

  async function loginWithGoogle() {
    let attempts = 0;
    while (!window.FirebaseAuth && attempts < 30) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (!window.FirebaseAuth) {
      alert('Không thể kết nối dịch vụ Google Auth. Vui lòng thử đăng nhập bằng Email/Mật khẩu.');
      return;
    }
    const result = await window.FirebaseAuth.signInWithGoogle();
    if (result && result.success) {
      setCurrentUser(result.user);
      window.location.href = 'lobby.html';
    } else if (result && result.error) {
      alert(result.error);
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setState({ playerName: user.displayName });
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  async function logout() {
    if (window.FirebaseAuth) {
      await window.FirebaseAuth.firebaseSignOut();
    }
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('accessToken');
    window.location.href = 'index.html';
  }

  function updateUser(updates) {
    const user = getCurrentUser();
    if (!user) return;
    const updated = { ...user, ...updates };
    setCurrentUser(updated);
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) { users[idx] = updated; saveUsers(users); }
  }

  // ── Daily Streak ──
  function updateDailyStreak() {
    const user = getCurrentUser();
    if (!user) return;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastPlayDate === today) return;
    let streak = user.dailyStreak || 0;
    if (user.lastPlayDate === yesterday) { streak++; }
    else if (user.lastPlayDate !== today) { streak = 1; }
    updateUser({ dailyStreak: streak, lastPlayDate: today });
  }

  // ── Badges ──
  function checkBadges() {
    const user = getCurrentUser();
    if (!user) return [];
    const newBadges = [];
    const badges = user.badges || [];
    if (user.gamesPlayed >= 1 && !badges.includes('first_game')) { newBadges.push('first_game'); }
    if (user.gamesPlayed >= 10 && !badges.includes('veteran')) { newBadges.push('veteran'); }
    if ((user.dailyStreak || 0) >= 3 && !badges.includes('streak_3')) { newBadges.push('streak_3'); }
    if ((user.dailyStreak || 0) >= 7 && !badges.includes('streak_7')) { newBadges.push('streak_7'); }
    if ((user.villagesDiscovered || []).length >= 5 && !badges.includes('explorer_5')) { newBadges.push('explorer_5'); }
    if ((user.villagesDiscovered || []).length >= 10 && !badges.includes('explorer_all')) { newBadges.push('explorer_all'); }
    if (user.bestScore >= 400 && !badges.includes('high_scorer')) { newBadges.push('high_scorer'); }
    if (newBadges.length > 0) { updateUser({ badges: [...badges, ...newBadges] }); }
    return newBadges;
  }

  const BADGE_INFO = {
    first_game: { icon: '🎮', name: 'Khởi đầu', desc: 'Chơi trò chơi đầu tiên' },
    veteran: { icon: '🏅', name: 'Cựu binh', desc: 'Chơi 10 trò chơi' },
    streak_3: { icon: '🔥', name: 'Cháy 3 ngày', desc: 'Streak 3 ngày liên tiếp' },
    streak_7: { icon: '💎', name: 'Tuần lửa', desc: 'Streak 7 ngày liên tiếp' },
    explorer_5: { icon: '🗺️', name: 'Nhà thám hiểm', desc: 'Khám phá 5 làng nghề' },
    explorer_all: { icon: '👑', name: 'Bậc thầy', desc: 'Khám phá tất cả làng nghề' },
    high_scorer: { icon: '⭐', name: 'Cao thủ', desc: 'Đạt trên 400 điểm' }
  };

  // ── Navigation ──
  function navigate(page) { window.location.href = page; }

  // ── Formatting ──
  function formatScore(score) { return score.toString().padStart(6, '0'); }

  // ── High Score ──
  function getHighScore() { return getState().highScore || 0; }
  function updateHighScore(score) {
    const current = getHighScore();
    if (score > current) { setState({ highScore: score }); return true; }
    return false;
  }

  // ── Leaderboard ──
  function addToLeaderboard(name, score, correct, total) {
    const state = getState();
    const board = state.leaderboard || [];
    board.push({ name, score, correct, total, date: new Date().toLocaleDateString('vi-VN'), timestamp: Date.now() });
    board.sort((a, b) => b.score - a.score);
    setState({ leaderboard: board.slice(0, 20) });
  }

  function getLeaderboard() { return getState().leaderboard || []; }

  // ── Confetti ──
  function launchConfetti() {
    const colors = ['#C0533A', '#E8B84B', '#2D6A4F', '#F5EFE0', '#E07020'];
    for (let i = 0; i < 80; i++) createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }

  function createConfettiPiece(color) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `position:fixed;width:${Math.random()*10+5}px;height:${Math.random()*6+4}px;background:${color};left:${Math.random()*100}vw;top:-20px;border-radius:2px;z-index:9999;animation:confettiFall ${Math.random()*2+2}s linear forwards;transform:rotate(${Math.random()*360}deg);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  // ── Sound ──
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'correct') { osc.frequency.setValueAtTime(523, ctx.currentTime); osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); }
      else if (type === 'wrong') { osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15); }
      else if (type === 'click') { osc.frequency.setValueAtTime(440, ctx.currentTime); }
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // ── Shared Navigation Bar ──
  function renderNavbar(activePage) {
    const user = getCurrentUser();
    const nav = document.getElementById('main-navbar');
    if (!nav) return;
    const isHome = activePage === 'home';
    nav.className = 'main-navbar';
    nav.innerHTML = `
      <div class="navbar-inner">
        <a href="index.html" class="navbar-logo" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
          <span style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; color:#c58e4a;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </span>
          <div style="display:flex; flex-direction:column; justify-content:center;">
            <span style="font-family:var(--rd-font-serif); font-size:1.4rem; font-weight:800; color:#c58e4a; line-height:1;">BandoLang</span>
            <span style="font-family:var(--rd-font-sans); font-size:0.6rem; color:#c58e4a; margin-top:2px; letter-spacing:0.5px; opacity: 0.8;">Kết nối tinh hoa - Lan tỏa văn hóa</span>
          </div>
        </a>
        <nav class="navbar-links">
          <a href="index.html" class="${activePage==='home'?'active':''}">Trang chủ</a>
          <a href="marketplace.html" class="${activePage==='marketplace'?'active':''}">Marketplace</a>
          <a href="vr360.html" class="${activePage==='vr'?'active':''}">VR 360°</a>
          <a href="lobby.html" class="${activePage==='game'?'active':''}">Game</a>
          <a href="artisans.html" class="${activePage==='artisans'?'active':''}">Nghệ nhân</a>
          <a href="tours.html" class="${activePage==='tours'?'active':''}">Tour</a>
          ${user && user.role === 'admin' ? `<a href="admin.html" class="${activePage==='admin'?'active':''}" style="color:#e8b84b;">Admin</a>` : ''}
        </nav>
            <div class="navbar-actions" style="display:flex; align-items:center;">
          ${user ? `
            <a href="marketplace.html" class="nav-icon" title="Giỏ hàng">
              <i data-lucide="shopping-cart" style="width:20px;height:20px;color:var(--ink);"></i>
            </a>
            
            <div class="nav-icon noti-trigger" onclick="App.toggleNotifications(event)" title="Thông báo">
              <i data-lucide="bell" style="width:20px;height:20px;color:var(--ink);"></i>
              <span id="notification-badge" style="position:absolute;top:-6px;right:-8px;background:#ef4444;color:#fff;font-size:0.65rem;font-weight:800;width:18px;height:18px;border-radius:50%;display:none;align-items:center;justify-content:center;">0</span>
              <div id="notification-dropdown" class="notification-dropdown" style="display:none; position:absolute; top:40px; right:-10px; width:320px; background:#fff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.1); border:1px solid #eee; z-index:100; max-height:400px; overflow-y:auto; cursor:default;" onclick="event.stopPropagation()">
                <div style="padding:16px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; background:rgba(255,255,255,0.95); backdrop-filter:blur(4px); z-index:10;">
                  <span style="font-size:1.1rem; font-weight:700; color:#222;">Thông báo</span>
                  <span style="font-size:0.85rem; color:var(--terracotta); cursor:pointer;" onclick="App.markAllNotificationsRead()">Đánh dấu đã đọc</span>
                </div>
                <div id="notification-list" style="display:flex; flex-direction:column;">
                  <div style="padding:24px; text-align:center; color:#888; font-size:0.9rem;">Đang tải...</div>
                </div>
              </div>
            </div>

            <a href="profile.html" class="navbar-user">
              <span class="navbar-avatar">${(user.displayName||'?').charAt(0).toUpperCase()}</span>
              <span class="navbar-username">${user.displayName}</span>
            </a>
          ` : `
            <a href="login.html" class="btn btn-ghost btn-sm" style="padding:8px 20px;font-size:0.85rem; border-color: rgba(0,0,0,0.1);">Đăng nhập</a>
            <a href="lobby.html" class="btn btn-primary btn-sm" style="padding:8px 24px;font-size:0.85rem; border-radius:20px;">Bắt đầu</a>
          `}
        </div>
        <button class="navbar-toggle" onclick="document.querySelector('.navbar-links').classList.toggle('open')">☰</button>
      </div>
    `;

    // Removed transparent scroll logic
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Fetch initial notifications if logged in
    if (user) {
      setTimeout(fetchNotifications, 500);
      if (!window._notiInterval) {
        window._notiInterval = setInterval(fetchNotifications, 30000); // Poll every 30s
      }
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const drop = document.getElementById('notification-dropdown');
    if (drop && drop.style.display === 'block') {
      drop.style.display = 'none';
    }
  });

  function toggleNotifications(e) {
    e.stopPropagation();
    const drop = document.getElementById('notification-dropdown');
    if (drop) {
      drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
    }
  }

  async function fetchNotifications() {
    // Luôn tải từ localStorage trước để hiển thị ngay
    let notifs = JSON.parse(localStorage.getItem('user_notifications') || '[]');
    renderNotifications(notifs);

    const user = getCurrentUser();
    if (!user) return;
    
    // Chờ Firebase module load xong
    const fb = await waitForFirebase(3000);
    if (!fb) return;
    
    try {
      const { db, firestore } = fb;
      const notifRef = firestore.collection(db, 'notifications');
      const q = firestore.query(notifRef, firestore.where('userId', '==', user.uid), firestore.orderBy('createdAt', 'desc'));
      
      firestore.onSnapshot(q, (snapshot) => {
        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          if (!notifs.some(n => n.id === data.id)) {
            notifs.push(data);
          }
        });
        notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderNotifications(notifs);
      }, (err) => {
        console.warn('Notification query error:', err.message);
      });
    } catch (e) { console.error('Lỗi tải thông báo', e); }
  }

  function renderNotifications(notifs) {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');
    if (!list || !badge) return;

    const unreadCount = notifs.filter(n => !n.is_read).length;
    
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }

    if (notifs.length === 0) {
      list.innerHTML = '<div style="padding:32px; text-align:center; color:#888; font-size:0.9rem;">Không có thông báo nào.</div>';
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div onclick="App.handleNotificationClick('${n.id}', '${n.order_id || ''}')" style="padding:16px; border-bottom:1px solid #eee; display:flex; gap:12px; cursor:pointer; transition:0.2s; background:${n.is_read ? '#fff' : '#f4fbf8'};" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='${n.is_read ? '#fff' : '#f4fbf8'}'">
        <div style="font-size:1.5rem; color:var(--gray);"><i data-lucide="package" style="width:32px;height:32px;"></i></div>
        <div>
          <div style="font-size:0.95rem; font-weight:${n.is_read ? '600' : '700'}; color:#222; margin-bottom:4px; line-height:1.4;">${n.title}</div>
          <div style="font-size:0.85rem; color:#666; margin-bottom:6px; line-height:1.5;">${n.message}</div>
          <div class="step-time">${n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div>
        </div>
      </div>
    `).join('');
  }

  async function handleNotificationClick(id, orderId) {
    if (window.FirebaseAuth) {
      const { db, firestore } = window.FirebaseAuth;
      firestore.updateDoc(firestore.doc(db, 'notifications', id), { is_read: true });
    }
    if (orderId) {
      window.location.href = 'order-tracking.html?id=' + orderId;
    }
  }

  async function markAllNotificationsRead() {
    if (!window.FirebaseAuth) return;
    const user = getCurrentUser();
    if (!user) return;
    
    const { db, firestore } = window.FirebaseAuth;
    const notifRef = firestore.collection(db, 'notifications');
    const q = firestore.query(notifRef, firestore.where('userId', '==', user.uid), firestore.where('is_read', '==', false));
    const snap = await firestore.getDocs(q);
    
    snap.forEach(doc => {
      firestore.updateDoc(doc.ref, { is_read: true });
    });
  }

  return {
    getState, setState, clearGame, navigate, formatScore,
    getHighScore, updateHighScore, addToLeaderboard, getLeaderboard,
    launchConfetti, playSound,
    register, verifyOtp, login, loginWithGoogle, logout, getCurrentUser, isLoggedIn, isAdmin, updateUser,
    updateDailyStreak, checkBadges, BADGE_INFO,
    renderNavbar, toggleNotifications, handleNotificationClick, markAllNotificationsRead
  };
})();

// Automatically inject and trigger curtain, scroll reveal, and navbar scroll effects for all pages
document.addEventListener('DOMContentLoaded', () => {
  // Curtain animation
  if (!document.getElementById('page-curtain')) {
    const curtainHtml = `
<div class="curtain-container" id="page-curtain">
  <div class="curtain-panel"></div>
  <div class="curtain-panel right"></div>
</div>`;
    document.body.insertAdjacentHTML('afterbegin', curtainHtml);
  }
  
  setTimeout(() => {
    const curtain = document.getElementById('page-curtain');
    if (curtain) curtain.classList.add('open');
  }, 100);

  // Scroll reveals
  const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
  if ('IntersectionObserver' in window && reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('revealed'));
  }

  // Dynamic navbar scrolled class
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    const checkScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check initially
  }
});
