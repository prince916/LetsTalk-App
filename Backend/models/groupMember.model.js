import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate members
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);
export default GroupMember;
