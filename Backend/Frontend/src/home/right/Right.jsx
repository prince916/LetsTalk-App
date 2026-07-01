import React, { useEffect } from "react";
import Chatuser from "./Chatuser.jsx";
import Messages from "./Messages.jsx";
import Type from "./Type.jsx";
import GroupChatInterface from "../../components/GroupChatInterface.jsx";
import useConversation from "../../statemanage/useConversation.js";
import useGroup from "../../statemanage/useGroup.js";
import { useAuth } from "../../context/AuthProvider.jsx";
import { useMobileView } from "../../App.jsx";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { selectedGroup } = useGroup();
  const { setMobileView } = useMobileView() || {};

  useEffect(() => {
    return setSelectedConversation(null);
  }, [setSelectedConversation]);

  // If a group is selected, show group chat interface
  if (selectedGroup) {
    return <GroupChatInterface />;
  }

  return (
    <div className="w-full flex flex-col bg-slate-900 text-gray-300 h-dvh min-h-dvh">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <Chatuser />
          <div className="flex-1 overflow-y-auto">
            <Messages />
          </div>
          <Type />
        </>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
  const { setMobileView } = useMobileView() || {};

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back button */}
      <div className="md:hidden flex items-center p-3 bg-slate-800">
        <button
          onClick={() => setMobileView?.("list")}
          className="btn btn-ghost btn-sm text-white flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-center px-4">
          Welcome{" "}
          <span className="font-semibold text-xl">
            {authUser.user.name}
          </span>
          <br />
          No chat selected, please start conversation by selecting anyone from
          your contacts or a group
        </h1>
      </div>
    </div>
  );
};