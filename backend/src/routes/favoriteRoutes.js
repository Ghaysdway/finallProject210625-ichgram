import express from "express";
import {
  addPostToFavorite,
  getFavoritePosts,
  removePostFromFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addPostToFavorite);

router.get("/", protect, getFavoritePosts);

router.delete("/:postId", protect, removePostFromFavorite);

export default router;
