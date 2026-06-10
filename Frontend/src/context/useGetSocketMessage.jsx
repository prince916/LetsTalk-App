import React, { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../statemanage/useConversation.js";
import sound from "../assets/notification.mp3";
const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessage } = useConversation();

  useEffect(() => {
    socket.on("newMessage", (newMessage) => { 
      const notification = new Audio(sound);
      // console.log(sound);
      notification.play().catch((err) => {
        console.log("Audio error:", err);
      });
      setMessage((prev) => [...prev, newMessage]);
    });
    return () => {
      socket?.off("newMessage");
    };
  }, [socket, messages, setMessage]);
};
export default useGetSocketMessage;
