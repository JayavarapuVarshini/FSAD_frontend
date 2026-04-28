import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, Alert, Avatar, CircularProgress, Divider,
  InputAdornment, IconButton,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";

const allowedEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|kluniversity\.in)$/i;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  // step 1 = enter email, step 2 = enter OTP, step 3 = set new password
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); setSuccess("");
  };

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Step 1: send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!allowedEmailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email ending with @gmail.com or @kluniversity.in.");
      return;
    }
    setLoading(true); setError(""); setSuccess("");
    const result = await forgotPassword(formData.email.trim().toLowerCase());
    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "OTP sent to your email.");
      setStep(2);
      setCountdown(60);
    } else {
      setError(result.message || "Unable to send OTP.");
    }
  };

  // Resend OTP (from step 2)
  const handleResendOtp = async () => {
    setResendLoading(true); setError(""); setSuccess("");
    const result = await forgotPassword(formData.email.trim().toLowerCase());
    setResendLoading(false);
    if (result.success) {
      setSuccess("OTP resent to your email.");
      setCountdown(60);
    } else {
      setError(result.message || "Failed to resend OTP.");
    }
  };

  // Step 2: verify OTP — if correct, move to step 3
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter the 6-digit OTP."); return;
    }
    setLoading(true);
    const result = await verifyResetOtp(formData.email.trim().toLowerCase(), formData.otp.trim());
    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "OTP verified! Now set your new password.");
      setStep(3);
    } else {
      setError(result.message || "Invalid or expired OTP.");
    }
  };

  // Step 3: set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!passwordRegex.test(formData.newPassword)) {
      setError("Password must be at least 8 chars with uppercase, lowercase, number & special character (@$!%*?&#)."); return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    const result = await resetPassword(formData.email.trim().toLowerCase(), formData.newPassword);
    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.message || "Unable to reset password.");
    }
  };

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #10241f 0%, #1f4d45 52%, #d9a441 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 4, background: "rgba(255, 250, 240, 0.98)", border: "1px solid #eadfc9" }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar sx={{ bgcolor: "#1f4d45", color: "#f7f1e3", width: 60, height: 60, margin: "0 auto", mb: 2 }}>
                <LockResetIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#16302b" }}>Forgot Password</Typography>
              <Typography color="text.secondary">
                {step === 1 && "Enter your email to receive a reset OTP"}
                {step === 2 && `Enter the OTP sent to ${formData.email}`}
                {step === 3 && "Set your new password"}
              </Typography>
            </Box>

            {/* Step indicator */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
              {[1, 2, 3].map(s => (
                <Box key={s} sx={{ width: 36, height: 6, borderRadius: 3, background: step >= s ? "#1f4d45" : "#ccc" }} />
              ))}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <TextField fullWidth label="Registered Email" name="email" type="email"
                  value={formData.email} onChange={handleChange} margin="normal" required
                  placeholder="example@gmail.com or example@kluniversity.in"
                  helperText="Enter your Gmail or KL University email" />
                <Button type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ mt: 2, background: "#1f4d45", "&:hover": { background: "#16302b" } }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP to Email"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <TextField fullWidth label="6-Digit OTP" name="otp"
                  value={formData.otp} onChange={handleChange} margin="normal"
                  inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontWeight: "bold", fontSize: 22, textAlign: "center" } }}
                  placeholder="000000" required />

                <Box sx={{ textAlign: "right", mt: -0.5, mb: 2 }}>
                  {countdown > 0 ? (
                    <Typography variant="caption" color="text.secondary">Resend OTP in {countdown}s</Typography>
                  ) : (
                    <Typography variant="caption" sx={{ cursor: "pointer", color: "#1f4d45", fontWeight: "bold" }}
                      onClick={!resendLoading ? handleResendOtp : undefined}>
                      {resendLoading ? "Sending..." : "↺ Resend OTP"}
                    </Typography>
                  )}
                </Box>

                <Button type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ mt: 1, background: "#1f4d45", "&:hover": { background: "#16302b" } }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
                </Button>
              </form>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <TextField fullWidth label="New Password" name="newPassword"
                  type={showPw ? "text" : "password"}
                  value={formData.newPassword} onChange={handleChange} margin="normal"
                  helperText="Min 8 chars: uppercase, lowercase, number & special char"
                  InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)}>
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )}} required />

                <TextField fullWidth label="Confirm New Password" name="confirmPassword"
                  type="password" value={formData.confirmPassword} onChange={handleChange}
                  margin="normal" required />

                <Button type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ mt: 2, background: "#1f4d45", "&:hover": { background: "#16302b" } }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                </Button>
              </form>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ mt: 1, textAlign: "center" }}>
              Remembered your password? <Link to="/login">Back to Login</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
