import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useCallContext } from "../../context/CallContext.jsx";
import { MdVideocam } from "react-icons/md";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { callUser, activeCall } = useCallContext();
  const isOnline = onlineUsers.includes(selectedConversation?._id);

  return (
    <div className="flex h-[12vh] items-center justify-between bg-gray-700 px-5 hover:bg-gray-600 duration-300">
      <div className="flex items-center space-x-4">
        <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}>
          <div className="w-14 rounded-full bg-neutral-focus text-neutral-content">
            <span className="flex h-full w-full items-center justify-center text-xl font-bold">
              {selectedConversation?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-xl">{selectedConversation.name}</h1>
          <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => callUser(selectedConversation)}
        disabled={!isOnline || Boolean(activeCall)}
        className="btn btn-circle btn-ghost text-2xl"
        aria-label="Start video call"
      >
        <MdVideocam />
      </button>
    </div>
  );
}

export default Chatuser;
