// ============================================================
// register.js — Registration form validation with JavaScript
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  setupForm();
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
 * Setup form validation
 */
function setupForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  // Real-time validation on input
  const fields = form.querySelectorAll("input, select");
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
    });
    field.addEventListener("blur", () => {
      validateField(field);
    });
  });

  // Checkbox change
  const agreeCheckbox = document.getElementById("agree-terms");
  if (agreeCheckbox) {
    agreeCheckbox.addEventListener("change", () => {
      validateField(agreeCheckbox);
    });
  }

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const isValid = validateAllFields(form);
    if (isValid) {
      showSuccessMessage();
      form.reset();
      clearAllErrors(form);
    }
  });
}

/**
 * Validate a single field
 * @param {HTMLElement} field
 * @returns {boolean}
 */
function validateField(field) {
  const fieldId = field.id;
  let errorMessage = "";

  switch (fieldId) {
    case "fullname":
      if (!field.value.trim()) {
        errorMessage = "Full name is required.";
      } else if (field.value.trim().length < 2) {
        errorMessage = "Full name must be at least 2 characters.";
      }
      break;

    case "email":
      if (!field.value.trim()) {
        errorMessage = "Email is required.";
      } else if (!isValidEmail(field.value.trim())) {
        errorMessage = "Please enter a valid email address.";
      }
      break;

    case "password":
      if (!field.value) {
        errorMessage = "Password is required.";
      } else if (field.value.length < 6) {
        errorMessage = "Password must be at least 6 characters.";
      }
      break;

    case "phone":
      if (!field.value.trim()) {
        errorMessage = "Phone number is required.";
      } else if (!isValidPhone(field.value.trim())) {
        errorMessage = "Please enter a valid phone number (digits only, 9-15 characters).";
      }
      break;

    case "role":
      if (!field.value) {
        errorMessage = "Please select a role.";
      }
      break;

    case "agree-terms":
      if (!field.checked) {
        errorMessage = "You must agree to the terms and conditions.";
      }
      break;

    default:
      break;
  }

  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = errorMessage;
    errorEl.style.display = errorMessage ? "block" : "none";
  }

  // Toggle error styling
  if (errorMessage) {
    field.classList.add("input-error");
    field.classList.remove("input-success");
  } else if (field.value || field.checked) {
    field.classList.remove("input-error");
    field.classList.add("input-success");
  }

  return errorMessage === "";
}

/**
 * Validate all fields
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateAllFields(form) {
  let isValid = true;
  const fieldsToValidate = ["fullname", "email", "password", "phone", "role", "agree-terms"];

  fieldsToValidate.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      const result = validateField(field);
      if (!result) isValid = false;
    }
  });

  return isValid;
}

/**
 * Clear all errors
 * @param {HTMLFormElement} form
 */
function clearAllErrors(form) {
  const errors = form.querySelectorAll(".form-error");
  errors.forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.classList.remove("input-error", "input-success");
  });
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone format
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const re = /^\d{9,15}$/;
  return re.test(phone.replace(/[\s\-\+\(\)]/g, ""));
}

/**
 * Show success message
 */
function showSuccessMessage() {
  const successEl = document.getElementById("form-success");
  if (successEl) {
    successEl.style.display = "flex";
    setTimeout(() => {
      successEl.style.display = "none";
    }, 5000);
  }
  showToast("Registration successful!");
}
