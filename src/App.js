import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VisitorHomePage from "./pages/VisitorHomePage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import BookingPage from "./pages/BookingPage";

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Visitor landing */}
        <Route path="/" element={<VisitorHomePage />} />

        {/* Auth Page (Login/Register UI) */}
        <Route path="/signin" element={<Home />} />

        {/* Visitor: browse hosts and book by user id */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/book/:userId" element={<BookingPage />} />

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