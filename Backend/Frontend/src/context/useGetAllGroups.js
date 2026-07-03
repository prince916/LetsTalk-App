import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import apiClient from "./axiosConfig.js";
import { useGroupContext } from "../context/GroupStateContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const useGetAllGroups = () => {
  const [loading, setLoading] = useState(false);
  const { setGroups, setLoading: setContextLoading } = useGroupContext();
  const [authUser] = useAuth();
  const userId = authUser?.user?._id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isCancelled = false;

    const getGroups = async () => {
      setLoading(true);
      setContextLoading(true);

      try {
        const token = Cookies.get("jwt");
        
        const res = await apiClient.get("/api/group/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isCancelled) {
          setGroups(res.data.groups || []);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        
        if (!isCancelled && error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (!isCancelled && error.response?.status === 403) {
          toast.error("Not authorized to access groups.");
        } else if (!isCancelled) {
          toast.error("Failed to load chats. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setContextLoading(false);
        }
      }
    };

    getGroups();

    return () => {
      isCancelled = true;
    };
  }, [setContextLoading, setGroups, userId]);

  return { loading };
};

export default useGetAllGroups;
