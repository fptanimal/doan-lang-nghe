// ============================================================
// ADMIN.JS — Logic xử lý dữ liệu cho Admin Dashboard
// ============================================================

async function getAdminOrders() {
  let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
  
  // Thử lấy thêm từ Firestore và gộp dữ liệu
  const fb = await App.waitForFirebase(3000);
  if (fb) {
    try {
      const { db, firestore } = fb;
      const snap = await firestore.getDocs(firestore.collection(db, 'orders'));
      snap.forEach(doc => {
        const data = doc.data();
        if (!orders.some(o => o.id === data.id)) {
          orders.push(data);
        }
      });
    } catch(e) {
      console.warn('Lỗi đọc Firestore orders, sử dụng localStorage:', e);
    }
  }
  return orders;
}

async function saveAdminOrder(orderId, updates) {
  // Cập nhật trong localStorage trước
  let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...updates };
    localStorage.setItem('admin_orders', JSON.stringify(orders));
  }
  
  // Cập nhật trên Firestore nếu có
  const fb = await App.waitForFirebase(3000);
  if (fb) {
    try {
      const { db, firestore } = fb;
      await firestore.updateDoc(firestore.doc(db, 'orders', orderId), updates);
    } catch(e) {}
  }
}

function getAdminTours() {
  return JSON.parse(localStorage.getItem('admin_tour_bookings') || '[]');
}

function saveAdminTours(tours) {
  localStorage.setItem('admin_tour_bookings', JSON.stringify(tours));
}

