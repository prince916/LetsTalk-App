import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import groupRoute from "./routes/group.route.js";
import { app, server } from "./SocketIO/server.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4001",
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT || 5002; 
const URI = process.env.MONGODB_URI;

try {
  mongoose.connect(URI)
  console.log("MongoDB Connected");
} catch (error) {
  console.log(error); 
}


app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/group", groupRoute);


// ------------ Code For Deployment -----------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./Frontend/dist"));
  app.get("/",(req, res) => {
    res.sendFile(path.resolve(dirPath, "./Frontend/dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
