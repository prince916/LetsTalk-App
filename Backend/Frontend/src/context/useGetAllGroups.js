import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGroupContext } from "../context/GroupContext.jsx";

const useGetAllGroups = () => {
  const [loading, setLoading] = useState(false);
  const { setGroups } = useGroupContext();

  useEffect(() => {
    const getGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/group/all");
        setGroups(res.data.groups || []);
        setLoading(false);
      } catch (error) {
        console.log("Error in getting groups:", error);
        setLoading(false);
      }
    };

    getGroups();
  }, [setGroups]);

  return { loading };
};

export default useGetAllGroups;
