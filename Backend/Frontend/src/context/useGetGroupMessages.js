import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import useGroup from "../statemanage/useGroup.js";
import { useAuth } from "./AuthProvider.jsx";

const useGetGroupMessages = () => {
  const [loading, setLoading] = useState(false);
  const { groupMessages, setGroupMessages, selectedGroup } = useGroup();
  const [authUser] = useAuth();

  useEffect(() => {
    const getGroupMessages = async () => {
      // Only fetch if user is authenticated and group is selected
      if (!authUser?.user?._id || !selectedGroup?._id) {
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const res = await axios.get(
          `/api/group/${selectedGroup._id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setGroupMessages(res.data.messages || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching group messages:", error);
        setLoading(false);
        
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          toast.error("Not authorized to access these messages.");
        }
      }
    };

    getGroupMessages();
  }, [selectedGroup?._id, authUser?.user?._id]); // Only depend on IDs, not functions

  return { loading, groupMessages };
};

export default useGetGroupMessages;
