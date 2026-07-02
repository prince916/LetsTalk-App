import React from "react";
import useGroup from "../../statemanage/useGroup.js";
import { useGroupContext } from "../../context/GroupContext.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import { useMobileView } from "../../App.jsx";
import Avatar from "../../components/Avatar.jsx";

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
      <div className="flex items-center gap-3 px-3 py-3 hover:bg-slate-700 duration-300 cursor-pointer sm:px-5">
        <Avatar name={group.name} seed={group._id} className="h-12 w-12" fallbackClassName="text-xl font-bold" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold">{group.name}</h1>
          <span className="block truncate text-xs text-gray-400">
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
