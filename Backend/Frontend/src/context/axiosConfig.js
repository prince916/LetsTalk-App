import axios from "axios";

// Get backend URL from environment or default to localhost:5002
const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // In production, use the same origin
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin;
  }
  
  // Development: default to localhost:5002
  return "http://localhost:5002";
};

// Create axios instance with baseURL
const apiClient = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
});

export default apiClient;
