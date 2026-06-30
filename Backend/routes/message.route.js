import express from "express";
import {
  getMessage,
  sendMessage,
  sendImageMessage,
  sendGroupMessage,
  sendGroupImageMessage,
} from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
// import { uploadMessageImage } from "../middleware/uploadImage.js";

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
// router.post("/send-image/:id", secureRoute, uploadMessageImage.single("image"), sendImageMessage);
router.get("/get/:id", secureRoute, getMessage);

// Group messaging routes
router.post("/group/send/:groupId", secureRoute, sendGroupMessage);
router.post("/group/send-image/:groupId", secureRoute, sendGroupImageMessage);

export default router;
