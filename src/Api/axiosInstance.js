import axios from "axios";
import useAuthStore from "../store/useAuthStore";

// one axios instance for every request, so the base url and the token live in one place
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// the API is JWT bearer only (no cookies), so attach the token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = token expired, or the account was blocked / deleted / re-roled since login
    if (status === 401 && !window.location.pathname.startsWith("/auth")) {
      useAuthStore.getState().logout();
      window.location.href = "/auth/login?expired=1";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
