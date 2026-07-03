import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider.jsx";
import io from "socket.io-client";

const socketContext = createContext();

const getSocketUrl = () => {
  // Use Vite environment variable if available
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // If in browser and not localhost, use window origin (for production)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin;
  }

  // Development default
  return "http://localhost:5002";
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
