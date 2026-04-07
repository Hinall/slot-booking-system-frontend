import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logoutAllDevices, logoutUser } from "../api/auth.api";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Validate auth on mount.
    // 2) If auth is removed in another tab (logout-all), redirect immediately.
    const validate = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/");
          return;
        }
        await getMe();
      } catch {
        localStorage.removeItem("accessToken");
        navigate("/");
      }
    };

    validate();

    const onStorage = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        navigate("/");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  const onLogout = async () => {
    try {
      await logoutUser();
    } finally {
      // Simple redirect back to login. (Logout clears accessToken)
      window.location.href = "/";
    }
  };

  const onLogoutAll = async () => {
    try {
      await logoutAllDevices();
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#1E2E63]">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-[13px]">
          You are logged in successfully.
        </p>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 w-[160px] h-[40px] bg-[#2F3B8A] text-white rounded-md font-medium text-[13px]"
        >
          Logout
        </button>

        <button
          type="button"
          onClick={onLogoutAll}
          className="mt-4 w-[260px] h-[40px] bg-white border border-[#2F3B8A] text-[#2F3B8A] rounded-md font-medium text-[13px]"
        >
          Logout from all devices
        </button>
      </div>
    </div>
  );
};

export default Dashboard;