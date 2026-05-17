// ============================================================
// GAME.JS — Game logic: questions, timer, scoring
// ============================================================

const Game = (() => {
  let state = {
    villages: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    clueIndex: 0,
    answered: false,
    results: [],
    timerValue: 30,
    timerInterval: null,
    totalQuestions: 5
  };

  const POINTS = {
    clue1: 100,
    clue2: 75,
    clue3: 50,
    clue4: 25,
    timeBonus: 2  // per second remaining
  };

  function init() {
    const saved = App.getState();
    state.villages = getRandomVillages(state.totalQuestions);
    state.score = 0;
    state.streak = 0;
    state.clueIndex = 0;
    state.currentIndex = 0;
    state.answered = false;
    state.results = [];
    state.revealed = false;

    // Bind form submit
    const form = document.getElementById('answer-form');
    if (form) {
      form.removeEventListener('submit', handleAnswerSubmit);
      form.addEventListener('submit', handleAnswerSubmit);
    }

    App.setState({ gameInProgress: true, currentSession: null });
    renderQuestion();
  }

  function renderQuestion() {
    if (state.currentIndex >= state.villages.length) {
      endGame();
      return;
    }

    const village = state.villages[state.currentIndex];
    state.clueIndex = 0;
    state.answered = false;
    state.revealed = false;

    // Update progress
    updateProgress();

    // Show product image (background)
    renderProductImage(village);

    // Mascot intro & clue
    if (typeof Mascot !== 'undefined') {
      Mascot.speak('idle', 'Sẵn sàng chưa? Hãy xem kỹ hình ảnh nhé!');
    }
    // Call renderClue after a small delay regardless of Mascot
    setTimeout(() => renderClue(village), typeof Mascot !== 'undefined' ? 2000 : 500);

    // Hide result area & reset inputs
    const resultArea = document.getElementById('result-area');
    if (resultArea) resultArea.style.display = 'none';
    
    const inputEl = document.getElementById('answer-input');
    if (inputEl) {
      inputEl.value = '';
      inputEl.disabled = false;
      inputEl.focus();
    }
    const submitBtn = document.getElementById('submit-answer-btn');
    if (submitBtn) submitBtn.disabled = false;

    // Start timer
    startTimer();
  }

  function renderProductImage(village) {
    const bg = document.getElementById('dynamic-game-bg');
    const vrBtn = document.getElementById('vr-btn');
    
    // Xóa ảnh nền ở màn hình game theo yêu cầu của user
    if (bg) {
      bg.style.backgroundImage = 'none';
      bg.innerHTML = '';
    }
    
    if (village.panorama) {
      window.currentPanoramaUrl = village.panorama;
      if (vrBtn) vrBtn.style.display = 'none'; // Ẩn nút VR vì sẽ hiển thị thẳng vào nền
      
      if (typeof VR360 !== 'undefined') {
        VR360.init('dynamic-game-bg', village.panorama);
      }
    } else {
      window.currentPanoramaUrl = null;
      if (vrBtn) vrBtn.style.display = 'none';
      if (window.VR360) VR360.destroy();
    }
  }

  function renderClue(village) {
    const clue = village.clues[state.clueIndex];
    if (typeof Mascot !== 'undefined') Mascot.speak('thinking', `Gợi ý ${state.clueIndex + 1}/${village.clues.length}: ${clue}`);
    const hintDisplay = document.getElementById('hg-hint-display');
    if (hintDisplay) {
      hintDisplay.textContent = `💡 Gợi ý: ${clue}`;
    }
  }

  function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]/g, "");
  }

  function handleAnswerSubmit(e) {
    if (e) e.preventDefault();
    if (state.revealed) return;

    const inputEl = document.getElementById('answer-input');
    const answer = inputEl.value.trim();
    if (!answer) return;

    const currentVillage = state.villages[state.currentIndex];
    const normalizedInput = normalizeString(answer);
    const normalizedCorrect = normalizeString(currentVillage.name);
    
    // Allow partial match if the user types a significant part of the name
    const isCorrect = normalizedCorrect.includes(normalizedInput) && normalizedInput.length >= 4;

    if (isCorrect) {
      inputEl.disabled = true;
      const submitBtn = document.getElementById('submit-answer-btn');
      if(submitBtn) submitBtn.disabled = true;

      stopTimer();
      state.revealed = true;
      state.answered = true;

      const points = Math.max(10, 100 - (state.clueIndex * 20));
      state.score += points;
      state.streak++;
      document.getElementById('score').textContent = App.formatScore(state.score);
      updateStreakUI(state.streak);
      if (typeof Mascot !== 'undefined') Mascot.speak('correct', `Chính xác! Đó là ${currentVillage.name}. +${points} điểm!`);
      App.launchConfetti();
      
      state.results.push({
        villageId: currentVillage.id,
        villageName: currentVillage.name,
        location: currentVillage.location,
        correct: true,
        pointsEarned: points,
        clueUsed: state.clueIndex + 1,
        timeout: false
      });

      showResultArea(currentVillage, true);
    } else {
      state.streak = 0;
      updateStreakUI(0);
      inputEl.value = '';
      inputEl.focus();
      if (typeof Mascot !== 'undefined') Mascot.speak('wrong', `Chưa đúng! Hãy thử lại hoặc xin thêm gợi ý.`);
    }
  }

  window.nextQuestion = function() {
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');
    state.currentIndex++;
    if (nextBtn) nextBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = 'inline-block';
    renderQuestion();
  };

  function showResultArea(village, isCorrect) {
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.style.display = 'none';
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = state.currentIndex >= state.villages.length - 1 ? '🏁 Xem kết quả' : 'Câu tiếp theo →';
    }

    const resultArea = document.getElementById('result-area');
    if (resultArea) {
      document.getElementById('reveal-name').textContent = village.name;
      document.getElementById('reveal-location').textContent = village.location;
      document.getElementById('reveal-desc').textContent = village.description;
      document.getElementById('reveal-fact').textContent = '💡 ' + village.funFact;
      resultArea.style.display = 'block';

      // Show marketplace suggestions
      const products = village.products || [];
      const suggestEl = document.getElementById('game-marketplace-suggest');
      const suggestProducts = document.getElementById('suggest-products');
      if (suggestEl && suggestProducts && products.length > 0) {
        suggestProducts.innerHTML = '';
        products.slice(0, 2).forEach(p => {
          const card = document.createElement('div');
          card.className = 'suggest-product-card';
          card.style.background = 'rgba(255,255,255,0.1)';
          card.style.border = '1px solid rgba(255,255,255,0.2)';
          card.innerHTML = `
            <div class="suggest-product-img" style="background-image:url('${p.image}')"></div>
            <div class="suggest-product-info" style="color:white;">
              <h5 style="color:white;">${p.name}</h5>
              <p style="color:rgba(255,255,255,0.7);">${p.artisan}</p>
              <div class="suggest-price">${formatPrice(p.price)}</div>
            </div>
          `;
          card.onclick = () => window.open('marketplace.html', '_blank');
          suggestProducts.appendChild(card);
        });
        suggestEl.style.display = 'block';
      } else {
        if(suggestEl) suggestEl.style.display = 'none';
      }
    }
  }

  function skipQuestion() {
    if (state.revealed) return;
    const village = state.villages[state.currentIndex];
    
    stopTimer();
    state.revealed = true;
    state.streak = 0;
    updateStreakUI(0);
    
    state.results.push({
      villageId: village.id,
      villageName: village.name,
      location: village.location,
      correct: false,
      pointsEarned: 0,
      clueUsed: state.clueIndex + 1,
      timeout: false
    });

    if (typeof Mascot !== 'undefined') Mascot.speak('wrong', 'Đã bỏ qua! Đáp án là ' + village.name);
    
    // Disable inputs
    const inputEl = document.getElementById('answer-input');
    if (inputEl) inputEl.disabled = true;
    const submitBtn = document.getElementById('submit-answer-btn');
    if (submitBtn) submitBtn.disabled = true;

    showResultArea(village, false);
  }

  function useHint() {
    const village = state.villages[state.currentIndex];
    if (state.answered || state.clueIndex >= village.clues.length - 1) return;
    state.clueIndex++;
    renderClue(village);
    if (typeof Mascot !== 'undefined') Mascot.speak('hint');
  }

  function startTimer() {
    state.timerValue = 30;
    updateTimerDisplay();

    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timerValue--;
      updateTimerDisplay();
      if (state.timerValue <= 0) {
        stopTimer();
        if (!state.answered) timeOut();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  function timeOut() {
    const village = state.villages[state.currentIndex];
    state.answered = true;
    state.streak = 0;
    state.revealed = true;
    updateStreakUI(0);

    state.results.push({
      villageId: village.id,
      villageName: village.name,
      location: village.location,
      correct: false,
      pointsEarned: 0,
      clueUsed: state.clueIndex + 1,
      timeout: true
    });

    // Disable inputs
    const inputEl = document.getElementById('answer-input');
    if (inputEl) inputEl.disabled = true;
    const submitBtn = document.getElementById('submit-answer-btn');
    if (submitBtn) submitBtn.disabled = true;

    if (typeof Mascot !== 'undefined') Mascot.speak('wrong', 'Hết giờ rồi! Đáp án là ' + village.name);
    showResultArea(village, false);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-value');
    const timerBar = document.getElementById('timer-bar');
    if (timerEl) timerEl.textContent = state.timerValue;
    if (timerBar) {
      const pct = (state.timerValue / 30) * 100;
      timerBar.style.width = pct + '%';
      timerBar.style.background = state.timerValue > 15 ? '#2D6A4F' : state.timerValue > 8 ? '#E8B84B' : '#C0533A';
    }
  }

  function updateStreakUI(streak) {
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = streak;
    if (streak > state.bestStreak) state.bestStreak = streak;
  }

  function updateProgress() {
    const progBar = document.getElementById('hg-progress-bar');
    if (progBar) {
      progBar.innerHTML = '';
      for (let i = 0; i < state.villages.length; i++) {
        const dash = document.createElement('div');
        dash.className = 'hg-progress-dash';
        if (i <= state.currentIndex) {
          dash.classList.add('active');
        }
        progBar.appendChild(dash);
      }
    }
  }

  function endGame() {
    stopTimer();
    const isHighScore = App.updateHighScore(state.score);
    const correct = state.results.filter(r => r.correct).length;

    App.setState({
      lastGameScore: state.score,
      lastGameResults: state.results,
      lastGameCorrect: correct,
      lastGameTotal: state.villages.length,
      lastGameStreak: state.bestStreak,
      isHighScore: isHighScore,
      gameInProgress: false
    });

    // Save to leaderboard
    const appState = App.getState();
    const playerName = appState.playerName || 'Khách';
    App.addToLeaderboard(playerName, state.score, correct, state.villages.length);

    setTimeout(() => App.navigate('result.html'), 500);
  }

  return { init, useHint, getScore: () => state.score, getStreak: () => state.streak };
})();
