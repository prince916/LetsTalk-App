import { useEffect } from "react";
import Chatuser from "./Chatuser.jsx";
import Messages from "./Messages.jsx";
import Type from "./Type.jsx";
import GroupChatInterface from "../../components/GroupChatInterface.jsx";
import useConversation from "../../statemanage/useConversation.js";
import useGroup from "../../statemanage/useGroup.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useMobileView } from "../../context/MobileViewContext.jsx";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { selectedGroup } = useGroup();

  useEffect(() => {
    return setSelectedConversation(null);
  }, [setSelectedConversation]);

  if (selectedGroup) {
    return <GroupChatInterface />;
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] text-slate-200">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <Chatuser />
          <div className="flex-1 overflow-hidden">
            <Messages />
          </div>
          <div className="border-t border-white/10 bg-slate-950/70 px-2 py-2 backdrop-blur">
            <Type />
          </div>
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center bg-slate-900/70 p-3 backdrop-blur md:hidden">
        <button
          onClick={() => setMobileView?.("list")}
          className="btn btn-ghost btn-sm flex items-center gap-1 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex flex-1 min-h-0 items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-900/70 p-5 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.87L3 20l1.2-3.4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {authUser?.user?.name || "there"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pick a contact or group to start a conversation and keep the chat flowing.
          </p>
        </div>
      </div>
    </div>
  );
};