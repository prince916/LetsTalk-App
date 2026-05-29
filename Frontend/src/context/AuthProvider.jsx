import React, { createContext } from "react";

export const AuthContext = createContext();

function AuthProvider({children}) {
  return (
    <>
      <div>AuthProvider</div>
    </>
  );
}

export default AuthProvider;
