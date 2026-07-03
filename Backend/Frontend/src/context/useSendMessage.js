import { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";
const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();
  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/message/send/${selectedConversation._id}`,
        { message }
      );
      setMessage([...messages, res.data]);
      setLoading(false);
    } catch (error) {
      console.log("Error in send messages", error);
      setLoading(false);
    }
  };

  const sendImageMessage = async (file, message = "") => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("message", message);

      const res = await axios.post(
        `/api/message/send-image/${selectedConversation._id}`,
        formData
      );
      setMessage([...messages, res.data]);
    } catch (error) {
      console.log("Error in send image message", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages, sendImageMessage };
};

export default useSendMessage;
