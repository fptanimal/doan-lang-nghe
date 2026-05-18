// ============================================================
// HISTORY-CHAPTER.JS — Logic cho chế độ xem video lịch sử
// ============================================================

const HistoryChapter = (() => {
  let sessionData = {};
  let currentVillage = null;
  let questions = [];
  let currentQIndex = 0;
  let chapterScore = 0;
  let isAnswered = false;

  function init() {
    // Lấy dữ liệu session từ localStorage/sessionStorage
    const savedData = sessionStorage.getItem('historyChapterState');
    if (!savedData) {
      alert("Không tìm thấy dữ liệu tiến trình. Quay lại sảnh.");
      window.location.href = 'lobby.html';
      return;
    }

    try {
      sessionData = JSON.parse(savedData);
    } catch (e) {
      window.location.href = 'lobby.html';
      return;
    }

    const { villageId, chapterIndex, totalScore } = sessionData;
    currentVillage = getVillageById(villageId);
    
    if (!currentVillage) {
      window.location.href = 'lobby.html';
      return;
    }

    chapterScore = totalScore || 0;
    document.getElementById('chapter-score').textContent = chapterScore;
    
    document.getElementById('chapter-title').textContent = `Chương ${chapterIndex}`;
    document.getElementById('village-name').textContent = currentVillage.name;
    
    if (currentVillage.video) {
      document.getElementById('history-video').src = currentVillage.video;
    }

    questions = currentVillage.historyQuestions || [];
    if (questions.length === 0) {
      document.getElementById('question-text').textContent = "Làng nghề này chưa có câu hỏi lịch sử.";
    } else {
      currentQIndex = 0;
      renderQuestion();
    }
  }

  function renderQuestion() {
    if (currentQIndex >= questions.length) {
      finishChapter();
      return;
    }

    const q = questions[currentQIndex];
    isAnswered = false;
    
    document.getElementById('question-progress').textContent = `Câu hỏi ${currentQIndex + 1}/${questions.length}`;
    document.getElementById('question-text').textContent = q.q;
    
    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    
    document.getElementById('next-q-btn').style.display = 'none';

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = optText;
      btn.onclick = () => selectOption(index, btn);
      optionsGrid.appendChild(btn);
    });
  }

  function selectOption(selectedIndex, btnElement) {
    if (isAnswered) return;
    isAnswered = true;
    
    const q = questions[currentQIndex];
    const optionsGrid = document.getElementById('options-grid');
    const allBtns = optionsGrid.querySelectorAll('.option-btn');
    
    allBtns.forEach(b => b.disabled = true);
    
    if (selectedIndex === q.answer) {
      btnElement.classList.add('correct');
      chapterScore += 50;
      document.getElementById('chapter-score').textContent = chapterScore;
      if (typeof App !== 'undefined' && App.playSound) App.playSound('correct');
      if (typeof App !== 'undefined' && App.launchConfetti) App.launchConfetti();
    } else {
      btnElement.classList.add('wrong');
      allBtns[q.answer].classList.add('correct'); // Show correct answer
      if (typeof App !== 'undefined' && App.playSound) App.playSound('wrong');
    }
    
    const nextBtn = document.getElementById('next-q-btn');
    nextBtn.style.display = 'block';
    nextBtn.textContent = currentQIndex >= questions.length - 1 ? 'Hoàn thành Chương ⟶' : 'Câu tiếp theo ⟶';
  }

  function nextQuestion() {
    currentQIndex++;
    renderQuestion();
  }

  function finishChapter() {
    // Cập nhật lại sessionStorage cho game.js
    sessionData.totalScore = chapterScore;
    sessionData.chapterFinished = true;
    sessionStorage.setItem('historyChapterState', JSON.stringify(sessionData));
    
    // Quay lại game.js để tiếp tục (game.js sẽ đọc sessionStorage và sang câu tiếp theo)
    window.location.href = 'game.html';
  }

  window.exitChapter = function() {
    if (confirm("Bạn có chắc muốn thoát tiến trình hiện tại?")) {
      sessionStorage.removeItem('historyChapterState');
      window.location.href = 'lobby.html';
    }
  }

  return {
    init,
    nextQuestion
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  HistoryChapter.init();
});
