import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useMobileView } from "../../App.jsx";
import Avatar from "../../components/Avatar.jsx";

function User({ user }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);
  const { setMobileView } = useMobileView() || {};

  const handleSelect = () => {
    setSelectedConversation(user);
    setMobileView?.("chat");
  };
  return (
    <div
      className={`hover:bg-slate-600 duration-300 ${
        isSelected ? "bg-slate-700" : ""
      }`}
      onClick={handleSelect}
    >
      <div className="flex items-center gap-3 px-3 py-3 hover:bg-slate-700 duration-300 cursor-pointer sm:px-5">
        <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}><Avatar name={user.name} seed={user._id} src={user.profilePicture} className="h-12 w-12" imageClassName="h-full w-full object-cover" fallbackClassName="text-sm font-semibold" /></div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold">{user.name}</h1>
          <span className="block truncate text-sm text-slate-400">{user.email}</span>
        </div>
      </div>
    </div>
  );
}

export default User;

