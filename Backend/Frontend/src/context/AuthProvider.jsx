import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const getInitialAuthUser = () => {
  try {
    const storedAuthUser = localStorage.getItem("ChatApp");
    if (storedAuthUser) {
      return JSON.parse(storedAuthUser);
    }
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
  }

  try {
    const jwtToken = Cookies.get("jwt");
    if (jwtToken && jwtToken.startsWith("{")) {
      return JSON.parse(jwtToken);
    }
  } catch (error) {
    console.warn("Failed to parse jwt cookie auth user", error);
  }

  return undefined;
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(getInitialAuthUser);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);