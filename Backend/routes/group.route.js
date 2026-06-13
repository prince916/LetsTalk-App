import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupDetails,
  getGroupMessages,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  leaveGroup,
  getGroupMembers,
  changeMemberRole,
} from "../controller/group.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

// Group CRUD operations
router.post("/create", secureRoute, createGroup);
router.get("/all", secureRoute, getAllGroups);
router.get("/:groupId", secureRoute, getGroupDetails);
router.get("/:groupId/messages", secureRoute, getGroupMessages);
router.put("/:groupId/update", secureRoute, updateGroup);
router.delete("/:groupId", secureRoute, deleteGroup);

// Member management
router.post("/:groupId/add-member", secureRoute, addMember);
router.delete("/:groupId/remove-member/:userId", secureRoute, removeMember);
router.get("/:groupId/members", secureRoute, getGroupMembers);
router.put("/:groupId/member/:userId/role", secureRoute, changeMemberRole);

// Leave group
router.post("/:groupId/leave", secureRoute, leaveGroup);

export default router;
