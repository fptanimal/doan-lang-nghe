// ============================================================
// CART.JS — Module giỏ hàng (Server-side, yêu cầu đăng nhập)
// ============================================================

const Cart = (() => {
  const API_BASE = '/api/cart';

  function getToken() {
    return localStorage.getItem('accessToken');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  async function apiCall(url, options = {}) {
    const token = getToken();
    if (!token) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        ...options.headers
      }
    });

    if (res.status === 401) {
      // Token hết hạn → thử refresh
      const refreshed = await refreshToken();
      if (refreshed) return apiCall(url, options); // Thử lại
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }

    return res.json();
  }

  async function refreshToken() {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Thêm sản phẩm vào giỏ
  async function add(productId, quantity = 1) {
    if (!isLoggedIn()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const result = await apiCall(API_BASE + '/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });

    if (result && result.success) {
      updateBadge(result.cartCount);
      showToast('🛒 ' + result.message);
    } else if (result) {
      showToast('❌ ' + result.error, true);
    }

    return result;
  }

  // Cập nhật số lượng
  async function update(productId, quantity) {
    return apiCall(API_BASE + '/update', {
      method: 'PUT',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  // Xóa sản phẩm khỏi giỏ
  async function remove(productId) {
    return apiCall(API_BASE + '/remove/' + productId, { method: 'DELETE' });
  }

  // Lấy toàn bộ giỏ hàng
  async function getAll() {
    return apiCall(API_BASE);
  }

  // Lấy số lượng items
  async function getCount() {
    if (!isLoggedIn()) return 0;
    const result = await apiCall(API_BASE + '/count');
    return result ? result.count : 0;
  }

  // Cập nhật badge trên navbar
  function updateBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count || 0;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // Khởi tạo: Load cart count khi trang tải
  async function init() {
    if (!isLoggedIn()) return;
    const count = await getCount();
    updateBadge(count);
  }

  // Toast notification nhỏ gọn
  function showToast(message, isError = false) {
    // Xóa toast cũ nếu có
    const old = document.getElementById('cart-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${isError ? '#c0533a' : '#2d6a4f'}; color: white;
      padding: 14px 28px; border-radius: 12px; font-size: 0.95rem; font-weight: 600;
      z-index: 10000; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: slideInUp 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  return { add, update, remove, getAll, getCount, init, updateBadge, isLoggedIn, showToast };
})();

// Auto-init cart count on page load
document.addEventListener('DOMContentLoaded', () => Cart.init());
