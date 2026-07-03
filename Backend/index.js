import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import groupRoute from "./routes/group.route.js";
import { app, server } from "./SocketIO/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

app.use(express.json());
app.use(cookieParser());

// CORS configuration - allow multiple localhost ports for development
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:4001",
  "http://localhost:4002",
  "http://localhost:4003",
  "http://localhost:5002",
  "http://localhost:3000",
  "http://127.0.0.1:4001",
  "http://127.0.0.1:4002",
  "http://127.0.0.1:5002",
  "https://letstalk-app.onrender.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT || 5002; 
const URI = process.env.MONGODB_URI;

try {
  await mongoose.connect(URI)
  console.log("MongoDB Connected");
} catch (error) {
  console.log(error); 
}


app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/group", groupRoute);


// ------------ Code For Deployment -----------------
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "Frontend", "dist");

  app.use(express.static(frontendDistPath));
  // Catch-all route for SPA - serve index.html for all unmatched routes
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
