import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await conversation.save();
    // await newMessage.save();
    await Promise.all([conversation.save(), newMessage.save()]); // run parallel
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUploadedImagePayload = (file) => ({
  imageUrl: `/uploads/messages/${file.filename}`,
  imageName: file.originalname,
  imageSize: file.size,
  imageMimeType: file.mimetype,
});

export const sendImageMessage = async (req, res) => {
  try {
    const { message = "" } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
      messageType: "image",
      ...getUploadedImagePayload(req.file),
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendImageMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.userId.toString() === senderId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Create message
    const newMessage = new Message({
      senderId,
      groupId,
      message: message.trim(),
      messageType: "text",
    });

    await newMessage.save();

    // Add to group conversation
    let conversation = await Conversation.findOne({ groupId });
    if (!conversation) {
      conversation = await Conversation.create({
        type: "group",
        groupId,
        members: group.members.map((m) => m.userId),
        messages: [],
      });
    }

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Populate sender details
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "name email"
    );

    // Emit to all group members
    io.to(`group_${groupId}`).emit("newGroupMessage", {
      message: populatedMessage,
      groupId,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.log("Error in sendGroupMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupImageMessage = async (req, res) => {
  try {
    const { message = "" } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.userId.toString() === senderId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const newMessage = new Message({
      senderId,
      groupId,
      message: message.trim(),
      messageType: "image",
      ...getUploadedImagePayload(req.file),
    });

    await newMessage.save();

    let conversation = await Conversation.findOne({ groupId });
    if (!conversation) {
      conversation = await Conversation.create({
        type: "group",
        groupId,
        members: group.members.map((m) => m.userId),
        messages: [],
      });
    }

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "name email"
    );

    io.to(`group_${groupId}`).emit("newGroupMessage", {
      message: populatedMessage,
      groupId,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.log("Error in sendGroupImageMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id; // current logged in user
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate({
      path: "messages",
      options: {
        sort: { createdAt: 1 },
      },
    });
    if (!conversation) {
      return res.status(201).json([]);
    }
    const messages = conversation.messages;
    res.status(201).json(messages);
  } catch (error) {
    console.log("Error in getMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
