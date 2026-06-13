import React, { useState } from "react";
import axios from "axios";
import useGroup from "../statemanage/useGroup.js";

const useSendGroupMessage = () => {
  const [loading, setLoading] = useState(false);
  const { selectedGroup } = useGroup();

  const sendGroupMessage = async (message) => {
    setLoading(true);
    try {
      await axios.post(
        `/api/message/group/send/${selectedGroup._id}`,
        { message }
      );
      
      setLoading(false);
    } catch (error) {
      console.log("Error in sending group message:", error);
      setLoading(false);
    }
  };

  return { loading, sendGroupMessage };
};

export default useSendGroupMessage;
