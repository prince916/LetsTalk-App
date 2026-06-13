import React, { useEffect, useState } from "react";
import { useGroupContext } from "../context/GroupContext.jsx";
import useGroup from "../statemanage/useGroup.js";
import useGroupSocket from "../context/useGroupSocket.js";
import { MdInfo, MdPeople } from "react-icons/md";
import GroupMessages from "../home/right/GroupMessages.jsx";
import GroupType from "../home/right/GroupType.jsx";
import GroupMembers from "./GroupMembers.jsx";
import GroupSettings from "./GroupSettings.jsx";

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

  return (
    <div className="w-full bg-slate-900 text-gray-300 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{selectedGroup.name}</h2>
          <p className="text-xs text-gray-400">
            {selectedGroup.members?.length || 0} members
          </p>
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
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(92vh - 8vh)" }}>
            <GroupSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupChatInterface;
