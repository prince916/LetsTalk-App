import { useEffect, useState } from "react";
import { GroupContext } from "./GroupStateContext.jsx";
import { useSocketContext } from "./SocketStateContext.jsx";

export const GroupProvider = ({ children }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupOnlineUsers, setGroupOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();

  // Socket listeners for group events
  useEffect(() => {
    if (!socket) return;

    // Listen for group online users
    socket.on("groupOnlineUsers", (users) => {
      setGroupOnlineUsers(users || []);
    });

    // Listen for user joined group
    socket.on("userJoinedGroup", ({ onlineUsers }) => {
      setGroupOnlineUsers(onlineUsers || []);
    });

    // Listen for user left group
    socket.on("userLeftGroup", ({ onlineUsers }) => {
      setGroupOnlineUsers(onlineUsers || []);
    });

    // Listen for typing indicator
    socket.on("groupTypingIndicator", ({ userId, userName }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: userName,
      }));
      
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    });

    // Listen for stopped typing
    socket.on("groupStoppedTypingIndicator", ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    // Listen for group updated
    socket.on("groupUpdated", ({ updatedGroup }) => {
      setSelectedGroup(updatedGroup);
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
    });

    // Listen for member added
    socket.on("memberAdded", ({ group }) => {
      setSelectedGroup(group);
      setGroups((prev) =>
        prev.map((g) => (g._id === group._id ? group : g))
      );
      setGroupMembers(group.members || []);
    });

    // Listen for member removed
    socket.on("memberRemoved", ({ group }) => {
      setSelectedGroup(group);
      setGroups((prev) =>
        prev.map((g) => (g._id === group._id ? group : g))
      );
      setGroupMembers(group.members || []);
    });

    // Listen for member role changed
    socket.on("memberRoleChanged", ({ group }) => {
      if (group) {
        setSelectedGroup(group);
        setGroups((prev) =>
          prev.map((g) => (g._id === group._id ? group : g))
        );
        setGroupMembers(group.members || []);
      }
    });

    // Listen for group deleted
    socket.on("groupDeleted", ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setGroupMembers([]);
      }
    });

    return () => {
      socket.off("groupOnlineUsers");
      socket.off("userJoinedGroup");
      socket.off("userLeftGroup");
      socket.off("groupTypingIndicator");
      socket.off("groupStoppedTypingIndicator");
      socket.off("groupUpdated");
      socket.off("memberAdded");
      socket.off("memberRemoved");
      socket.off("memberRoleChanged");
      socket.off("groupDeleted");
    };
  }, [socket, selectedGroup]);

  const value = {
    selectedGroup,
    setSelectedGroup,
    groups,
    setGroups,
    groupMembers,
    setGroupMembers,
    groupOnlineUsers,
    typingUsers,
    loading,
    setLoading,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
