import api from "./axios";

// REGISTER
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// LOGIN
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);

  // store access token
  localStorage.setItem("accessToken", res.data.accessToken);

  return res.data;
};

// GET USER
export const getMe = async () => {
  const res = await api.get("/auth/get-me");
  return res.data;
};

// LOGOUT
export const logoutUser = async () => {
  await api.get("/auth/logout");
//   localStorage.removeItem("accessToken");
};

// REFRESH ACCESS TOKEN (uses httpOnly cookie `refreshToken`)
export const refreshAccessToken = async () => {
  const res = await api.get("/auth/refresh-token");

  localStorage.setItem("accessToken", res.data.accessToken);
  return res.data;
};

// LOGOUT FROM ALL DEVICES
export const logoutAllDevices = async () => {
  await api.get("/auth/logout-all");
//   localStorage.removeItem("accessToken");
};

// VERIFY EMAIL (OTP)
// Backend supports both body and query params; use query params here.
export const verifyEmailOtp = async ({ otp, email }) => {
  const res = await api.get("/auth/verify-email", {
    params: { otp, email },
  });

  return res.data;
};

// FORGOT PASSWORD
// Body: { email }
export const forgotPassword = async ({ email }) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// RESET PASSWORD
// Body: { token, email, newPassword }
export const resetPassword = async ({ token, email, newPassword }) => {
  const res = await api.post("/auth/reset-password", { token, email, newPassword });
  return res.data;
};