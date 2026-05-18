// ============================================================
// TOURS.JS — Logic hiển thị và đặt tour
// ============================================================

let allToursList = [];

document.addEventListener('DOMContentLoaded', () => {
  App.renderNavbar('tours');
  
  allToursList = getAllTours();
  
  // Populate filter
  const filterSelect = document.getElementById('village-filter');
  const villagesWithTours = [...new Set(allToursList.map(t => t.villageId))];
  
  villagesWithTours.forEach(vid => {
    const v = getVillageById(vid);
    if (v) {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name;
      filterSelect.appendChild(opt);
    }
  });

  // Check URL params for deep linking (e.g., ?village=1)
  const urlParams = new URLSearchParams(window.location.search);
  const villageParam = urlParams.get('village');
  if (villageParam && villagesWithTours.includes(parseInt(villageParam))) {
    filterSelect.value = villageParam;
  }

  renderTours();
});

function renderTours() {
  const filterVal = document.getElementById('village-filter').value;
  const grid = document.getElementById('tours-grid');
  grid.innerHTML = '';

  const filtered = filterVal === 'all' 
    ? allToursList 
    : allToursList.filter(t => t.villageId == filterVal);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:40px;">Chưa có tour nào cho lựa chọn này.</p>';
    return;
  }

  filtered.forEach((t, index) => {
    const card = document.createElement('div');
    card.className = 'tour-card';
    card.style.animation = `fadeInUp 0.5s ${index * 0.1}s both`;
    
    card.innerHTML = `
      <div class="tour-img" style="background-image: url('${t.image}')">
        <span class="tour-badge">${t.duration}</span>
      </div>
      <div class="tour-body">
        <div class="tour-name">${t.name}</div>
        <div class="tour-village">📍 ${t.villageName}</div>
        <div class="tour-meta">
          <span class="tour-meta-item">⏱ ${t.duration}</span>
        </div>
        <div class="tour-desc">${t.desc}</div>
        <div class="tour-footer">
          <div class="tour-price">${formatPrice(t.price)}</div>
          <button class="btn btn-primary btn-sm" onclick="openBookingModal('${t.id}')">Đặt Ngay</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.filterTours = renderTours;

let selectedTourId = null;

window.openBookingModal = function(tourId) {
  selectedTourId = tourId;
  const tour = allToursList.find(t => t.id === tourId);
  if (!tour) return;

  document.getElementById('modal-tour-name').textContent = tour.name;
  document.getElementById('modal-tour-price').textContent = formatPrice(tour.price) + ' / người';
  document.getElementById('booking-modal').classList.add('open');
};

window.closeModal = function() {
  document.getElementById('booking-modal').classList.remove('open');
  document.getElementById('booking-form').reset();
};

window.submitBooking = function(e) {
  e.preventDefault();
  // Here we would typically send data to a backend. For now, simulate success.
  
  if (typeof App !== 'undefined' && App.launchConfetti) App.launchConfetti();
  
  alert("Cảm ơn bạn đã đặt Tour! Chúng tôi sẽ liên hệ trong thời gian sớm nhất để xác nhận.");
  closeModal();
};

// Close modal when clicking outside
document.getElementById('booking-modal').addEventListener('click', (e) => {
  if (e.target.id === 'booking-modal') closeModal();
});
