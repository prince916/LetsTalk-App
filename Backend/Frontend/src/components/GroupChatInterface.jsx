import React, { useEffect, useState } from "react";
import { useGroupContext } from "../context/GroupContext.jsx";
import useGroup from "../statemanage/useGroup.js";
import useGroupSocket from "../context/useGroupSocket.js";
import { MdInfo, MdPeople } from "react-icons/md";
import GroupMessages from "../home/right/GroupMessages.jsx";
import GroupType from "../home/right/GroupType.jsx";
import GroupMembers from "./GroupMembers.jsx";
import GroupSettings from "./GroupSettings.jsx";
import { useMobileView } from "../App.jsx";

function GroupChatInterface() {
  const { selectedGroup } = useGroupContext();
  const [tab, setTab] = useState("chat"); // "chat", "members", "settings"
  const { joinGroup, leaveGroup } = useGroupSocket();

  useEffect(() => {
    if (selectedGroup?._id) {
      joinGroup(selectedGroup._id);
      return () => {
        leaveGroup(selectedGroup._id);
      };
    }
  }, [selectedGroup, joinGroup, leaveGroup]);

  if (!selectedGroup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-center text-xl">
          Select a group to start chatting
        </h1>
      </div>
    );
  }

  const { setMobileView } = useMobileView() || {};

  return (
    <div className="w-full bg-slate-900 text-gray-300 flex flex-col h-dvh min-h-dvh">
      {/* Header */}
      <div className="bg-slate-800 p-3 md:p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
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
          <div>
            <h2 className="text-base md:text-lg font-bold">{selectedGroup.name}</h2>
            <p className="text-xs text-gray-400">
              {selectedGroup.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="tabs">
          <button
            onClick={() => setTab("chat")}
            className={`tab tab-bordered ${tab === "chat" ? "tab-active" : ""}`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab("members")}
            className={`tab tab-bordered ${
              tab === "members" ? "tab-active" : ""
            }`}
          >
            <MdPeople className="text-lg" /> Members
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`tab tab-bordered ${
              tab === "settings" ? "tab-active" : ""
            }`}
          >
            <MdInfo className="text-lg" /> Info
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && (
          <div className="flex flex-col h-full">
            <GroupMessages />
            <GroupType />
          </div>
        )}

        {tab === "members" && <GroupMembers />}

        {tab === "settings" && (
          <div className="p-4 overflow-y-auto h-full">
            <GroupSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupChatInterface;
