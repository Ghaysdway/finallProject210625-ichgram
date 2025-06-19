import express from "express";
import {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
  getFeedPosts,
  getMyPosts,
  getPostsByUserId,
  getPostsByUsername,
  likePost,
  getPostById,
} from "../controllers/postController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { unlikePost } from "../controllers/likeController.js";

const router = express.Router();

router.get("/", getAllPosts);

router.get("/user/username/:username", getPostsByUsername);

router.get("/user/:userId", getPostsByUserId);

router.use(verifyToken);

router.get("/feed", getFeedPosts);

router.get("/my", getMyPosts);

router.post("/", upload.single("image"), createPost);

router.put("/:id", updatePost);

router.delete("/:id", deletePost);

router.post("/:id/like", likePost);

router.get("/:postId", getPostById);

router.delete("/:postId/unlike", unlikePost);

export default router;
