/**
 * FRONTEND GROUP CHAT - QUICK REFERENCE GUIDE
 * 
 * Import and use group chat features in your components
 */

// ==========================================
// OPTION 1: Use the combined hook (RECOMMENDED)
// ==========================================

import useGroupChat from "@/context/useGroupChat.js";

function MyComponent() {
  const {
    // Data
    selectedGroup,
    groups,
    groupMembers,
    groupOnlineUsers,
    typingUsers,
    groupMessages,
    
    // Group operations
    selectGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    leaveGroup,
    
    // Member operations
    addMember,
    removeMember,
    changeMemberRole,
    
    // Message operations
    sendGroupMessage,
    
    // Socket operations
    sendTypingIndicator,
    stopTypingIndicator,
    
    // States
    loading,
    error,
  } = useGroupChat();
  
  // Use it!
}

// ==========================================
// OPTION 2: Use individual hooks (if needed)
// ==========================================

import useGetAllGroups from "@/context/useGetAllGroups.js";
import useGetGroupMessages from "@/context/useGetGroupMessages.js";
import useSendGroupMessage from "@/context/useSendGroupMessage.js";
import useCreateGroup from "@/context/useCreateGroup.js";
import useGroupMembers from "@/context/useGroupMembers.js";
import useGroupActions from "@/context/useGroupActions.js";
import useGroupSocket from "@/context/useGroupSocket.js";
import { useGroupContext } from "@/context/GroupContext.jsx";

// ==========================================
// COMMON USAGE PATTERNS
// ==========================================

// 1. Fetch and display all groups
useGetAllGroups(); // Auto-fetches on mount

// 2. Select a group and fetch messages
selectGroup(groupId);
// Messages auto-load when group changes

// 3. Send a message
await sendGroupMessage("Hello team!");

// 4. Show typing indicator
sendTypingIndicator(groupId, userName);
// Auto-clears after 3 seconds

// 5. Create a new group
const result = await createGroup({
  name: "Project Team",
  description: "Discussing project plans",
  avatar: "https://..." // optional
});

// 6. Add member to group
await addMember(userId);

// 7. Get online users count
console.log(groupOnlineUsers); // Array of user IDs

// 8. Monitor typing users
Object.entries(typingUsers).forEach(([userId, userName]) => {
  console.log(`${userName} is typing...`);
});

// ==========================================
// COMPONENT INTEGRATION EXAMPLES
// ==========================================

// Groups List Component
function GroupsList() {
  const { groups, selectGroup, loading } = useGroupChat();
  
  return (
    <div>
      {loading ? <Spinner /> : null}
      {groups.map((group) => (
        <div key={group._id} onClick={() => selectGroup(group)}>
          {group.name}
        </div>
      ))}
    </div>
  );
}

// Group Chat Component
function GroupChat() {
  const {
    selectedGroup,
    groupMessages,
    sendGroupMessage,
    groupOnlineUsers,
    typingUsers,
    sendTypingIndicator,
    loading,
  } = useGroupChat();
  
  const handleSendMessage = async (text) => {
    await sendGroupMessage(text);
  };
  
  const handleTyping = (text) => {
    sendTypingIndicator(selectedGroup?._id, "You");
  };
  
  return (
    <div>
      <h2>{selectedGroup?.name} ({groupOnlineUsers.length} online)</h2>
      
      <div className="messages">
        {groupMessages.map((msg) => (
          <div key={msg._id}>{msg.message}</div>
        ))}
      </div>
      
      {Object.values(typingUsers).length > 0 && (
        <p>{Object.values(typingUsers).join(", ")} is typing...</p>
      )}
      
      <input onChange={handleTyping} />
      <button onClick={() => handleSendMessage("text")}>Send</button>
    </div>
  );
}

// Group Members Component
function GroupMembers() {
  const {
    groupMembers,
    addMember,
    removeMember,
    changeMemberRole,
  } = useGroupChat();
  
  return (
    <div>
      {groupMembers.map((member) => (
        <div key={member.userId._id}>
          <span>{member.userId.name} ({member.role})</span>
          <button onClick={() => removeMember(member.userId._id)}>Remove</button>
          <button onClick={() => changeMemberRole(member.userId._id, "admin")}>
            Make Admin
          </button>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// SOCKET EVENTS EMITTED
// ==========================================

// From client:
socket.emit("joinGroup", groupId);
socket.emit("leaveGroup", groupId);
socket.emit("groupTyping", { groupId, userName });
socket.emit("groupStoppedTyping", groupId);
socket.emit("getGroupOnlineUsers", groupId);

// From server:
socket.on("newGroupMessage", (data) => {});
socket.on("groupOnlineUsers", (users) => {});
socket.on("userJoinedGroup", (data) => {});
socket.on("userLeftGroup", (data) => {});
socket.on("groupTypingIndicator", (data) => {});
socket.on("groupStoppedTypingIndicator", (data) => {});
socket.on("groupUpdated", (data) => {});
socket.on("memberAdded", (data) => {});
socket.on("memberRemoved", (data) => {});
socket.on("memberRoleChanged", (data) => {});
socket.on("groupDeleted", (data) => {});
