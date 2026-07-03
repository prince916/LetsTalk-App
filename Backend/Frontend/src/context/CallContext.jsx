import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { CallContext } from "./CallStateContext.jsx";
import { useSocketContext } from "./SocketStateContext.jsx";

const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [authUser] = useAuth();
  const { socket } = useSocketContext();
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const activeCallRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const cleanupCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    pendingCandidatesRef.current = [];
    stopLocalStream();
    setIncomingCall(null);
    setActiveCall(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [stopLocalStream]);

  const flushPendingCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection?.remoteDescription) return;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const getMediaStream = useCallback(async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    return stream;
  }, []);

  const createPeerConnection = useCallback(
    (receiverId) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket && receiverId) {
          socket.emit("iceCandidate", {
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.addEventListener("track", (event) => {
        const incomingStream = event.streams?.[0] || new MediaStream([event.track]);
        setRemoteStream(incomingStream);
      });

      peerConnection.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(peerConnection.connectionState)) {
          cleanupCall();
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    },
    [cleanupCall, socket]
  );

  const callUser = useCallback(
    async (receiver) => {
      if (!socket || !authUser?.user || !receiver?._id || activeCallRef.current) {
        return;
      }

      try {
        const stream = await getMediaStream();
        const peerConnection = createPeerConnection(receiver._id);
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        setActiveCall({
          userId: receiver._id,
          name: receiver.name,
          status: "calling",
          isIncoming: false,
        });

        socket.emit("callUser", {
          to: receiver._id,
          from: authUser.user._id,
          fromName: authUser.user.name,
          offer,
        });
      } catch (error) {
        console.log("Error starting video call:", error);
        cleanupCall();
      }
    },
    [authUser, cleanupCall, createPeerConnection, getMediaStream, socket]
  );

  const answerCall = useCallback(async () => {
    if (!socket || !authUser?.user || !incomingCall) return;

    try {
      const stream = await getMediaStream();
      const peerConnection = createPeerConnection(incomingCall.from);
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      await flushPendingCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      setActiveCall({
        userId: incomingCall.from,
        name: incomingCall.fromName,
        status: "connected",
        isIncoming: true,
      });
      setIncomingCall(null);

      socket.emit("answerCall", {
        to: incomingCall.from,
        from: authUser.user._id,
        answer,
      });
    } catch (error) {
      console.log("Error answering video call:", error);
      cleanupCall();
    }
  }, [
    authUser,
    cleanupCall,
    createPeerConnection,
    flushPendingCandidates,
    getMediaStream,
    incomingCall,
    socket,
  ]);

  const rejectCall = useCallback(() => {
    if (socket && incomingCall) {
      socket.emit("rejectCall", { to: incomingCall.from });
    }
    setIncomingCall(null);
  }, [incomingCall, socket]);

  const endCall = useCallback(() => {
    if (socket && activeCallRef.current?.userId) {
      socket.emit("endCall", { to: activeCallRef.current.userId });
    }
    cleanupCall();
  }, [cleanupCall, socket]);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    setIsCameraOff((prev) => !prev);
  }, [isCameraOff]);

  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", (call) => {
      if (activeCallRef.current || incomingCall) {
        socket.emit("rejectCall", { to: call.from, reason: "busy" });
        return;
      }
      setIncomingCall(call);
    });

    socket.on("callAnswered", async ({ answer }) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      await flushPendingCandidates();
      setActiveCall((prev) =>
        prev ? { ...prev, status: "connected" } : prev
      );
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      if (!peerConnection.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("callRejected", cleanupCall);
    socket.on("callEnded", cleanupCall);
    socket.on("callUnavailable", cleanupCall);

    return () => {
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("callUnavailable");
    };
  }, [cleanupCall, flushPendingCandidates, incomingCall, socket]);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        activeCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        callUser,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
