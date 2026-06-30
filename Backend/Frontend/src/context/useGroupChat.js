import React, { useEffect } from "react";
import { useGroupContext } from "./GroupContext.jsx";
import useGroup from "../statemanage/useGroup.js";
import useGetAllGroups from "./useGetAllGroups.js";
import useGetGroupMessages from "./useGetGroupMessages.js";
import useSendGroupMessage from "./useSendGroupMessage.js";
import useCreateGroup from "./useCreateGroup.js";
import useGroupMembers from "./useGroupMembers.js";
import useGroupActions from "./useGroupActions.js";
import useGroupSocket from "./useGroupSocket.js";

/**
 * Comprehensive hook combining all group chat operations
 * Use this in components for easier access to all group functionality
 */
const useGroupChat = () => {
  // Context
  const {
    selectedGroup,
    setSelectedGroup,
    groups,
    setGroups,
    groupMembers,
    setGroupMembers,
    groupOnlineUsers,
    typingUsers,
    loading: contextLoading,
  } = useGroupContext();

  // State
  const {
    selectedGroup: stateSelectedGroup,
    setSelectedGroup: setStateSelectedGroup,
    groups: stateGroups,
    setGroups: setStateGroups,
    groupMessages,
    setGroupMessages,
    addGroupMessage,
    clearGroupMessages,
  } = useGroup();

  // Hooks
  useGetAllGroups();
  const { loading: messagesLoading, groupMessages: hookMessages } =
    useGetGroupMessages();
  const { loading: sendingLoading, sendGroupMessage } = useSendGroupMessage();
  const { loading: creatingLoading, error: createError, createGroup } =
    useCreateGroup();
  const {
    loading: membersLoading,
    error: membersError,
    groupMembers: hookMembers,
    getGroupMembers,
    addMember,
    removeMember,
    changeMemberRole,
  } = useGroupMembers();
  const {
    loading: actionsLoading,
    error: actionsError,
    updateGroup,
    deleteGroup,
    leaveGroup,
    getGroupDetails,
  } = useGroupActions();
  const {
    joinGroup,
    leaveGroup: leaveGroupSocket,
    sendTypingIndicator,
    stopTypingIndicator,
    getGroupOnlineUsers,
  } = useGroupSocket();

  // Sync state when group is selected
  useEffect(() => {
    if (selectedGroup && selectedGroup._id) {
      setStateSelectedGroup(selectedGroup);
      joinGroup(selectedGroup._id);
      getGroupMembers(selectedGroup._id);
    }
  }, [selectedGroup, setStateSelectedGroup, joinGroup, getGroupMembers]);

  // Sync messages
  useEffect(() => {
    if (hookMessages.length > 0 && selectedGroup) {
      setGroupMessages(hookMessages);
    }
  }, [hookMessages, selectedGroup, setGroupMessages]);

  return {
    // Group data
    selectedGroup,
    groups,
    groupMembers,
    groupOnlineUsers,
    typingUsers,
    groupMessages,

    // Group actions
    setSelectedGroup,
    selectGroup: (group) => setSelectedGroup(group),
    createGroup,
    updateGroup,
    deleteGroup,
    leaveGroup: () => leaveGroup(selectedGroup?._id),
    getGroupDetails,

    // Member actions
    addMember,
    removeMember,
    changeMemberRole,
    getGroupMembers,

    // Message actions
    sendGroupMessage,
    clearGroupMessages,

    // Socket actions
    joinGroup,
    leaveGroupSocket,
    sendTypingIndicator,
    stopTypingIndicator,
    getGroupOnlineUsers,

    // Loading & Error states
    loading: contextLoading || messagesLoading || sendingLoading || creatingLoading,
    membersLoading,
    actionsLoading,
    creatingLoading,
    error: createError || membersError || actionsError,
  };
};

export default useGroupChat;
