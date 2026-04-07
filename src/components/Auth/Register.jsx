import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, verifyEmailOtp } from "../../api/auth.api";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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
      const res = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      const emailFromApi = res?.user?.email || form.email;
      setRegisteredEmail(emailFromApi);
      setOtp("");
      setShowOtpModal(true);

      showToast(
        "success",
        res?.message || "Registration successful. Check your email for the OTP."
      );
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otp || otp.trim().length === 0) {
      showToast("error", "Please enter the OTP.");
      return;
    }

    setVerifyLoading(true);
    try {
      await verifyEmailOtp({ otp: otp.trim(), email: registeredEmail });
      showToast("success", "Email verified successfully. You can now sign in.");
      setShowOtpModal(false);
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "OTP verification failed.";
      showToast("error", msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <>
      <form className="w-full" onSubmit={onSubmit}>
        <h2 className="text-[24px] font-bold text-[#1E2E63] mb-2">Sign Up.</h2>

        <p className="text-[11px] text-gray-600 leading-5 mb-6 max-w-[320px]">
          Access your account to start creating, monitoring, and optimizing digital
          ads more efficiently.
        </p>

        <div className="border-t border-gray-200 mb-6" />

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-800 mb-2">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
            />
          </div>

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
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px] disabled:opacity-60"
        >
          Sign Up
        </button>

        <p className="text-[11px] text-gray-600 text-center mt-5">
          Already have an account?{" "}
          <Link to="/" className="text-[#2F3B8A] underline cursor-pointer">
            Login
          </Link>
        </p>
      </form>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-[18px] font-semibold text-[#1E2E63]">
                Verify email OTP
              </h3>
              <p className="text-[11px] text-gray-600 mt-2">
                Enter the OTP sent to <span className="font-medium">{registeredEmail}</span>
              </p>
            </div>

            <div className="p-6">
              <label className="block text-[11px] font-semibold text-gray-800 mb-2">
                OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 pb-2 outline-none text-[12px] placeholder:text-gray-400"
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-full h-[40px] bg-gray-100 text-gray-800 rounded-md font-medium text-[13px]"
                  disabled={verifyLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onVerifyOtp}
                  disabled={verifyLoading}
                  className="w-full h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px] disabled:opacity-60"
                >
                  {verifyLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Register;