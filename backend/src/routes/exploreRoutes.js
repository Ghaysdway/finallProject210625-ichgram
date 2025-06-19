import express from "express";
import {
  addPostToExplore,
  getExplorePosts,
  removePostFromExplore,
} from "../controllers/exploreController.js";

const router = express.Router();

router.post("/", addPostToExplore);

router.get("/", getExplorePosts);

router.delete("/:id", removePostFromExplore);

export default router;
