// src/services/api.js
// Uses Vite proxy: /api → http://localhost:8081 (set in vite.config.js)

const BASE_URL = "/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const request = async (url, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    const text = await res.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text);
      }
    }

    if (!res.ok || data?.success === false) {
      throw new Error(data?.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      throw new Error("NETWORK_ERROR");
    }
    throw err;
  }
};

// =====================
// AUTH APIs
// =====================
export const authAPI = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload) =>
    request("/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  resendOtp: (email) =>
    request("/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  // Step 2: verify the reset OTP only (no password change)
  verifyResetOtp: (email, otp) =>
    request("/auth/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }),

  // Step 3: change password after OTP verified
  resetPassword: (payload) =>
    request("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  // Admin 2-step login
  adminLoginSendOtp: (payload) =>
    request("/auth/admin-login-send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  adminLoginVerifyOtp: (email, otp) =>
    request("/auth/admin-login-verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }),
};

// =====================
// ADMIN APIs
// =====================
export const adminAPI = {
  createForm: (formData) =>
    request("/admin/forms", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(formData),
    }),

  getAllForms: () =>
    request("/admin/forms", { method: "GET", headers: authHeaders() }),

  toggleFormStatus: (id) =>
    request(`/admin/forms/${id}/toggle-status`, {
      method: "PUT",
      headers: authHeaders(),
    }),

  updateForm: (id, formData) =>
    request(`/admin/forms/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(formData),
    }),

  deleteForm: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/forms/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (!res.ok) {
            throw new Error(text);
          }
        }
      }

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to delete form");
      }

      return { success: true, ...data };
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        throw new Error("NETWORK_ERROR");
      }
      throw err;
    }
  },

  getAnalytics: () =>
    request("/admin/analytics", { method: "GET", headers: authHeaders() }),
};

// =====================
// STUDENT APIs
// =====================
export const studentAPI = {
  getActiveForms: () =>
    request("/student/forms", { method: "GET", headers: authHeaders() }),

  submitFeedback: (payload) =>
    request("/student/submit-feedback", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  getSubmittedFormIds: () =>
    request("/student/submitted-forms", { method: "GET", headers: authHeaders() }),
};
