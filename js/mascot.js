// ============================================================
// MASCOT.JS — Nhân vật Lửa (Fire Mascot) cho nền tảng Làng Nghề
// ============================================================

const Mascot = (() => {
  let container = null;
  
  // Trạng thái biểu cảm của Ngọn Lửa
  const expressions = {
    idle: {
      eyes: '<path d="M 25,45 Q 30,40 35,45 M 65,45 Q 60,40 55,45" fill="none" stroke="#5C1605" stroke-width="4" stroke-linecap="round"/>',
      mouth: '<path d="M 38,60 Q 45,70 52,60" fill="none" stroke="#5C1605" stroke-width="3" stroke-linecap="round"/>',
      message: 'Xin chào! Bắt đầu khám phá nhé!',
      color: '#FF6B35', // Lửa cam bình thường
      inner: '#FFC857'
    },
    thinking: {
      eyes: '<circle cx="30" cy="45" r="5" fill="#5C1605"/><circle cx="60" cy="45" r="5" fill="#5C1605"/><circle cx="30" cy="45" r="2" fill="white"/><circle cx="60" cy="45" r="2" fill="white"/>',
      mouth: '<path d="M 40,65 Q 45,65 50,65" fill="none" stroke="#5C1605" stroke-width="3" stroke-linecap="round"/>',
      message: 'Hmm... Câu này hơi khó nha...',
      color: '#E07020',
      inner: '#F2D06B'
    },
    correct: {
      eyes: '<path d="M 25,48 Q 30,35 35,48 M 65,48 Q 60,35 55,48" fill="none" stroke="#5C1605" stroke-width="4" stroke-linecap="round"/>',
      mouth: '<path d="M 35,60 Q 45,75 55,60" fill="#5C1605" stroke="#5C1605" stroke-width="2"/><path d="M 40,65 Q 45,70 50,65" fill="#FF8BA7"/>',
      message: 'Chính xác! Cậu giỏi quá!',
      color: '#FF4D4D', // Lửa rực rỡ
      inner: '#FFD166'
    },
    wrong: {
      eyes: '<path d="M 25,40 L 35,45 M 65,40 L 55,45" fill="none" stroke="#5C1605" stroke-width="4" stroke-linecap="round"/>',
      mouth: '<circle cx="45" cy="65" r="4" fill="#5C1605"/>',
      message: 'Ôi tiếc quá, sai mất rồi...',
      color: '#C0533A', // Lửa tối đi
      inner: '#E8B84B'
    }
  };

  function init(elementId) {
    container = document.getElementById(elementId);
    if (!container) return;
    
    // Thêm style animation cho lửa vào head nếu chưa có
    if (!document.getElementById('mascot-styles')) {
      const style = document.createElement('style');
      style.id = 'mascot-styles';
      style.innerHTML = `
        @keyframes flameFlicker {
          0% { transform: scale(1) translateY(0) rotate(0deg); }
          25% { transform: scale(1.02, 0.98) translateY(2px) rotate(1deg); }
          50% { transform: scale(0.98, 1.05) translateY(-3px) rotate(-1deg); }
          75% { transform: scale(1.05, 0.95) translateY(1px) rotate(2deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes innerFlame {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(0.9) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes sparks {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-20px) scale(0.5); }
        }
        .mascot-fire {
          animation: flameFlicker 2s infinite ease-in-out;
          transform-origin: bottom center;
        }
        .mascot-fire-inner {
          animation: innerFlame 1.5s infinite ease-in-out;
          transform-origin: bottom center;
        }
        .mascot-spark {
          animation: sparks 1.5s infinite linear;
          transform-origin: center;
        }
        .mascot-container-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          filter: drop-shadow(0 10px 15px rgba(255, 107, 53, 0.3));
        }
        .mascot-bubble {
          background: white;
          color: #5C1605;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 600;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 180px;
          text-align: center;
          animation: slideInDown 0.3s ease-out;
        }
        .mascot-bubble::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }
        .dark-theme .mascot-bubble {
          background: #1a1a1a;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .dark-theme .mascot-bubble::after {
          border-color: #1a1a1a transparent transparent transparent;
        }
      `;
      document.head.appendChild(style);
    }

    render('idle');
  }

  function render(mood, customMessage) {
    if (!container) return;
    const exp = expressions[mood] || expressions.idle;
    const msg = customMessage || exp.message;

    // SVG vẽ một ngọn lửa
    const svg = `
      <svg width="100" height="120" viewBox="0 0 90 120" class="mascot-fire">
        <!-- Ánh sáng tỏa ra -->
        <circle cx="45" cy="70" r="40" fill="${exp.color}" opacity="0.2" filter="blur(10px)"/>
        
        <!-- Tia lửa nhỏ -->
        <circle cx="30" cy="20" r="3" fill="${exp.inner}" class="mascot-spark" style="animation-delay: 0s" />
        <circle cx="65" cy="30" r="2" fill="${exp.inner}" class="mascot-spark" style="animation-delay: 0.5s" />
        <circle cx="45" cy="15" r="4" fill="${exp.inner}" class="mascot-spark" style="animation-delay: 1s" />

        <!-- Lửa chính -->
        <path d="M 45,5 C 20,40 5,60 15,85 C 25,110 65,110 75,85 C 85,60 70,40 45,5 Z" 
              fill="${exp.color}" />
              
        <!-- Lửa lõi (màu vàng) -->
        <path d="M 45,30 C 30,55 20,70 28,90 C 35,105 55,105 62,90 C 70,70 60,55 45,30 Z" 
              fill="${exp.inner}" class="mascot-fire-inner" />

        <!-- Khuôn mặt -->
        <g id="mascot-face">
          ${exp.eyes}
          ${exp.mouth}
        </g>
      </svg>
    `;

    container.innerHTML = `
      <div class="mascot-container-inner">
        <div class="mascot-bubble">${msg}</div>
        ${svg}
      </div>
    `;
  }

  function speak(mood, message) {
    render(mood, message);
  }

  return { init, speak };
})();
