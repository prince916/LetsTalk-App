import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import groupRoute from "./routes/group.route.js";
import { app, server } from "./SocketIO/server.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
