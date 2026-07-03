import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGroupContext } from "../context/GroupContext.jsx";
import { useAuth } from "./AuthProvider.jsx";

const useGetAllGroups = () => {
  const [loading, setLoading] = useState(false);
  const { setGroups, setLoading: setContextLoading } = useGroupContext();
  const [authUser] = useAuth();

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser?.user?._id) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const getGroups = async () => {
      setLoading(true);
      setContextLoading(true);
      try {
        const token = Cookies.get("jwt");
        
        const res = await axios.get("/api/group/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setGroups(res.data.groups || []);
        setLoading(false);
        setContextLoading(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setLoading(false);
        setContextLoading(false);
        
        // Show error toast for auth failures
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          toast.error("Not authorized to access groups.");
        } else {
          toast.error("Failed to load chats. Please try again.");
        }
      }
    };

    getGroups();
  }, [authUser?.user?._id]); // Only depend on userId, not function references

  return { loading };
};

export default useGetAllGroups;
