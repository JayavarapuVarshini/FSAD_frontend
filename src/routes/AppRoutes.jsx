import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import CreateFeedback from "../pages/CreateFeedback";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ✅ FIXED PATHS */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/create-feedback" element={<CreateFeedback />} />
    </Routes>
  );
}

export default AppRoutes;
