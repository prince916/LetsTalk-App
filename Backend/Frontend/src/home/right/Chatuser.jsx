import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useCallContext } from "../../context/CallContext.jsx";
import { MdVideocam } from "react-icons/md";
import { useMobileView } from "../../App.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { callUser, activeCall } = useCallContext();
  const { setMobileView } = useMobileView() || {};
  const isOnline = onlineUsers.includes(selectedConversation?._id);

  return (
    <div className="flex h-14 md:h-[12vh] items-center justify-between bg-gray-700 px-3 md:px-5 hover:bg-gray-600 duration-300 flex-shrink-0">
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile back button */}
        <button
          className="md:hidden btn btn-ghost btn-sm p-1"
          onClick={() => setMobileView?.("list")}
          aria-label="Back to contacts"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}>
          <div className="w-10 md:w-14 rounded-full bg-neutral-focus text-neutral-content">
            <span className="flex h-full w-full items-center justify-center text-lg md:text-xl font-bold">
              {selectedConversation?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-base md:text-xl">{selectedConversation.name}</h1>
          <span className="text-xs md:text-sm">{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => callUser(selectedConversation)}
        disabled={!isOnline || Boolean(activeCall)}
        className="btn btn-circle btn-ghost text-xl md:text-2xl"
        aria-label="Start video call"
      >
        <MdVideocam />
      </button>
    </div>
  );
}

export default Chatuser;
