import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, FormControl, InputLabel, Select, MenuItem,
  Alert, Avatar, IconButton, InputAdornment, CircularProgress,
  LinearProgress,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import OtpVerifyDialog from "../components/OtpVerifyDialog";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const allowedEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|kluniversity\.in)$/i;
function generateCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}
function drawCaptcha(canvas, code) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#fff0e6"); grad.addColorStop(1, "#e6fff0");
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
    ctx.save(); ctx.translate(charW*(i+0.8)+Math.random()*6-3, h/2+8);
    ctx.rotate((Math.random()-0.5)*0.5);
    ctx.font = `bold ${24+Math.floor(Math.random()*8)}px ${Math.random()>0.5?"Georgia":"Arial"}`;
    ctx.fillStyle = `hsl(${Math.random()*360},70%,30%)`;
    ctx.fillText(code[i], 0, 0); ctx.restore();
  }
}

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "error" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;
  if (score <= 2) return { score: (score / 6) * 100, label: "Weak", color: "error" };
  if (score <= 4) return { score: (score / 6) * 100, label: "Medium", color: "warning" };
  return { score: (score / 6) * 100, label: "Strong", color: "success" };
}

const Register = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", role: "", department: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCode());
  const [captchaInput, setCaptchaInput] = useState("");
  const canvasRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (canvasRef.current) drawCaptcha(canvasRef.current, captchaCode); }, [captchaCode]);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
  const pwStrength = getPasswordStrength(formData.password);

  const refreshCaptcha = () => { setCaptchaCode(generateCode()); setCaptchaInput(""); };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName.trim()) return setError("Full name is required.");
    if (!allowedEmailRegex.test(formData.email.trim()))
      return setError("Please enter a valid email ending with @gmail.com or @kluniversity.in.");
    if (!formData.role) return setError("Please select a role.");
    if (formData.role === "admin" && !formData.department.trim()) return setError("Department is required for admin registration.");
    if (!passwordRegex.test(formData.password))
      return setError("Password must be at least 8 characters and include uppercase, lowercase, number & special character (@$!%*?&#).");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");
    if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setError("Incorrect CAPTCHA. Please try again.");
      refreshCaptcha(); return;
    }

    setLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        department: formData.role === "admin" ? formData.department.trim() : "",
        captchaToken: "local-captcha-passed",
      });
      if (result.success) {
        setRegisteredEmail(formData.email.trim().toLowerCase());
        setOtpDialogOpen(true);
      } else {
        setError(result.message || "Registration failed.");
        refreshCaptcha();
      }
    } catch (err) {
      setError("Cannot connect to server. Check that the backend is running.");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #10241f 0%, #2a5a50 52%, #d9a441 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 4, background: "rgba(255, 250, 240, 0.98)", border: "1px solid #eadfc9" }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar sx={{ bgcolor: "#1f4d45", color: "#f7f1e3", width: 60, height: 60, margin: "0 auto", mb: 2 }}>
                <SchoolIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#16302b" }}>EduFeedback</Typography>
              <Typography color="text.secondary">Create your account</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <TextField fullWidth label="Full Name" name="fullName" onChange={handleChange} margin="normal" required />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                onChange={handleChange}
                margin="normal"
                required
                placeholder="example@gmail.com or example@kluniversity.in"
                helperText="Only Gmail or KL University email addresses are allowed"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Select Role</InputLabel>
                <Select name="role" value={formData.role} onChange={handleChange} label="Select Role">
                  <MenuItem value=""><em>Select Role</em></MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {formData.role === "admin" && (
                <TextField fullWidth label="Department *" name="department" value={formData.department} onChange={handleChange} margin="normal" placeholder="e.g. Computer Science" required />
              )}

              {/* Password with strength indicator */}
              <TextField
                fullWidth label="Password" name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange} margin="normal" required
                helperText="Min 8 chars: uppercase, lowercase, number & special char (@$!%*?&#)"
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />
              {formData.password && (
                <Box sx={{ mt: -1, mb: 1, px: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pwStrength.score}
                    color={pwStrength.color}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color={`${pwStrength.color}.main`} sx={{ fontWeight: "bold" }}>
                    Password Strength: {pwStrength.label}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth label="Confirm Password" name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                onChange={handleChange} margin="normal" required
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />

              {/* Image CAPTCHA */}
              <Box sx={{ mt: 2, mb: 1, p: 2, border: "1px solid #d9ccb2", borderRadius: 2, background: "#fffaf0" }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  Type the characters you see below:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <canvas ref={canvasRef} width={200} height={56} style={{ borderRadius: 8, border: "1px solid #ccc", display: "block" }} />
                  <Button size="small" onClick={refreshCaptcha} variant="outlined" sx={{ minWidth: 36, fontSize: 18 }}>↺</Button>
                </Box>
                <TextField fullWidth size="small" label="Enter CAPTCHA"
                  value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                  inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontWeight: "bold" } }} required />
              </Box>

              <Button type="submit" fullWidth variant="contained"
                sx={{ mt: 2, background: "#1f4d45", "&:hover": { background: "#16302b" } }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
              </Button>
            </form>

            <Typography sx={{ mt: 2, textAlign: "center" }}>
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>

      <OtpVerifyDialog open={otpDialogOpen} email={registeredEmail}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={() => { setOtpDialogOpen(false); navigate("/login"); }} />
    </Box>
  );
};

export default Register;
