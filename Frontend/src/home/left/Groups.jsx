import React from "react";
import GroupItem from "./GroupItem.jsx";
import { useGroupContext } from "../../context/GroupContext.jsx";
import useGetAllGroups from "../../context/useGetAllGroups.js";

function Groups() {
  const { groups, loading } = useGroupContext();
  useGetAllGroups();

  return (
    <div>
      <h1 className="px-8 py-2 text-white font-semibold bg-slate-800 rounded-md">
        Groups
      </h1>
      <div
        className="py-2 flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(84vh - 10vh)" }}
      >
        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading groups...</div>
        ) : groups.length > 0 ? (
          groups.map((group) => <GroupItem key={group._id} group={group} />)
        ) : (
          <div className="text-center py-4 text-gray-400">
            No groups yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
}

export default Groups;
