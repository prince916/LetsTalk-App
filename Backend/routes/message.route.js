import express from "express";
import { getMessage, sendMessage, sendGroupMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);

// Group messaging routes
router.post("/group/send/:groupId", secureRoute, sendGroupMessage);

export default router;