import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, Alert, Avatar, CircularProgress, Divider,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useAuth } from "../context/AuthContext";
import OtpVerifyDialog from "../components/OtpVerifyDialog";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const allowedEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|kluniversity\.in)$/i;
function randomChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }
function generateCode(len = 6) { let s = ""; for (let i = 0; i < len; i++) s += randomChar(); return s; }

function drawCaptcha(canvas, code) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#f0e6ff"); grad.addColorStop(1, "#e6f0ff");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo(Math.random()*w, Math.random()*h);
    ctx.lineTo(Math.random()*w, Math.random()*h);
    ctx.strokeStyle = `hsla(${Math.random()*360},60%,60%,0.4)`;
    ctx.lineWidth = 1.5; ctx.stroke();
  }
  for (let i = 0; i < 40; i++) {
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, 1.5, 0, 2*Math.PI);
    ctx.fillStyle = `hsla(${Math.random()*360},50%,50%,0.5)`; ctx.fill();
  }
  const charW = w / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    const x = charW*(i+0.8)+Math.random()*6-3;
    ctx.translate(x, h/2+8); ctx.rotate((Math.random()-0.5)*0.5);
    ctx.font = `bold ${24+Math.floor(Math.random()*8)}px ${Math.random()>0.5?"Georgia":"Arial"}`;
    ctx.fillStyle = `hsl(${Math.random()*360},70%,30%)`;
    ctx.fillText(code[i], 0, 0); ctx.restore();
  }
}

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email-not-verified dialog (for students)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Admin OTP step
  const [adminOtpStep, setAdminOtpStep] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpError, setAdminOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const [captchaCode, setCaptchaCode] = useState(generateCode());
  const [captchaInput, setCaptchaInput] = useState("");
  const canvasRef = useRef(null);

  const { login, adminLoginSendOtp, adminLoginVerifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (canvasRef.current) drawCaptcha(canvasRef.current, captchaCode); }, [captchaCode]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const refreshCaptcha = () => { setCaptchaCode(generateCode()); setCaptchaInput(""); };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allowedEmailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email ending with @gmail.com or @kluniversity.in.");
      return;
    }
    if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setError("Incorrect CAPTCHA. Please try again.");
      refreshCaptcha(); return;
    }

    setLoading(true);
    try {
      // First try the student login path
      const result = await login(formData.email.trim().toLowerCase(), formData.password.trim(), "local-captcha-passed");

      if (result.success) {
        // Student logged in successfully
        navigate(result.user.role === "admin" ? "/admin" : "/student");
      } else if (result.adminRequiresOtp) {
        // Admin detected — switch to admin 2-step OTP flow
        const otpResult = await adminLoginSendOtp(
          formData.email.trim().toLowerCase(),
          formData.password.trim(),
          "local-captcha-passed"
        );
        if (otpResult.success) {
          setAdminEmail(formData.email.trim().toLowerCase());
          setAdminOtpStep(true);
          setCountdown(60);
          setError("");
        } else {
          setError(otpResult.message || "Failed to send admin OTP.");
          refreshCaptcha();
        }
      } else if (result.emailNotVerified) {
        setPendingEmail(formData.email.trim().toLowerCase());
        setOtpDialogOpen(true);
      } else {
        setError(result.error || "Invalid email or password.");
        refreshCaptcha();
      }
    } catch (err) {
      setError("Cannot connect to server. Check that the backend is running.");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleAdminOtpVerify = async (e) => {
    e.preventDefault();
    setAdminOtpError("");
    if (!adminOtp || adminOtp.length !== 6) {
      setAdminOtpError("Please enter the 6-digit OTP."); return;
    }
    setAdminOtpLoading(true);
    const result = await adminLoginVerifyOtp(adminEmail, adminOtp.trim());
    setAdminOtpLoading(false);
    if (result.success) {
      navigate("/admin");
    } else {
      setAdminOtpError(result.message || "Invalid or expired OTP.");
    }
  };

  const handleAdminResendOtp = async () => {
    setResendLoading(true); setAdminOtpError("");
    const result = await adminLoginSendOtp(adminEmail, formData.password.trim(), "local-captcha-passed");
    setResendLoading(false);
    if (result.success) {
      setCountdown(60);
    } else {
      setAdminOtpError(result.message || "Failed to resend OTP.");
    }
  };

  // ── Admin OTP verification screen ──────────────────────────────────────────
  if (adminOtpStep) {
    return (
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #10241f 0%, #1f4d45 52%, #d9a441 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container maxWidth="sm">
          <Card elevation={10} sx={{ borderRadius: 4, background: "rgba(255, 250, 240, 0.98)", border: "1px solid #eadfc9" }}>
            <CardContent sx={{ p: 5 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar sx={{ bgcolor: "#1f4d45", color: "#f7f1e3", width: 60, height: 60, margin: "0 auto", mb: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#16302b" }}>Admin Email Verification</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  An OTP has been sent to <strong>{adminEmail}</strong>.<br />Enter it below to complete login.
                </Typography>
              </Box>

              {adminOtpError && <Alert severity="error" sx={{ mb: 2 }}>{adminOtpError}</Alert>}

              <form onSubmit={handleAdminOtpVerify}>
                <TextField
                  fullWidth label="6-Digit OTP" value={adminOtp}
                  onChange={(e) => { setAdminOtp(e.target.value); setAdminOtpError(""); }}
                  margin="normal"
                  inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontWeight: "bold", fontSize: 22, textAlign: "center" } }}
                  placeholder="000000" required />

                <Box sx={{ textAlign: "right", mt: -0.5, mb: 2 }}>
                  {countdown > 0 ? (
                    <Typography variant="caption" color="text.secondary">Resend OTP in {countdown}s</Typography>
                  ) : (
                    <Typography variant="caption" sx={{ cursor: "pointer", color: "#1f4d45", fontWeight: "bold" }}
                      onClick={!resendLoading ? handleAdminResendOtp : undefined}>
                      {resendLoading ? "Sending..." : "↺ Resend OTP"}
                    </Typography>
                  )}
                </Box>

                <Button type="submit" fullWidth variant="contained" disabled={adminOtpLoading}
                  sx={{ mt: 1, background: "#1f4d45", "&:hover": { background: "#16302b" } }}>
                  {adminOtpLoading ? <CircularProgress size={24} color="inherit" /> : "Verify & Login"}
                </Button>
              </form>

              <Divider sx={{ my: 2 }} />
              <Typography sx={{ textAlign: "center" }}>
                <Link to="/login" onClick={() => setAdminOtpStep(false)}>← Back to Login</Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // ── Normal login screen ────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #10241f 0%, #1f4d45 52%, #d9a441 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 4, background: "rgba(255, 250, 240, 0.98)", border: "1px solid #eadfc9" }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar sx={{ bgcolor: "#1f4d45", color: "#f7f1e3", width: 60, height: 60, margin: "0 auto", mb: 2 }}>
                <SchoolIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#16302b" }}>EduFeedback</Typography>
              <Typography color="text.secondary">Sign in to your account</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Email" name="email" type="email"
                onChange={handleChange} margin="normal" required
                placeholder="example@gmail.com or example@kluniversity.in"
                helperText="Use a Gmail or KL University email address" />
              <TextField fullWidth label="Password" name="password" type="password"
                onChange={handleChange} margin="normal" required />

              {/* Image CAPTCHA */}
              <Box sx={{ mt: 2, mb: 1, p: 2, border: "1px solid #d9ccb2", borderRadius: 2, background: "#fffaf0" }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  Type the characters you see below:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <canvas ref={canvasRef} width={200} height={56}
                    style={{ borderRadius: 8, border: "1px solid #ccc", display: "block" }} />
                  <Button size="small" onClick={refreshCaptcha} variant="outlined" sx={{ minWidth: 36, fontSize: 18 }}>↺</Button>
                </Box>
                <TextField fullWidth size="small" label="Enter CAPTCHA"
                  value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                  inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontWeight: "bold" } }} required />
              </Box>

              <Button type="submit" fullWidth variant="contained"
                sx={{ mt: 2, background: "#1f4d45", "&:hover": { background: "#16302b" } }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
              </Button>
            </form>

            <Typography sx={{ mt: 2, textAlign: "center" }}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ mt: 1, textAlign: "center" }}>
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>

      <OtpVerifyDialog open={otpDialogOpen} email={pendingEmail}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={() => { setOtpDialogOpen(false); navigate("/login"); }} />
    </Box>
  );
};

export default Login;
