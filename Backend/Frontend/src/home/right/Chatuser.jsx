import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketStateContext.jsx";
import { useCallContext } from "../../context/CallStateContext.jsx";
import { MdVideocam } from "react-icons/md";
import { useMobileView } from "../../context/MobileViewContext.jsx";
import Avatar from "../../components/Avatar.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { callUser, activeCall } = useCallContext();
  const { setMobileView } = useMobileView() || {};
  const isOnline = onlineUsers.includes(selectedConversation?._id);

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 backdrop-blur md:h-[12vh] md:px-5">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          className="btn btn-ghost btn-sm p-1 md:hidden"
          onClick={() => setMobileView?.("list")}
          aria-label="Back to contacts"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}>
          <Avatar name={selectedConversation?.name} seed={selectedConversation?._id} src={selectedConversation?.profilePicture} className="h-11 w-11 md:h-14 md:w-14" fallbackClassName="text-lg font-semibold md:text-xl" />
        </div>

        <div>
          <h1 className="text-base font-semibold text-white md:text-xl">{selectedConversation?.name}</h1>
          <p className="text-xs text-slate-400 md:text-sm">{isOnline ? "Online now" : "Offline"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => callUser(selectedConversation)}
        disabled={!isOnline || Boolean(activeCall)}
        className="btn btn-circle border-0 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
        aria-label="Start video call"
      >
        <MdVideocam className="text-xl md:text-2xl" />
      </button>
    </div>
  );
}

export default Chatuser;
