import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // Needed for httpOnly cookie (refreshToken) on cross-origin requests.
  withCredentials: true,
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  config.withCredentials = true;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// refresh token logic
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Prevent recursive refresh loop:
    // if the refresh-token call itself fails with 401, do NOT try to refresh again.
    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await api.get("/auth/refresh-token");

        localStorage.setItem("accessToken", res.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;