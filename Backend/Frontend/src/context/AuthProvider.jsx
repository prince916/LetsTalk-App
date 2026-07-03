import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // ✅ handles real JWTs safely

export const AuthContext = createContext();

const getInitialAuthUser = () => {
  // Try localStorage first
  try {
    const storedAuthUser = localStorage.getItem("ChatApp");
    if (storedAuthUser) {
      return JSON.parse(storedAuthUser);
    }
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
  }

  // Then try cookie
  try {
    const jwtToken = Cookies.get("jwt");
    if (jwtToken) {
      // If cookie looks like JSON, parse it
      if (jwtToken.startsWith("{")) {
        return JSON.parse(jwtToken);
      }
      // Otherwise, decode as a real JWT
      return jwtDecode(jwtToken);
    }
  } catch (error) {
    console.warn("Failed to decode jwt cookie auth user", error);
  }

  return undefined;
};

export const AuthProvider = ({ children }) => {
  // ✅ Lazy initialization with function call
  const [authUser, setAuthUser] = useState(() => getInitialAuthUser());

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
