import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for group messages
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null, // null for direct messages
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    message: {
      type: String,
      default: "",
      required: function () {
        return this.messageType !== "image";
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imageName: {
      type: String,
      default: null,
    },
    imageSize: {
      type: Number,
      default: null,
    },
    imageMimeType: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
