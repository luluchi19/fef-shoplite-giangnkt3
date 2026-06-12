// ============================================================
// cart.js — Cart logic + localStorage
// ============================================================

const CART_KEY = "shoplite_cart";

/**
 * Get the cart array from localStorage
 * @returns {Array}
 */
function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

/**
 * Save the cart array to localStorage
 * @param {Array} cart
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Add a product to the cart (or increase qty if exists)
 * @param {Object} product - Product object from API
 */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
  saveCart(cart);
  showToast(`"${product.title}" added to cart!`);
}

/**
 * Remove a product from the cart
 * @param {number} productId
 */
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
}

/**
 * Update the quantity of a cart item
 * @param {number} productId
 * @param {number} newQty
 */
function updateQuantity(productId, newQty) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, newQty);
  }
  saveCart(cart);
}

/**
 * Get total number of items in the cart
 * @returns {number}
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get total price of all items
 * @returns {number}
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Update the cart badge count in the navbar (synced across pages)
 */
function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

/**
 * Show a toast notification
 * @param {string} message
 */
function showToast(message) {
  // Remove any existing toast
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Initialize badge on every page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
