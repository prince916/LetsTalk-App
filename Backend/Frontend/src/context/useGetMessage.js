import React, { useEffect, useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useAuth } from "./AuthProvider.jsx";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();
  const [authUser] = useAuth();

  useEffect(() => {
    const getMessages = async () => {
      // Only fetch if user is authenticated and conversation is selected
      if (!authUser?.user?._id || !selectedConversation?._id) {
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const res = await axios.get(
          `/api/message/get/${selectedConversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setMessage(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          toast.error("Not authorized to access these messages.");
        }
      }
    };

    getMessages();
  }, [selectedConversation?._id, authUser?.user?._id]); // Only depend on IDs, not functions

  return { loading, messages };
};

export default useGetMessage;