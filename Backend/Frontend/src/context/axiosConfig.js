import axios from "axios";

// Get backend URL from environment or default to localhost:5002
const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (typeof window !== "undefined") {
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocalHost) {
      // In local development, use the Vite proxy so auth cookies stay on the same origin.
      return "";
    }

    // In production, use the same origin.
    return window.location.origin;
  }

  // Non-browser fallback
  return "http://localhost:5002";
};

// Create axios instance with baseURL
const apiClient = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
});

export default apiClient;