// ------------------------------------------------------------
// Hiển thị dữ liệu
// ------------------------------------------------------------
window.adminRefresh = async function() {
  const btn = document.querySelector('.rd-btn-primary');
  if(btn) btn.innerHTML = '<i data-lucide="refresh-cw" class="spin" style="width:16px; height:16px; margin-right:8px;"></i> Đang tải...';
  
  const orders = await getAdminOrders();
  const tours = getAdminTours();
  
  // Tính toán Overview
  const totalRevenue = orders.filter(o => o.status === 'completed' || o.status === 'done').reduce((sum, o) => sum + o.total, 0);
  const pendingTours = tours.filter(t => t.status === 'pending').length;
  
  document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-pending-tours').textContent = pendingTours;
  document.getElementById('stat-tours').textContent = tours.length;
  
  // Render Bảng Orders
  renderOrdersTable(orders);
  
  // Render Bảng Tours
  renderToursTable(tours);
  
  if(btn) btn.innerHTML = '<i data-lucide="refresh-cw" style="width:16px; height:16px; margin-right:8px;"></i> Làm mới dữ liệu';
  if(typeof lucide !== 'undefined') lucide.createIcons();
};

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">Chưa có đơn hàng nào</td></tr>';
    return;
  }
  
  // Sort by date desc
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  tbody.innerHTML = orders.map(o => {
    const date = new Date(o.createdAt).toLocaleString('vi-VN');
    const statusHtml = getOrderStatusHtml(o.status);
    const actionsHtml = getOrderActionsHtml(o.id, o.status);
    
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>
          <div style="font-weight:600; color:#fff;">${o.customerName}</div>
          <div style="font-size:0.8rem; color:#aaa;">${o.phone}</div>
        </td>
        <td style="color:#aaa;">${date}</td>
        <td style="color:var(--gold); font-weight:700;">${formatPrice(o.total)}</td>
        <td>${statusHtml}</td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function renderToursTable(tours) {
  const tbody = document.getElementById('tours-tbody');
  if (!tbody) return;
  
  if (tours.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">Chưa có Booking nào</td></tr>';
    return;
  }
  
  tours.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  tbody.innerHTML = tours.map(t => {
    const statusHtml = getOrderStatusHtml(t.status);
    const actionsHtml = getTourActionsHtml(t.id, t.status);
    const dateGo = new Date(t.date).toLocaleDateString('vi-VN');
    
    return `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>
          <div style="font-weight:600; color:#fff;">${t.tourName}</div>
          <div style="font-size:0.8rem; color:#aaa;">KH: ${t.customerName} - ${t.phone}</div>
        </td>
        <td style="color:#aaa;">${dateGo}</td>
        <td style="color:#fff; font-weight:600;">${t.guests} người</td>
        <td>${statusHtml}</td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

// ------------------------------------------------------------
// Helper giao diện
// ------------------------------------------------------------
function getOrderStatusHtml(status) {
  switch (status) {
    case 'pending': return '<span class="status-badge status-pending">Chờ xử lý</span>';
    case 'shipping': return '<span class="status-badge status-shipping">Đang giao</span>';
    case 'completed': return '<span class="status-badge status-completed">Thành công</span>';
    case 'cancelled': return '<span class="status-badge status-cancelled">Đã hủy</span>';
    default: return '<span class="status-badge">Unknown</span>';
  }
}

function getOrderActionsHtml(id, status) {
  if (status === 'pending') {
    return `
      <button class="action-btn btn-approve" onclick="changeOrderStatus('${id}', 'shipping')">Giao hàng</button>
      <button class="action-btn btn-cancel" onclick="changeOrderStatus('${id}', 'cancelled')">Hủy</button>
    `;
  } else if (status === 'shipping') {
    return `
      <button class="action-btn btn-complete" onclick="changeOrderStatus('${id}', 'completed')">Đã nhận</button>
    `;
  }
  return '<span style="color:#888; font-size:0.85rem;">Không có</span>';
}

function getTourActionsHtml(id, status) {
  if (status === 'pending') {
    return `
      <button class="action-btn btn-approve" onclick="changeTourStatus('${id}', 'confirmed')">Xác nhận</button>
      <button class="action-btn btn-cancel" onclick="changeTourStatus('${id}', 'cancelled')">Hủy</button>
    `;
  } else if (status === 'confirmed') {
    return `
      <button class="action-btn btn-complete" onclick="changeTourStatus('${id}', 'completed')">Hoàn thành</button>
    `;
  }
  return '<span style="color:#888; font-size:0.85rem;">Không có</span>';
}

// ------------------------------------------------------------
// Action handlers
// ------------------------------------------------------------
window.changeOrderStatus = async function(id, newStatus) {
  if (!confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng thành: ${newStatus}?`)) return;
  
  // 1. Cập nhật Order status
  await saveAdminOrder(id, { status: newStatus });
  
  // 2. Thêm notification cho user
  if (window.FirebaseAuth) {
    const { db, firestore } = window.FirebaseAuth;
    const orderSnap = await firestore.getDoc(firestore.doc(db, 'orders', id));
    if (orderSnap.exists()) {
      const order = orderSnap.data();
      if (order.userId && order.userId !== 'guest') {
        const title = `Đơn hàng ${id}`;
        let msg = `Đơn hàng của bạn đã chuyển sang trạng thái: ${newStatus}`;
        if (newStatus === 'shipping') msg = 'Đơn hàng của bạn đang được giao đến bạn!';
        if (newStatus === 'done' || newStatus === 'completed') msg = 'Đơn hàng đã được giao thành công!';
        
        await firestore.addDoc(firestore.collection(db, 'notifications'), {
          userId: order.userId,
          orderId: id,
          title: title,
          message: msg,
          is_read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  
  adminRefresh();
};

window.changeTourStatus = function(id, newStatus) {
  if (!confirm(`Bạn có chắc muốn chuyển trạng thái Tour thành: ${newStatus}?`)) return;
  const tours = getAdminTours();
  const idx = tours.findIndex(t => t.id === id);
  if (idx > -1) {
    tours[idx].status = newStatus;
    saveAdminTours(tours);
    adminRefresh();
  }
};

let adminListenerInitialized = false;
window.setupAdminListeners = async function() {
  if (adminListenerInitialized) return;
  const fb = await App.waitForFirebase(5000);
  if (!fb) return;
  adminListenerInitialized = true;
  const { db, firestore } = fb;
  
  let initialLoad = true;
  firestore.onSnapshot(firestore.collection(db, 'orders'), (snapshot) => {
    if (initialLoad) {
      initialLoad = false;
      return;
    }
    let hasNewOrders = false;
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const order = change.doc.data();
        if (order.status === 'pending') {
          hasNewOrders = true;
        }
      }
    });
    if (hasNewOrders) {
      // Show toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; top: 24px; right: 24px;
        background: var(--gold); color: var(--brown);
        padding: 16px 24px; border-radius: 12px; font-weight: bold; font-size: 1.1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 99999;
        animation: slideInDown 0.3s ease-out;
      `;
      toast.innerHTML = `🔔 Có đơn hàng mới!`;
      document.body.appendChild(toast);
      if (typeof App !== 'undefined' && App.playSound) App.playSound('success');
      setTimeout(() => toast.remove(), 4000);
      adminRefresh();
    }
  });
};
