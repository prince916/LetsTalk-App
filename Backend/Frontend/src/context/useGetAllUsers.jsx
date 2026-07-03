import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import apiClient from "./axiosConfig.js";
import { useAuth } from "./AuthContext.jsx";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();
  const userId = authUser?.user?._id;
  
  useEffect(() => {
    if (!userId) {
      return;
    }

    let isCancelled = false;

    const getUsers = async () => {
      setLoading(true);

      try {
        const token = Cookies.get("jwt");
        const response = await apiClient.get("/api/user/allUsers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isCancelled) {
          setAllUsers(response.data);
        }
      } catch (error) {
        console.error("Error in useGetAllUsers:", error);

        if (!isCancelled && error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (!isCancelled) {
          toast.error("Failed to load users. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    getUsers();

    return () => {
      isCancelled = true;
    };
  }, [userId]);
  
  return [allUsers, loading];
}

export default useGetAllUsers;