import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:4001",
  "http://localhost:5173",
  "http://127.0.0.1:4001",
  "https://letstalk-app.onrender.com",
].filter(Boolean);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// realtime message code goes here
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};
const groupRooms = {}; // Track group rooms and their members

// used to listen events on server side.
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined" && userId !== "null") {
    users[userId] = socket.id;
    console.log("Online Users:", users);
  }
  // used to send the events to all connected users
  io.emit("getOnlineUsers", Object.keys(users));

  // ========== GROUP SOCKET EVENTS ==========

  // User joins a group
  socket.on("joinGroup", (groupId) => {
    if (!groupId) return;
    
    const roomName = `group_${groupId}`;
    socket.join(roomName);
    
    if (!groupRooms[groupId]) {
      groupRooms[groupId] = new Set();
    }
    groupRooms[groupId].add(userId);
    
    console.log(`User ${userId} joined group ${groupId}`);
    
    // Notify group members that user joined
    io.to(roomName).emit("groupOnlineUsers", Array.from(groupRooms[groupId]));
    io.to(roomName).emit("userJoinedGroup", {
      userId,
      groupId,
      onlineUsers: Array.from(groupRooms[groupId]),
    });
  });

  // User leaves a group
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
    
    // Notify remaining members
    io.to(roomName).emit("groupOnlineUsers", 
      groupRooms[groupId] ? Array.from(groupRooms[groupId]) : []
    );
    io.to(roomName).emit("userLeftGroup", {
      userId,
      groupId,
      onlineUsers: groupRooms[groupId] ? Array.from(groupRooms[groupId]) : [],
    });
  });

  // User typing in group
  socket.on("groupTyping", ({ groupId, userName }) => {
    if (!groupId) return;
    
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("groupTypingIndicator", {
      userId,
      userName,
      groupId,
    });
  });

  // User stopped typing in group
  socket.on("groupStoppedTyping", (groupId) => {
    if (!groupId) return;
    
    const roomName = `group_${groupId}`;
    socket.to(roomName).emit("groupStoppedTypingIndicator", {
      userId,
      groupId,
    });
  });

  // Get online users in group
  socket.on("getGroupOnlineUsers", (groupId) => {
    if (!groupId) return;
    
    const onlineUsers = groupRooms[groupId] ? Array.from(groupRooms[groupId]) : [];
    socket.emit("groupOnlineUsers", onlineUsers);
  });

  // ========== DIRECT MESSAGE SOCKET EVENTS ==========

  // ========== VIDEO CALL SIGNALING EVENTS ==========

  socket.on("callUser", ({ to, from, fromName, offer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (!receiverSocketId) {
      socket.emit("callUnavailable");
      return;
    }

    io.to(receiverSocketId).emit("incomingCall", {
      from,
      fromName,
      offer,
    });
  });

  socket.on("answerCall", ({ to, from, answer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAnswered", {
        from,
        answer,
      });
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("iceCandidate", {
        from: userId,
        candidate,
      });
    }
  });

  socket.on("rejectCall", ({ to, reason }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callRejected", {
        from: userId,
        reason,
      });
    }
  });

  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", {
        from: userId,
      });
    }
  });

  // used to listen client side events emitted by server side (server & client)
  socket.on("disconnect", () => {
    if (users) {
      console.log("a user disconnected", socket.id);
      delete users[userId];
      
      // Remove user from all group rooms
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
    }
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
