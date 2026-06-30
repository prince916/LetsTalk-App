/**
 * app.js — Thin Express app factory used by tests.
 * Exports `app` without calling server.listen(), so supertest can bind its own port.
 */
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import groupRoute from "./routes/group.route.js";
import { app } from "./SocketIO/server.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4001",
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/group", groupRoute);

// Connect to MongoDB only once
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected (app.js)"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

export default app;
