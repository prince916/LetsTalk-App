import React from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import { useCallContext } from "../context/CallContext.jsx";

function IncomingCallModal() {
  const { incomingCall, answerCall, rejectCall } = useCallContext();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-lg bg-slate-900 p-6 text-center text-white shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold">
          {incomingCall.fromName?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold">{incomingCall.fromName}</h2>
        <p className="mt-1 text-sm text-gray-400">Incoming video call</p>
        <div className="mt-6 flex justify-center gap-5">
          <button
            type="button"
            onClick={rejectCall}
            className="btn btn-circle btn-error text-2xl"
            aria-label="Reject call"
          >
            <MdCallEnd />
          </button>
          <button
            type="button"
            onClick={answerCall}
            className="btn btn-circle btn-success text-2xl"
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
