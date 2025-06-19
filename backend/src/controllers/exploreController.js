import Explore from "../models/exploreModel.js";
import Post from "../models/postModel.js";

export const addPostToExplore = async (req, res) => {
  try {
    const { postId, trendingScore } = req.body;

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingExplorePost = await Explore.findOne({ post: postId });
    if (existingExplorePost) {
      return res.status(400).json({ message: "Post already added to Explore" });
    }

    const explorePost = new Explore({
      post: postId,
      trendingScore,
    });

    await explorePost.save();
    res.status(201).json({ message: "Post added to Explore", explorePost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const explorePosts = await Explore.find()
      .sort({ trendingScore: -1 }) 
      .populate("post"); 

    res.status(200).json(explorePosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removePostFromExplore = async (req, res) => {
  try {
    const { id } = req.params;

    const explorePost = await Explore.findByIdAndDelete(id);
    if (!explorePost) {
      return res.status(404).json({ message: "Post not found in Explore" });
    }

    res.status(200).json({ message: "Post removed from Explore" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
