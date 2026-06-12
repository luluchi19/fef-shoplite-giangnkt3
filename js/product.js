// ============================================================
// product.js — Product detail page logic
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetail();
  setupNavToggle();
});

/**
 * Setup mobile nav toggle
 */
function setupNavToggle() {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }
}

/**
 * Load product detail from query string ?id=
 */
async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const loading = document.getElementById("loading-state");
  const errorEl = document.getElementById("error-state");
  const detailContainer = document.getElementById("product-detail");

  if (!productId) {
    hideElement(loading);
    showElement(errorEl);
    errorEl.querySelector(".error-message").textContent =
      "No product ID specified. Please go back and select a product.";
    return;
  }

  showElement(loading);
  hideElement(errorEl);
  hideElement(detailContainer);

  try {
    const product = await getProductById(productId);
    hideElement(loading);
    renderProductDetail(product);
    showElement(detailContainer);
  } catch (error) {
    hideElement(loading);
    showElement(errorEl);
    errorEl.querySelector(".error-message").textContent =
      "Failed to load product details. Please try again.";
  }
}

/**
 * Render the product detail
 * @param {Object} product
 */
function renderProductDetail(product) {
  const container = document.getElementById("product-detail");
  container.innerHTML = `
    <div class="product-detail__image-wrapper">
      <img src="${product.image}" alt="${product.title}" class="product-detail__image" id="product-image">
    </div>
    <div class="product-detail__info">
      <span class="product-detail__category">${product.category}</span>
      <h1 class="product-detail__title">${product.title}</h1>
      <div class="product-detail__rating">
        ${renderStarsDetail(product.rating.rate)}
        <span class="product-detail__rating-text">${product.rating.rate} / 5</span>
        <span class="product-detail__rating-count">(${product.rating.count} reviews)</span>
      </div>
      <p class="product-detail__price">$${product.price.toFixed(2)}</p>
      <p class="product-detail__description">${product.description}</p>
      <div class="product-detail__actions">
        <button class="btn btn--primary btn--lg" id="add-to-cart-btn">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
        <a href="index.html" class="btn btn--outline btn--lg">
          <i class="fa-solid fa-arrow-left"></i> Back to Shop
        </a>
      </div>
    </div>
  `;

  // Add to cart button
  const addBtn = document.getElementById("add-to-cart-btn");
  addBtn.addEventListener("click", () => {
    addToCart(product);
  });
}

/**
 * Render star rating
 */
function renderStarsDetail(rate) {
  const fullStars = Math.floor(rate);
  const halfStar = rate % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let html = "";
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  if (halfStar) {
    html += '<i class="fa-solid fa-star-half-stroke"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

/**
 * Helper: show element
 */
function showElement(el) {
  if (el) el.style.display = "flex";
}

/**
 * Helper: hide element
 */
function hideElement(el) {
  if (el) el.style.display = "none";
}
