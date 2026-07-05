import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const allowedOrigins = [
  "http://localhost:4001",
  "http://localhost:4002",
  "http://localhost:4003",
  "http://localhost:5002",
  "http://localhost:3000",
  "http://127.0.0.1:4001",
  "http://127.0.0.1:4002",
  "http://127.0.0.1:5002",
  "https://letstalk-app.onrender.com"
].filter(Boolean);

const server = http.createServer(app);

// ✅ Declare before usage
const users = {};
const groupRooms = {}; // Track group rooms and their members
const activeCalls = {}; // Track active/pending calls: { socketId: partnerSocketId }

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        callback(null, false); // ✅ safer than throwing
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined" && userId !== "null") {
    users[userId] = socket.id;
    console.log("Online Users:", users);
  }

  io.emit("getOnlineUsers", Object.keys(users));

  // ========== GROUP SOCKET EVENTS ==========

  socket.on("joinGroup", (groupId) => {
    if (!groupId) return;

    const roomName = `group_${groupId}`;
    socket.join(roomName);

    if (!groupRooms[groupId]) {
      groupRooms[groupId] = new Set();
    }
    groupRooms[groupId].add(userId);

    console.log(`User ${userId} joined group ${groupId}`);

    io.to(roomName).emit("groupOnlineUsers", Array.from(groupRooms[groupId]));
    io.to(roomName).emit("userJoinedGroup", {
      userId,
      groupId,
      onlineUsers: Array.from(groupRooms[groupId]),
    });
  });

  socket.on("leaveGroup", (groupId) => {
    if (!groupId) return;

    const roomName = `group_${groupId}`;
    socket.leave(roomName);

    if (groupRooms[groupId]) {
      groupRooms[groupId].delete(userId);
      if (groupRooms[groupId].size === 0) {
        delete groupRooms[groupId];
      }
    }

    console.log(`User ${userId} left group ${groupId}`);

    io.to(roomName).emit("groupOnlineUsers", groupRooms[groupId] ? Array.from(groupRooms[groupId]) : []);
    io.to(roomName).emit("userLeftGroup", {
      userId,
      groupId,
      onlineUsers: groupRooms[groupId] ? Array.from(groupRooms[groupId]) : [],
    });
  });

  socket.on("groupTyping", ({ groupId, userName }) => {
    if (!groupId) return;
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("groupTypingIndicator", { userId, userName, groupId });
  });

  socket.on("groupStoppedTyping", (groupId) => {
    if (!groupId) return;
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("groupStoppedTypingIndicator", { userId, groupId });
  });

  socket.on("getGroupOnlineUsers", (groupId) => {
    if (!groupId) return;
    const onlineUsers = groupRooms[groupId] ? Array.from(groupRooms[groupId]) : [];
    socket.emit("groupOnlineUsers", onlineUsers);
  });

  // ========== VIDEO CALL SIGNALING EVENTS ==========

  socket.on("callUser", ({ to, from, fromName, offer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (!receiverSocketId) {
      socket.emit("callUnavailable");
      return;
    }
    // Track the pending call so disconnect handler can notify the other party
    activeCalls[socket.id] = receiverSocketId;
    activeCalls[receiverSocketId] = socket.id;
    io.to(receiverSocketId).emit("incomingCall", { from, fromName, offer });
  });

  socket.on("answerCall", ({ to, from, answer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAnswered", { from, answer });
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("iceCandidate", { from: userId, candidate });
    }
  });

  socket.on("rejectCall", ({ to, reason }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callRejected", { from: userId, reason });
      delete activeCalls[receiverSocketId];
    }
    delete activeCalls[socket.id];
  });

  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", { from: userId });
      delete activeCalls[receiverSocketId];
    }
    delete activeCalls[socket.id];
  });

  // ========== DISCONNECT HANDLER ==========

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);

    // If this user was in a call, notify the other party
    const partnerSocketId = activeCalls[socket.id];
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("callEnded", { from: userId });
      delete activeCalls[partnerSocketId];
      delete activeCalls[socket.id];
    }

    delete users[userId];

    Object.keys(groupRooms).forEach((groupId) => {
      groupRooms[groupId].delete(userId);
      if (groupRooms[groupId].size === 0) {
        delete groupRooms[groupId];
      } else {
        const roomName = `group_${groupId}`;
        io.to(roomName).emit("userLeftGroup", {
          userId,
          groupId,
          onlineUsers: Array.from(groupRooms[groupId]),
        });
      }
    });

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
