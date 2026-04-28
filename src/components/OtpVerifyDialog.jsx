import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, Box, CircularProgress, Link,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useAuth } from "../context/AuthContext";

const OtpVerifyDialog = ({ open, email, onClose, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyEmail, resendOtp } = useAuth();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await verifyEmail(email, otp);
    setLoading(false);
    if (result.success) {
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(onVerified, 1500);
    } else {
      setError(result.message || "Invalid or expired OTP.");
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    const result = await resendOtp(email);
    setResendLoading(false);
    if (result.success) {
      setSuccess("OTP resent! Check your email.");
      setCountdown(60); // 60 second cooldown
    } else {
      setError(result.message || "Failed to resend OTP.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        <MarkEmailReadIcon sx={{ fontSize: 48, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">Verify Your Email</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          We've sent a 6-digit OTP to <strong>{email}</strong>. Enter it below to verify your account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
          inputProps={{ maxLength: 6, style: { fontSize: 28, letterSpacing: 10, textAlign: "center" } }}
          margin="normal"
          placeholder="000000"
        />

        <Box sx={{ textAlign: "center", mt: 1 }}>
          {countdown > 0 ? (
            <Typography variant="caption" color="text.secondary">
              Resend OTP in {countdown}s
            </Typography>
          ) : (
            <Link
              component="button"
              variant="body2"
              onClick={handleResend}
              disabled={resendLoading}
              sx={{ cursor: "pointer" }}
            >
              {resendLoading ? <CircularProgress size={14} /> : "Resend OTP"}
            </Link>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
        <Button fullWidth variant="contained" onClick={handleVerify} disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "Verify OTP"}
        </Button>
        <Button fullWidth variant="outlined" onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpVerifyDialog;
