import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { CiMenuFries } from "react-icons/ci";
import { useSocketContext } from "../../context/SocketContext.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  console.log(selectedConversation);
  const { onlineUsers } = useSocketContext();
  const isOnline = selectedConversation
    ? onlineUsers.includes(selectedConversation._id)
    : false;
  if (!selectedConversation) {
    return (
      <div className="h-[10vh] flex items-center px-5 bg-gray-900 text-white">
        Choose a user to start chatting
      </div>
    );
  }
  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  return (
    <>
      <div className="pt-2 pl-5 pb-2 h-[10vh] flex space-x-4 bg-gray-900 hover:bg-emerald-700">
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-14 rounded-full ">
            <img src="data:image/jpeg;base64,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" />
          </div>
        </div>

        <div>
          <h1 className="text-xl">{selectedConversation.name}</h1>
          <span className="text-sm">
            {/* Online */}
            {getOnlineUsersStatus(selectedConversation._id)}
          </span>
        </div>
      </div>
    </>
  );
}

export default Chatuser;
