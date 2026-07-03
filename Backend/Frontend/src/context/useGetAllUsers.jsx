import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthProvider.jsx";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();
  
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser?.user?._id) {
      setAllUsers([]);
      setLoading(false);
      return;
    }

    const getUsers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get("/api/user/allUsers", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error in useGetAllUsers:", error);
        setLoading(false);
        
        // Show error toast for failed requests
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error("Failed to load users. Please try again.");
        }
      }
    };
    
    getUsers();
  }, [authUser?.user?._id]); // Only depend on userId, not authUser object
  
  return [allUsers, loading];
}

export default useGetAllUsers;