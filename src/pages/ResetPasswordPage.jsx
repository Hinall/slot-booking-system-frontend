import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import AuthLayout from "../components/Auth/AuthLayout";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const missingParams = useMemo(() => !token.trim() || !email.trim(), [token, email]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (missingParams) {
      showToast("error", "Invalid or missing reset link. Request a new reset email.");
      return;
    }

    if (!newPassword || newPassword.length < 1) {
      showToast("error", "Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        token: token.trim(),
        email: email.trim(),
        newPassword,
      });
      showToast("success", res?.message || "Password reset successful.");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Password reset failed. Try again or request a new link.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <form className="w-full" onSubmit={onSubmit}>
          <h2 className="text-[24px] font-bold text-[#1E2E63] mb-2">Reset Password.</h2>

          <p className="text-[11px] text-gray-600 leading-5 mb-6 max-w-[320px]">
            Enter your new password below. Token and email are taken from the link you opened.
          </p>

          <div className="border-t border-gray-200 mb-6" />

          {missingParams && (
            <p className="text-[11px] text-red-600 mb-4">
              This page needs <code className="text-[10px]">?token=...&amp;email=...</code> in the
              URL. Open the link from your email or request a new reset.
            </p>
          )}

          {!missingParams && (
            <p className="text-[11px] text-gray-500 mb-4 break-all">
              Resetting for: <span className="font-medium text-gray-700">{email}</span>
            </p>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-800 mb-2">
                New password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-800 mb-2">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || missingParams}
            className="mt-8 w-full h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px] disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <p className="text-[11px] text-gray-600 text-center mt-5">
            <Link to="/" className="text-[#2F3B8A] underline cursor-pointer">
              Back to Sign In
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

export default ResetPasswordPage;
