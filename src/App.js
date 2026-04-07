import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Auth Page (Login/Register UI) */}
        <Route path="/" element={<Home />} />

        {/* Register page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Forgot password */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Reset password (link from email: ?token=&email=) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* After Login */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;