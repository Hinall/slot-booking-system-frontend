import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";
import AuthLayout from "../components/Auth/AuthLayout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
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
      const res = await forgotPassword({ email });
      showToast("success", res?.message || "Reset link sent to your email.");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to send reset link. Try again.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <form className="w-full" onSubmit={onSubmit}>
          <h2 className="text-[24px] font-bold text-[#1E2E63] mb-2">
            Forgot Password.
          </h2>

          <p className="text-[11px] text-gray-600 leading-5 mb-6 max-w-[320px]">
            Enter your email and we&apos;ll send you a password reset link.
          </p>

          <div className="border-t border-gray-200 mb-6" />

          <div>
            <label className="block text-[11px] font-semibold text-gray-800 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px] disabled:opacity-60"
          >
            Send reset link
          </button>

          <p className="text-[11px] text-gray-600 text-center mt-5">
            Back to{" "}
            <Link to="/" className="text-[#2F3B8A] underline cursor-pointer">
              Sign In
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
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

