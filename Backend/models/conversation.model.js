import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "./message.model.js";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null, // null for direct conversations
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("conversation", conversationSchema);
export default Conversation;