import { useCallback, useEffect, useRef, useState } from "react";
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useCallContext } from "../context/CallStateContext.jsx";

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
  const [needsTap, setNeedsTap] = useState(false);

  const tryPlay = useCallback((videoEl) => {
    if (!videoEl) return;
    videoEl.play().catch((err) => {
      if (err.name === "NotAllowedError") {
        // Autoplay blocked — show tap-to-play overlay
        setNeedsTap(true);
      } else {
        console.error("Error playing video:", err);
      }
    });
  }, []);

  // Always keep srcObject in sync — re-run when activeCall mounts the video element
  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    if (localStream) {
      el.srcObject = localStream;
      tryPlay(el);
    } else {
      el.srcObject = null;
    }
  }, [localStream, tryPlay, activeCall]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el) return;
    if (remoteStream) {
      el.srcObject = remoteStream;
      tryPlay(el);
    } else {
      el.srcObject = null;
    }
  }, [remoteStream, tryPlay, activeCall]);

  const handleTapToPlay = useCallback(() => {
    setNeedsTap(false);
    tryPlay(remoteVideoRef.current);
  }, [tryPlay]);

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
        {/* Remote video — always in DOM so ref is always valid */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`h-full w-full object-contain ${remoteStream ? "" : "hidden"}`}
        />

        {/* Tap-to-play overlay (autoplay blocked by browser) */}
        {needsTap && remoteStream && (
          <button
            type="button"
            onClick={handleTapToPlay}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white"
          >
            <span className="mb-2 text-4xl">▶</span>
            <span className="text-sm">Tap to play</span>
          </button>
        )}

        {/* Waiting placeholder when no remote stream */}
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-300">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-3xl font-bold">
              {activeCall.name?.charAt(0).toUpperCase()}
            </div>
            <p>Waiting for video...</p>
          </div>
        )}

        <div className="absolute bottom-6 right-6 h-32 w-24 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 sm:h-44 sm:w-32">
          {/* Local video — always in DOM */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${localStream ? "" : "hidden"}`}
          />
          {!localStream && (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Starting camera...
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
