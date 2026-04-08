import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser({
        email: form.email,
        password: form.password,
      });
      // loginUser stores accessToken in localStorage
      showToast("success", "Signed in successfully.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="w-full" onSubmit={onSubmit}>
      <h2 className="text-[24px] font-bold text-[#1E2E63] mb-2">Sign In.</h2>

      <p className="text-[11px] text-gray-600 leading-5 mb-6 max-w-[320px]">
        Sign in to start managing your account.
      </p>

      <div className="border-t border-gray-200 mb-6" />

      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-gray-800 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-800 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
          />

          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-[11px] text-[#2F3B8A] underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px] disabled:opacity-60"
      >
        Sign In
      </button>

      <p className="text-[11px] text-gray-600 text-center mt-5">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-[#2F3B8A] underline cursor-pointer">
          Sign Up
        </Link>
      </p>

      <p className="text-[11px] text-gray-600 text-center mt-4">
        Looking to book a time?{" "}
        <Link to="/users" className="text-[#2F3B8A] underline cursor-pointer">
          Browse hosts
        </Link>
      </p>
      </form>

      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <div
            className={[
              "px-4 py-3 rounded-lg shadow-lg text-white text-[13px] flex items-start gap-2",
              toast.type === "success" ? "bg-green-600" : "bg-red-600",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <div className="font-semibold">
              {toast.type === "success" ? "Success" : "Error"}
            </div>
            <div className="leading-4">{toast.message}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
