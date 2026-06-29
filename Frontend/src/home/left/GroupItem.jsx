import React from "react";
import useGroup from "../../statemanage/useGroup.js";
import { useGroupContext } from "../../context/GroupContext.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import { useMobileView } from "../../App.jsx";

function GroupItem({ group }) {
  const { selectedGroup: stateSelectedGroup, setSelectedGroup: setStateSelectedGroup } = useGroup();
  const { setSelectedGroup, groupOnlineUsers } = useGroupContext();
  const [authUser] = useAuth();

  const isSelected = stateSelectedGroup?._id === group._id;
  const onlineCount = groupOnlineUsers.length;
  const isCreator = group.createdBy?._id === authUser?.user?._id || 
                    group.createdBy === authUser?.user?._id;

  const { setMobileView } = useMobileView() || {};

  const handleSelectGroup = () => {
    setSelectedGroup(group);
    setStateSelectedGroup(group);
    setMobileView?.("chat");
  };

  return (
    <div
      className={`hover:bg-slate-600 duration-300 ${
        isSelected ? "bg-slate-700" : ""
      }`}
      onClick={handleSelectGroup}
    >
      <div className="flex space-x-4 px-8 py-3 hover:bg-slate-700 duration-300 cursor-pointer">
        <div className="avatar placeholder">
          <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
            <span className="text-xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-sm">{group.name}</h1>
          <span className="text-xs text-gray-400">
            {group.members?.length || 0} members
            {onlineCount > 0 && ` • ${onlineCount} online`}
          </span>
        </div>
        {isCreator && (
          <span className="badge badge-sm badge-primary">Admin</span>
        )}
      </div>
    </div>
  );
}

export default GroupItem;
