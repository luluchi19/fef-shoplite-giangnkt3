// ============================================================
// home.js — Home page logic (fetch products, render grid,
//           search, filter, sort, pagination)
// ============================================================

let allProducts = [];
let filteredProducts = [];
let currentCategory = "all";
let currentSort = "default";
let searchQuery = "";
let currentPage = 1;
const PRODUCTS_PER_PAGE = 8;
let debounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();
  setupEventListeners();
});

/**
 * Setup all event listeners (uses event delegation on the grid)
 */
function setupEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
      }, 300);
    });
  }

  // Category filter
  const categorySelect = document.getElementById("category-filter");
  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  // Sort select
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  // Event delegation on the product grid for "Add to cart" & clicking card for details
  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      // Handle "Add to cart" button
      const addBtn = e.target.closest("[data-action='add-to-cart']");
      if (addBtn) {
        e.stopPropagation();
        const productId = parseInt(addBtn.dataset.productId, 10);
        const product = allProducts.find((p) => p.id === productId);
        if (product) {
          addToCart(product);
        }
        return;
      }

      // Handle clicking on card to view details
      const card = e.target.closest(".product-card");
      if (card) {
        const productId = card.dataset.productId;
        if (productId) {
          window.location.href = `product.html?id=${productId}`;
        }
        return;
      }
    });
  }

  // Event delegation on pagination
  const paginationContainer = document.getElementById("pagination");
  if (paginationContainer) {
    paginationContainer.addEventListener("click", (e) => {
      const pageBtn = e.target.closest("[data-page]");
      if (pageBtn) {
        const page = pageBtn.dataset.page;
        if (page === "prev") {
          currentPage = Math.max(1, currentPage - 1);
        } else if (page === "next") {
          const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
          currentPage = Math.min(totalPages, currentPage + 1);
        } else {
          currentPage = parseInt(page, 10);
        }
        renderProducts();
        // Scroll to product section
        document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Mobile navbar toggle
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
 * Load categories into the filter dropdown
 */
async function loadCategories() {
  try {
    const categories = await getCategories();
    const select = document.getElementById("category-filter");
    if (select) {
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
      });
    }
  } catch (error) {
    // Categories are optional, silently fail
  }
}

/**
 * Load all products from the API
 */
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const loading = document.getElementById("loading-state");
  const errorEl = document.getElementById("error-state");

  showElement(loading);
  hideElement(errorEl);
  grid.innerHTML = "";

  try {
    allProducts = await getAllProducts();
    filteredProducts = [...allProducts];
    hideElement(loading);
    renderProducts();
  } catch (error) {
    hideElement(loading);
    showElement(errorEl);
    errorEl.querySelector(".error-message").textContent =
      "Failed to load products. Please check your connection and try again.";
  }
}

/**
 * Apply search, category filter, and sort simultaneously
 */
function applyFilters() {
  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery);

    const matchesCategory =
      currentCategory === "all" || product.category === currentCategory;

    return matchesSearch && matchesCategory;
  });

  // Apply sort
  switch (currentSort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      // Keep original order
      break;
  }

  renderProducts();
}

/**
 * Render products grid with pagination
 */
function renderProducts() {
  const grid = document.getElementById("product-grid");
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, end);

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>No products found matching your criteria.</p>
      </div>
    `;
    renderPagination(0);
    return;
  }

  grid.innerHTML = pageProducts
    .map(
      (product) => `
    <article class="product-card" id="product-card-${product.id}" data-product-id="${product.id}">
      <div class="product-card__image-wrapper">
        <img src="${product.image}" alt="${product.title}" class="product-card__image" loading="lazy">
        <span class="product-card__category">${product.category}</span>
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title">${product.title}</h3>
        <div class="product-card__rating">
          ${renderStars(product.rating.rate)}
          <span class="product-card__rating-count">(${product.rating.count})</span>
        </div>
        <p class="product-card__price">$${product.price.toFixed(2)}</p>
        <div class="product-card__actions">
          <button class="btn btn--primary" data-action="add-to-cart" data-product-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </article>
  `
    )
    .join("");

  renderPagination(totalPages);
}

/**
 * Render star rating HTML
 * @param {number} rate
 * @returns {string}
 */
function renderStars(rate) {
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
 * Render pagination controls
 * @param {number} totalPages
 */
function renderPagination(totalPages) {
  const container = document.getElementById("pagination");
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="pagination__btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>
    <i class="fa-solid fa-chevron-left"></i>
  </button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination__btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="pagination__btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>
    <i class="fa-solid fa-chevron-right"></i>
  </button>`;

  container.innerHTML = html;
}

/**
 * Helper: show an element
 */
function showElement(el) {
  if (el) el.style.display = "flex";
}

/**
 * Helper: hide an element
 */
function hideElement(el) {
  if (el) el.style.display = "none";
}
