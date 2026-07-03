import { useState } from "react";
import axios from "axios";
import { useGroupContext } from "./GroupStateContext.jsx";

const useCreateGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { groups, setGroups } = useGroupContext();

  const createGroup = async (groupData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/group/create", {
        name: groupData.name,
        description: groupData.description || "",
        avatar: groupData.avatar || null,
      });

      if (res.data.success) {
        setGroups([...groups, res.data.group]);
        setLoading(false);
        return { success: true, group: res.data.group };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error creating group";
      console.log("Error in creating group:", error);
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return { loading, error, createGroup };
};

export default useCreateGroup;
