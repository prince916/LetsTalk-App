import express from "express";
import { signup, login, logout, allUsers, session } from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { uploadProfileImage } from "../middleware/uploadImage.js";

const router = express.Router();

router.post("/signup", uploadProfileImage.single("profilePicture"), signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/session", secureRoute, session);

router.get("/allUsers", secureRoute , allUsers);

export default router;
