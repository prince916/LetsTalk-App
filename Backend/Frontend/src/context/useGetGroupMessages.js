import React, { useEffect, useState } from "react";
import axios from "axios";
import useGroup from "../statemanage/useGroup.js";

const useGetGroupMessages = () => {
  const [loading, setLoading] = useState(false);
  const { groupMessages, setGroupMessages, selectedGroup } = useGroup();

  useEffect(() => {
    const getGroupMessages = async () => {
      setLoading(true);
      if (selectedGroup && selectedGroup._id) {
        try {
          const res = await axios.get(
            `/api/group/${selectedGroup._id}/messages`
          );
          setGroupMessages(res.data.messages || []);
          setLoading(false);
        } catch (error) {
          console.log("Error in getting group messages:", error);
          setLoading(false);
        }
      }
    };

    getGroupMessages();
  }, [selectedGroup, setGroupMessages]);

  return { loading, groupMessages };
};

export default useGetGroupMessages;
