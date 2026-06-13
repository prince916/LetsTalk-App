import React, { useState } from "react";
import axios from "axios";
import { useGroupContext } from "./GroupContext.jsx";

const useGroupActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { selectedGroup, setSelectedGroup, groups, setGroups } =
    useGroupContext();

  const updateGroup = async (groupData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.put(
        `/api/group/${selectedGroup._id}/update`,
        {
          name: groupData.name,
          description: groupData.description || "",
          avatar: groupData.avatar || null,
        }
      );

      if (res.data.success) {
        setSelectedGroup(res.data.group);
        setGroups(
          groups.map((g) => (g._id === res.data.group._id ? res.data.group : g))
        );
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error updating group";
      console.log("Error in updating group:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const deleteGroup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.delete(`/api/group/${selectedGroup._id}`);

      if (res.data.success) {
        setGroups(groups.filter((g) => g._id !== selectedGroup._id));
        setSelectedGroup(null);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error deleting group";
      console.log("Error in deleting group:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const leaveGroup = async (groupId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`/api/group/${groupId}/leave`);

      if (res.data.success) {
        setGroups(groups.filter((g) => g._id !== groupId));
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
        }
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error leaving group";
      console.log("Error in leaving group:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const getGroupDetails = async (groupId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/group/${groupId}`);

      if (res.data.success) {
        setSelectedGroup(res.data.group);
        setLoading(false);
        return { success: true, group: res.data.group };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error fetching group";
      console.log("Error in getting group details:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return {
    loading,
    error,
    updateGroup,
    deleteGroup,
    leaveGroup,
    getGroupDetails,
  };
};

export default useGroupActions;
