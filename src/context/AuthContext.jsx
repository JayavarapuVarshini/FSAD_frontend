import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch {} }
    setLoading(false);
  }, []);

  // Student login (direct — no OTP required)
  const login = async (email, password, captchaToken) => {
    try {
      const data = await authAPI.login({ email, password, captchaToken });
      if (!data || typeof data !== "object")
        return { success: false, error: "Cannot connect to server. Check that the backend is running and the API proxy is configured correctly." };
      if (data.message && data.message.includes("EMAIL_NOT_VERIFIED"))
        return { success: false, error: "Please verify your email first.", emailNotVerified: true };
      if (data.message && data.message.includes("ADMIN_REQUIRES_OTP"))
        return { success: false, error: "Admin must use the admin login flow.", adminRequiresOtp: true };
      if (!data.token)
        return { success: false, error: data.message || "Invalid email or password." };

      const userData = { id: data.id, fullName: data.fullName, email: data.email, role: data.role, emailVerified: data.emailVerified };
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, error: "Cannot connect to server. Check that the backend is running." };
      return { success: false, error: "Login failed: " + err.message };
    }
  };

  // Admin login step 1: validate credentials and send OTP
  const adminLoginSendOtp = async (email, password, captchaToken) => {
    try {
      const data = await authAPI.adminLoginSendOtp({ email, password, captchaToken });
      return { success: data.success, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      if (err.message.includes("EMAIL_NOT_VERIFIED"))
        return { success: false, message: "Please verify your email first.", emailNotVerified: true };
      return { success: false, message: err.message };
    }
  };

  // Admin login step 2: verify OTP and complete login
  const adminLoginVerifyOtp = async (email, otp) => {
    try {
      const data = await authAPI.adminLoginVerifyOtp(email, otp);
      if (!data.token)
        return { success: false, message: data.message || "OTP verification failed." };

      const userData = { id: data.id, fullName: data.fullName, email: data.email, role: data.role, emailVerified: data.emailVerified };
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      if (data && data.success) {
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const alreadyExists = existingUsers.some(
          (user) => user.email?.toLowerCase() === userData.email?.toLowerCase()
        );
        if (!alreadyExists) {
          const updatedUsers = [
            ...existingUsers,
            {
              id: data.id || Date.now(),
              fullName: userData.fullName,
              email: userData.email,
              role: userData.role,
              registered: new Date().toISOString(),
            },
          ];
          localStorage.setItem("users", JSON.stringify(updatedUsers));
        }
      }
      return { success: data.success, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server. Check that the backend is running." };
      return { success: false, message: "Registration failed: " + err.message };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const data = await authAPI.verifyEmail({ email, otp });
      return { success: true, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      return { success: false, message: err.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      const data = await authAPI.resendOtp(email);
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: "Failed to resend OTP." };
    }
  };

  // Forgot password step 1: send OTP
  const forgotPassword = async (email) => {
    try {
      const data = await authAPI.forgotPassword(email);
      return { success: data.success, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      return { success: false, message: "Failed to send OTP: " + err.message };
    }
  };

  // Forgot password step 2: verify OTP only
  const verifyResetOtp = async (email, otp) => {
    try {
      const data = await authAPI.verifyResetOtp(email, otp);
      return { success: data.success, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      return { success: false, message: err.message };
    }
  };

  // Forgot password step 3: change password (OTP already verified on backend)
  const resetPassword = async (email, newPassword) => {
    try {
      const data = await authAPI.resetPassword({ email, newPassword });
      return { success: data.success, message: data.message };
    } catch (err) {
      if (err.message === "NETWORK_ERROR")
        return { success: false, message: "Cannot connect to server." };
      return { success: false, message: "Reset failed: " + err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, adminLoginSendOtp, adminLoginVerifyOtp,
      register, verifyEmail, resendOtp,
      forgotPassword, verifyResetOtp, resetPassword,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
