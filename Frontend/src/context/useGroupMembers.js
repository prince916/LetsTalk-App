import React, { useState } from "react";
import axios from "axios";
import { useGroupContext } from "./GroupContext.jsx";

const useGroupMembers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { selectedGroup, setSelectedGroup, groupMembers, setGroupMembers } =
    useGroupContext();

  const getGroupMembers = async (groupId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/group/${groupId}/members`);
      setGroupMembers(res.data.members || []);
      setLoading(false);
      return res.data.members;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error fetching members";
      console.log("Error in getting group members:", error);
      setError(errorMsg);
      setLoading(false);
      return [];
    }
  };

  const addMember = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`/api/group/${selectedGroup._id}/add-member`, {
        userId,
      });

      if (res.data.success) {
        setSelectedGroup(res.data.group);
        setGroupMembers(res.data.group.members || []);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error adding member";
      console.log("Error in adding member:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const removeMember = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.delete(
        `/api/group/${selectedGroup._id}/remove-member/${userId}`
      );

      if (res.data.success) {
        setSelectedGroup(res.data.group);
        setGroupMembers(res.data.group.members || []);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error removing member";
      console.log("Error in removing member:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const changeMemberRole = async (userId, newRole) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.put(
        `/api/group/${selectedGroup._id}/member/${userId}/role`,
        { role: newRole }
      );

      if (res.data.success) {
        setSelectedGroup(res.data.group);
        setGroupMembers(res.data.group.members || []);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Error changing member role";
      console.log("Error in changing member role:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return {
    loading,
    error,
    groupMembers,
    getGroupMembers,
    addMember,
    removeMember,
    changeMemberRole,
  };
};

export default useGroupMembers;
