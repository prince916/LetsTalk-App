import { useCallback, useEffect } from "react";
import { useSocketContext } from "./SocketStateContext.jsx";
import useGroup from "../statemanage/useGroup.js";

const useGroupSocket = () => {
  const { socket } = useSocketContext();
  const { selectedGroup, addGroupMessage } = useGroup();

  useEffect(() => {
    if (!socket) return;

    // Listen for new group messages
    socket.on("newGroupMessage", ({ message, groupId }) => {
      if (groupId === selectedGroup?._id) {
        addGroupMessage(message);
      }
    });

    return () => {
      socket.off("newGroupMessage");
    };
  }, [socket, selectedGroup, addGroupMessage]);

  const joinGroup = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit("joinGroup", groupId);
    }
  }, [socket]);

  const leaveGroup = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit("leaveGroup", groupId);
    }
  }, [socket]);

  const sendTypingIndicator = useCallback((groupId, userName) => {
    if (socket && groupId) {
      socket.emit("groupTyping", { groupId, userName });
    }
  }, [socket]);

  const stopTypingIndicator = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit("groupStoppedTyping", groupId);
    }
  }, [socket]);

  const getGroupOnlineUsers = useCallback((groupId) => {
    if (socket && groupId) {
      socket.emit("getGroupOnlineUsers", groupId);
    }
  }, [socket]);

  return {
    joinGroup,
    leaveGroup,
    sendTypingIndicator,
    stopTypingIndicator,
    getGroupOnlineUsers,
  };
};

export default useGroupSocket;
