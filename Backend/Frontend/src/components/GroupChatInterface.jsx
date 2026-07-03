import { useEffect, useState } from "react";
import { useGroupContext } from "../context/GroupStateContext.jsx";
import { useMobileView } from "../context/MobileViewContext.jsx";
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
  const { setMobileView } = useMobileView() || {};

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
      <div className="flex h-full min-h-0 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-6">
        <div className="animate-fade-in rounded-[28px] border border-white/10 bg-slate-900/70 px-8 py-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
            <MdPeople className="text-2xl" />
          </div>
          <h1 className="text-xl font-semibold text-white">Select a group to start chatting</h1>
          <p className="mt-2 text-sm text-slate-400">Open a group from your sidebar to continue the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] text-slate-200">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900/70 px-3 py-3 backdrop-blur md:px-4 md:py-4">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm p-1 md:hidden"
            onClick={() => setMobileView?.("list")}
            aria-label="Back to contacts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-base font-semibold text-white md:text-lg">{selectedGroup.name}</h2>
            <p className="text-xs text-slate-400">{selectedGroup.members?.length || 0} members</p>
          </div>
        </div>
        <div className="tabs tabs-boxed flex-wrap bg-slate-800/80 p-1">
          <button onClick={() => setTab("chat")} className={`tab ${tab === "chat" ? "tab-active" : ""}`}>
            Chat
          </button>
          <button onClick={() => setTab("members")} className={`tab ${tab === "members" ? "tab-active" : ""}`}>
            <MdPeople className="text-lg" /> Members
          </button>
          <button onClick={() => setTab("settings")} className={`tab ${tab === "settings" ? "tab-active" : ""}`}>
            <MdInfo className="text-lg" /> Info
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "chat" && (
          <div className="flex h-full flex-col">
            <GroupMessages />
            <div className="border-t border-white/10 bg-slate-950/70 px-2 py-2 backdrop-blur">
              <GroupType />
            </div>
          </div>
        )}

        {tab === "members" && <GroupMembers />}

        {tab === "settings" && (
          <div className="h-full overflow-y-auto p-4">
            <GroupSettings />
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupChatInterface;
