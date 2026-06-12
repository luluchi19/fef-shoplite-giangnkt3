// ============================================================
// api.js — Shared fetch functions for Fake Store API
// ============================================================

const API_BASE = "https://fakestoreapi.com";

/**
 * Generic fetch wrapper with error handling.
 * Uses async/await, checks res.ok, and has try/catch.
 * @param {string} endpoint - API endpoint path (e.g. "/products")
 * @returns {Promise<any>} Parsed JSON data
 */
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all products
 * @returns {Promise<Array>}
 */
async function getAllProducts() {
  return await fetchData("/products");
}

/**
 * Get a single product by ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
async function getProductById(id) {
  return await fetchData(`/products/${id}`);
}

/**
 * Get all category names
 * @returns {Promise<Array<string>>}
 */
async function getCategories() {
  return await fetchData("/products/categories");
}

/**
 * Get products filtered by category
 * @param {string} category
 * @returns {Promise<Array>}
 */
async function getProductsByCategory(category) {
  return await fetchData(`/products/category/${category}`);
}
