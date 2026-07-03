import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import apiClient from "./axiosConfig.js";

const getInitialAuthUser = () => {
  try {
    const storedAuthUser = localStorage.getItem("ChatApp");
    if (storedAuthUser) {
      return JSON.parse(storedAuthUser);
    }
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => getInitialAuthUser());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const validateSession = async () => {
      if (!authUser?.user?._id) {
        if (!isCancelled) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const response = await apiClient.get("/api/user/session");
        const sessionUser = { user: response.data.user };

        if (!isCancelled) {
          localStorage.setItem("ChatApp", JSON.stringify(sessionUser));
          setAuthUser(sessionUser);
        }
      } catch {
        if (!isCancelled) {
          localStorage.removeItem("ChatApp");
          setAuthUser(null);
        }
      } finally {
        if (!isCancelled) {
          setAuthReady(true);
        }
      }
    };

    validateSession();

    return () => {
      isCancelled = true;
    };
  }, [authUser?.user?._id]);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser, authReady]}>
      {children}
    </AuthContext.Provider>
  );
};
