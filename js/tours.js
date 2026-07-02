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
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:40px; color: rgba(255,255,255,0.5); font-size: 1.1rem;">Chưa có tour nào cho lựa chọn này.</p>';
    return;
  }

  filtered.forEach((t, index) => {
    const card = document.createElement('div');
    card.className = 'tour-card glass-panel';
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animation = `slideInUp 0.5s ease-out both ${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="tour-img" style="background-image: url('${t.image || 'images/placeholder.jpg'}')">
        <span class="tour-badge">${t.duration}</span>
      </div>
      <div class="tour-body">
        <h3 class="tour-name text-glow">${t.name}</h3>
        <div class="tour-village"><i data-lucide="map-pin" style="width:16px;height:16px;"></i> ${t.villageName}</div>
        
        <div class="tour-meta">
          <span class="tour-meta-item"><i data-lucide="clock" style="width:14px;height:14px;"></i> ${t.duration}</span>
          <span class="tour-meta-item"><i data-lucide="users" style="width:14px;height:14px;"></i> ${t.maxGuests || 15} người</span>
        </div>
        <p class="tour-desc">${t.desc}</p>
        
        <div class="tour-footer">
          <div class="tour-price">${formatPrice(t.price)}</div>
          <button class="btn glass-btn" style="border: 1px solid var(--terracotta); color: var(--terracotta);" onclick="openBookingModal('${t.id}')">Đặt Ngay</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
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
  
  const form = e.target;
  const nameInput = form.querySelector('input[type="text"]').value;
  const phoneInput = form.querySelector('input[type="tel"]').value;
  const dateInput = form.querySelector('input[type="date"]').value;
  const guestsInput = form.querySelector('input[type="number"]').value;
  
  const tour = allToursList.find(t => t.id === selectedTourId);
  if (!tour) return;
  
  const booking = {
    id: 'BK-' + Date.now(),
    tourId: tour.id,
    tourName: tour.name,
    customerName: nameInput,
    phone: phoneInput,
    date: dateInput,
    guests: parseInt(guestsInput),
    totalPrice: tour.price * parseInt(guestsInput),
    status: 'pending', // pending, confirmed, completed, cancelled
    createdAt: new Date().toISOString()
  };
  
  // Save to localStorage
  const existingBookings = JSON.parse(localStorage.getItem('admin_tour_bookings') || '[]');
  existingBookings.push(booking);
  localStorage.setItem('admin_tour_bookings', JSON.stringify(existingBookings));
  
  if (typeof App !== 'undefined' && App.launchConfetti) App.launchConfetti();
  
  alert("Cảm ơn bạn đã đặt Tour! Mã đặt chỗ của bạn là: " + booking.id + ". Chúng tôi sẽ liên hệ trong thời gian sớm nhất để xác nhận.");
  closeModal();
};

// Close modal when clicking outside
document.getElementById('booking-modal').addEventListener('click', (e) => {
  if (e.target.id === 'booking-modal') closeModal();
});
