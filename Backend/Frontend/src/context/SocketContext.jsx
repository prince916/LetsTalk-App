import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider.jsx";
import io from "socket.io-client";

const socketContext = createContext();

const getSocketUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5002"; // SSR fallback
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const { hostname, protocol } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5002";
  }

  // ✅ Use wss:// if site is served over https
  return protocol === "https:"
    ? "wss://letstalk-app.onrender.com"
    : "http://letstalk-app.onrender.com";
};

const SOCKET_URL = getSocketUrl();

export const useSocketContext = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    if (authUser?.user?._id) {
      const socketInstance = io(SOCKET_URL, {
        query: { userId: authUser.user._id },
        transports: ["websocket", "polling"], // ✅ keep both
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 500,
      });

      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", setOnlineUsers);

      return () => {
        socketInstance.off("getOnlineUsers");
        socketInstance.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [authUser]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};
