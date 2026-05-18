// ============================================================
// APP.JS — Shared utilities, state, auth & marketplace
// ============================================================

const App = (() => {
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

  function register(email, password, displayName) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { success: false, error: 'Email đã tồn tại' };
    const user = {
      id: 'u_' + Date.now(),
      email,
      password: btoa(password),
      displayName: displayName || email.split('@')[0],
      avatar: null,
      createdAt: new Date().toISOString(),
      badges: [],
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      dailyStreak: 0,
      lastPlayDate: null,
      villagesDiscovered: [],
      purchaseHistory: []
    };
    users.push(user);
    saveUsers(users);
    setCurrentUser(user);
    return { success: true, user };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { success: false, error: 'Email hoặc mật khẩu không đúng' };
    setCurrentUser(user);
    return { success: true, user };
  }

  function loginWithGoogle() {
    const mockUser = {
      id: 'u_google_' + Date.now(),
      email: 'user@gmail.com',
      displayName: 'Người dùng Google',
      avatar: null,
      createdAt: new Date().toISOString(),
      badges: [],
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      dailyStreak: 0,
      lastPlayDate: null,
      villagesDiscovered: [],
      purchaseHistory: []
    };
    const users = getUsers();
    users.push(mockUser);
    saveUsers(users);
    setCurrentUser(mockUser);
    return { success: true, user: mockUser };
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

  function logout() {
    localStorage.removeItem(AUTH_KEY);
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
    nav.className = 'main-navbar' + (isHome ? ' navbar-dark' : '');
    nav.innerHTML = `
      <div class="navbar-inner">
        <a href="index.html" class="navbar-logo">
          <span class="navbar-logo-icon">🔥</span>
          <span class="navbar-logo-text">Làng Nghề</span>
        </a>
        <nav class="navbar-links">
          <a href="index.html" class="${activePage==='home'?'active':''}">Trang chủ</a>
          <a href="lobby.html" class="${activePage==='lobby'?'active':''}">Chơi game</a>
          <a href="leaderboard.html" class="${activePage==='leaderboard'?'active':''}">Xếp hạng</a>
          <a href="marketplace.html" class="${activePage==='marketplace'?'active':''}">Marketplace</a>
        </nav>
        <div class="navbar-actions">
          ${user ? `
            <a href="profile.html" class="navbar-user">
              <span class="navbar-avatar">${(user.displayName||'?').charAt(0).toUpperCase()}</span>
              <span class="navbar-username">${user.displayName}</span>
            </a>
          ` : `
            <a href="login.html" class="btn btn-sm ${isHome ? 'btn-outline-light' : 'btn-primary'}" style="padding:8px 20px;font-size:0.85rem;">Đăng nhập</a>
          `}
        </div>
        <button class="navbar-toggle" onclick="document.querySelector('.navbar-links').classList.toggle('open')">☰</button>
      </div>
    `;
  }

  return {
    getState, setState, clearGame, navigate, formatScore,
    getHighScore, updateHighScore, addToLeaderboard, getLeaderboard,
    launchConfetti, playSound,
    register, login, loginWithGoogle, logout, getCurrentUser, isLoggedIn, updateUser,
    updateDailyStreak, checkBadges, BADGE_INFO,
    renderNavbar
  };
})();

// Automatically inject and trigger curtain animation for all pages
document.addEventListener('DOMContentLoaded', () => {
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
});
