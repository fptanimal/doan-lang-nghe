// ============================================================
// CART.JS — Module giỏ hàng (Local Storage version)
// ============================================================

const Cart = (() => {
  function getCart() {
    return JSON.parse(localStorage.getItem('cart_items') || '[]');
  }

  function saveCart(cart) {
    localStorage.setItem('cart_items', JSON.stringify(cart));
  }

  function isLoggedIn() {
    // Cho phép dùng thử cart mà không cần login nếu chưa có backend. 
    // Tuy nhiên theo logic cũ, cần login. Ta sẽ mô phỏng login nếu có current user.
    return !!App.getCurrentUser();
  }

  async function add(productId, quantity = 1) {
    if (!isLoggedIn()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const cart = getCart();
    const existing = cart.find(item => item.product_id === productId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product_id: productId, quantity });
    }
    
    saveCart(cart);
    
    const count = await getCount();
    updateBadge(count);
    showToast('🛒 Đã thêm sản phẩm vào giỏ hàng');
    
    return { success: true, cartCount: count, message: 'Đã thêm sản phẩm' };
  }

  async function update(productId, quantity) {
    const cart = getCart();
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      existing.quantity = quantity;
      saveCart(cart);
    }
    return { success: true };
  }

  async function remove(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.product_id !== productId);
    saveCart(cart);
    return { success: true };
  }

  async function getAll() {
    const cart = getCart();
    // Enrich with product details
    const data = cart.map(item => {
      const product = getProductById(item.product_id);
      if (product) {
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          image: product.image,
          village_name: product.villageName
        };
      }
      return null;
    }).filter(Boolean);
    
    const total = data.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { success: true, data, total };
  }

  async function getCount() {
    if (!isLoggedIn()) return 0;
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count || 0;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  async function init() {
    if (!isLoggedIn()) return;
    const count = await getCount();
    updateBadge(count);
  }

  function showToast(message, isError = false) {
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
  
  function clearCart() {
    localStorage.removeItem('cart_items');
  }

  return { add, update, remove, getAll, getCount, init, updateBadge, isLoggedIn, showToast, clearCart };
})();

document.addEventListener('DOMContentLoaded', () => Cart.init());
