import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import io from "socket.io-client";
import { SocketContext } from "./SocketStateContext.jsx";

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

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();
  const userId = authUser?.user?._id;

  const socket = useMemo(() => {
    if (!userId) {
      return null;
    }

    return io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
    });
  }, [userId]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.disconnect();
      setOnlineUsers([]);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers: socket ? onlineUsers : [] }}>
      {children}
    </SocketContext.Provider>
  );
};
