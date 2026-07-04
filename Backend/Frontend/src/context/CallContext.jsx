import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { CallContext } from "./CallStateContext.jsx";
import { useSocketContext } from "./SocketStateContext.jsx";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
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

    try {
      console.log("Requesting media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log("Media stream obtained successfully:", stream.getTracks().length, "tracks");
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media:", error);
      if (error.name === "NotAllowedError") {
        alert("Camera/microphone permission denied. Please allow access and try again.");
      } else if (error.name === "NotFoundError") {
        alert("No camera or microphone found on your device.");
      } else {
        alert("Error accessing camera/microphone: " + error.message);
      }
      throw error;
    }
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

      peerConnection.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        if (event.streams && event.streams[0]) {
          console.log("Setting remote stream with tracks:", event.streams[0].getTracks().length);
          setRemoteStream(event.streams[0]);
        } else {
          // Fallback: build stream from individual track
          setRemoteStream((prev) => {
            const stream = prev || new MediaStream();
            stream.addTrack(event.track);
            return stream;
          });
        }
      };


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
        console.log("Starting video call to:", receiver.name);
        const stream = await getMediaStream();
        console.log("Got local stream with tracks:", stream.getTracks().length);
        
        const peerConnection = createPeerConnection(receiver._id);
        stream.getTracks().forEach((track) => {
          console.log("Adding track:", track.kind);
          peerConnection.addTrack(track, stream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("Created and set local description");

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
        console.error("Error starting video call:", error);
        cleanupCall();
      }
    },
    [authUser, cleanupCall, createPeerConnection, getMediaStream, socket]
  );

  const answerCall = useCallback(async () => {
    if (!socket || !authUser?.user || !incomingCall) {
      console.error("Cannot answer call: missing socket, authUser, or incomingCall");
      return;
    }

    try {
      console.log("Answering call from:", incomingCall.fromName);
      const stream = await getMediaStream();
      console.log("Got local stream:", stream.getTracks().length, "tracks");
      
      const peerConnection = createPeerConnection(incomingCall.from);
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track.kind);
        peerConnection.addTrack(track, stream);
      });

      console.log("Setting remote description from offer");
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      
      console.log("Flushing pending ICE candidates");
      await flushPendingCandidates();

      console.log("Creating answer");
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("Local description set");

      setActiveCall({
        userId: incomingCall.from,
        name: incomingCall.fromName,
        status: "connected",
        isIncoming: true,
      });
      setIncomingCall(null);

      console.log("Sending answer");
      socket.emit("answerCall", {
        to: incomingCall.from,
        from: authUser.user._id,
        answer,
      });
    } catch (error) {
      console.error("Error answering video call:", error);
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
      console.log("Incoming call from:", call.fromName);
      if (activeCallRef.current || incomingCall) {
        console.log("Already in call, rejecting");
        socket.emit("rejectCall", { to: call.from, reason: "busy" });
        return;
      }
      setIncomingCall(call);
    });

    socket.on("callAnswered", async ({ answer }) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.error("No peer connection when receiving answer");
        return;
      }

      try {
        console.log("Received answer, setting remote description");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set, flushing ICE candidates");
        await flushPendingCandidates();
        console.log("Call connected!");
        setActiveCall((prev) =>
          prev ? { ...prev, status: "connected" } : prev
        );
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        console.log("No peer connection yet, queuing ICE candidate");
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      if (!peerConnection.remoteDescription) {
        console.log("Remote description not set yet, queuing ICE candidate");
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        console.log("Adding ICE candidate");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE candidate added successfully");
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
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
