import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getCurrentUserProfile,
  getUserProfileByUsername,
  getUserFollowers,
  getUserFollowing,
  changePassword,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import uploadAvatar from "../middleware/avatarUploadMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getCurrentUserProfile);

router.get("/:id", verifyToken, getUserProfile);

router.get("/profile/:username", verifyToken, getUserProfileByUsername);

router.get("/:userId/followers", verifyToken, getUserFollowers);

router.get("/:userId/following", verifyToken, getUserFollowing);

router.put("/change-password", verifyToken, changePassword);

router.put(
  "/:id",
  verifyToken,
  uploadAvatar.single("avatar"),
  updateUserProfile
);

router.delete("/:id", verifyToken, deleteUser);

router.get("/", getAllUsers);

export default router;
