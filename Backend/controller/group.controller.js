import Group from "../models/group.model.js";
import GroupMember from "../models/groupMember.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../SocketIO/server.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const createdBy = req.user._id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Create the group
    const newGroup = new Group({
      name: name.trim(),
      description: description || "",
      avatar: avatar || null,
      createdBy,
      members: [
        {
          userId: createdBy,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    await newGroup.save();

    // Create a GroupMember record for the creator
    await GroupMember.create({
      groupId: newGroup._id,
      userId: createdBy,
      role: "admin",
      status: "active",
    });

    // Create a group conversation
    await Conversation.create({
      type: "group",
      groupId: newGroup._id,
      members: [createdBy],
      messages: [],
    });

    const populatedGroup = await Group.findById(newGroup._id)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup,
    });
  } catch (error) {
    console.log("Error in createGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all groups for current user
export const getAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all groups where user is a member
    const groups = await Group.find({
      "members.userId": userId,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("members.userId", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    console.log("Error in getAllGroups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get group details with members
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is member of this group
    const group = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some((m) => m.userId._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.log("Error in getGroupDetails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Verify user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some((m) => m.userId.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Get conversation and messages
    const conversation = await Conversation.findOne({
      groupId: groupId,
    }).populate({
      path: "messages",
      options: {
        sort: { createdAt: 1 },
      },
      populate: {
        path: "senderId",
        select: "name email",
      },
    });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    console.log("Error in getGroupMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update group info
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.members.some(
      (m) => m.userId.toString() === userId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can update group details" });
    }

    // Update fields
    if (name && name.trim() !== "") group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (avatar !== undefined) group.avatar = avatar;

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    // Notify group members
    io.to(`group_${groupId}`).emit("groupUpdated", {
      groupId,
      updatedGroup,
      message: "Group information updated",
    });

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.log("Error in updateGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete group (admin only)
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is creator/admin
    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group creator can delete the group" });
    }

    // Mark as inactive instead of deleting
    group.isActive = false;
    await group.save();

    // Notify members
    io.to(`group_${groupId}`).emit("groupDeleted", {
      groupId,
      message: "Group has been deleted",
    });

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const currentUserId = req.user._id;

    if (!newMemberId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin
    const isAdmin = group.members.some(
      (m) => m.userId.toString() === currentUserId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Check if user is already a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === newMemberId.toString()
    );

    if (isMember) {
      return res.status(400).json({ error: "User is already a member" });
    }

    // Add to group
    group.members.push({
      userId: newMemberId,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    // Create GroupMember record
    await GroupMember.create({
      groupId,
      userId: newMemberId,
      role: "member",
      status: "active",
    });

    // Update conversation members
    await Conversation.findOneAndUpdate(
      { groupId },
      { $addToSet: { members: newMemberId } }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    // Notify group
    io.to(`group_${groupId}`).emit("memberAdded", {
      groupId,
      newMemberId,
      group: updatedGroup,
    });

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.log("Error in addMember:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId: memberToRemove } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin
    const isAdmin = group.members.some(
      (m) => m.userId.toString() === currentUserId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    // Cannot remove self using this endpoint
    if (memberToRemove === currentUserId.toString()) {
      return res.status(400).json({ error: "Use leave group endpoint to leave" });
    }

    // Remove from group
    group.members = group.members.filter(
      (m) => m.userId.toString() !== memberToRemove.toString()
    );

    await group.save();

    // Remove GroupMember record
    await GroupMember.findOneAndDelete({
      groupId,
      userId: memberToRemove,
    });

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    // Notify group
    io.to(`group_${groupId}`).emit("memberRemoved", {
      groupId,
      removedUserId: memberToRemove,
      group: updatedGroup,
    });

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.log("Error in removeMember:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is member
    const memberIndex = group.members.findIndex(
      (m) => m.userId.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }

    // Cannot leave if you're the only admin
    const adminCount = group.members.filter((m) => m.role === "admin").length;
    const userIsAdmin = group.members[memberIndex].role === "admin";

    if (userIsAdmin && adminCount === 1) {
      return res.status(400).json({
        error: "Cannot leave group - you are the only admin. Transfer ownership or delete the group.",
      });
    }

    // Remove member
    group.members.splice(memberIndex, 1);
    await group.save();

    // Remove GroupMember record
    await GroupMember.findOneAndDelete({
      groupId,
      userId,
    });

    // Remove from conversation
    await Conversation.findOneAndUpdate(
      { groupId },
      { $pull: { members: userId } }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    // Notify group
    io.to(`group_${groupId}`).emit("memberLeft", {
      groupId,
      userId,
      group: updatedGroup,
    });

    res.status(200).json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.log("Error in leaveGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get group members
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const populatedGroup = await Group.findById(groupId).populate(
      "members.userId",
      "name email"
    );

    res.status(200).json({
      success: true,
      members: populatedGroup.members,
    });
  } catch (error) {
    console.log("Error in getGroupMembers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change member role (admin only)
export const changeMemberRole = async (req, res) => {
  try {
    const { groupId, userId: memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user._id;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin
    const isAdmin = group.members.some(
      (m) => m.userId.toString() === currentUserId.toString() && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can change member roles" });
    }

    // Find and update member role
    const member = group.members.find((m) => m.userId.toString() === memberId.toString());

    if (!member) {
      return res.status(404).json({ error: "Member not found in group" });
    }

    member.role = role;
    await group.save();

    // Update GroupMember record
    await GroupMember.findOneAndUpdate(
      { groupId, userId: memberId },
      { role }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    // Notify group
    io.to(`group_${groupId}`).emit("memberRoleChanged", {
      groupId,
      memberId,
      newRole: role,
    });

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.log("Error in changeMemberRole:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
