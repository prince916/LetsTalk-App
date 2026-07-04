import { MdCall, MdCallEnd } from "react-icons/md";
import { useCallContext } from "../context/CallStateContext.jsx";

function IncomingCallModal() {
  const { incomingCall, answerCall, rejectCall } = useCallContext();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-900/95 p-6 text-center text-white shadow-2xl shadow-black/40">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-sky-500/20 to-blue-600/20 text-2xl font-bold text-sky-300 ring-1 ring-sky-400/20">
          {incomingCall.fromName?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold">{incomingCall.fromName}</h2>
        <p className="mt-1 text-sm text-slate-400">Incoming video call</p>
        <div className="mt-6 flex justify-center gap-5">
          <button
            type="button"
            onClick={rejectCall}
            className="btn btn-circle border-0 bg-rose-500/90 text-2xl text-white hover:bg-rose-400"
            aria-label="Reject call"
          >
            <MdCallEnd />
          </button>
          <button
            type="button"
            onClick={answerCall}
            className="btn btn-circle border-0 bg-emerald-500/90 text-2xl text-white hover:bg-emerald-400"
            aria-label="Answer call"
          >
            <MdCall />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
