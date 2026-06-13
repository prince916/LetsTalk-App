import React, { useEffect, useRef } from "react";
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useCallContext } from "../context/CallContext.jsx";

function VideoCallModal() {
  const {
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCallContext();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between bg-slate-900 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">{activeCall.name}</h2>
          <p className="text-sm text-gray-400">
            {activeCall.status === "connected" ? "Connected" : "Calling..."}
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-black">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-gray-300">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-3xl font-bold">
              {activeCall.name?.charAt(0).toUpperCase()}
            </div>
            <p>Waiting for video...</p>
          </div>
        )}

        <div className="absolute bottom-6 right-6 h-32 w-24 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 sm:h-44 sm:w-32">
          {localStream && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Camera off
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 bg-slate-900 px-4 py-5">
        <button
          type="button"
          onClick={toggleMute}
          className="btn btn-circle btn-ghost text-2xl"
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MdMicOff /> : <MdMic />}
        </button>
        <button
          type="button"
          onClick={endCall}
          className="btn btn-circle btn-error text-2xl"
          aria-label="End call"
        >
          <MdCallEnd />
        </button>
        <button
          type="button"
          onClick={toggleCamera}
          className="btn btn-circle btn-ghost text-2xl"
          aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
        >
          {isCameraOff ? <MdVideocamOff /> : <MdVideocam />}
        </button>
      </div>
    </div>
  );
}

export default VideoCallModal;
