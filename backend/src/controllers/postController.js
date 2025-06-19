import Post from "../models/postModel.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/posts"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Только изображения разрешены к загрузке!"));
  },
});

export const createPost = async (req, res) => {
  try {
    const { content, videoLink } = req.body;
    const file = req.file;

    if (!content) {
      return res.status(400).json({ error: "Добавьте описание к публикации" });
    }

    let imageUrl = null;
    let videoUrl = null;
    let mediaType = null;

    if (file) {
      if (file.mimetype.startsWith("image/")) {
        mediaType = "image";
        imageUrl = `/uploads/posts/${file.filename}`;
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = "video";
        videoUrl = `/uploads/posts/${file.filename}`;
      } else {
        return res.status(400).json({ error: "Неподдерживаемый тип файла" });
      }
    } else if (videoLink) {
      mediaType = "video";
      videoUrl = videoLink;
    } else {
      return res.status(400).json({
        error:
          "Пожалуйста, загрузите изображение/видео или укажите ссылку на видео",
      });
    }

    const post = await Post.create({
      content,
      imageUrl,
      videoUrl,
      mediaType,
      author: req.user.id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "username avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);

    if (req.file && req.file.path) {
      const fs = await import("fs");
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Error deleting uploaded file after post creation error:",
            err
          );
      });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const excludeUserId = req.query.excludeUserId;

    console.log("Getting all posts with params:", {
      page,
      limit,
      excludeUserId,
    });

    const filter = {};

    if (excludeUserId) {
      filter.author = { $ne: excludeUserId };
    }

    console.log("Filter:", filter);

    const totalPosts = await Post.countDocuments(filter);
    console.log("Total posts found:", totalPosts);

    const posts = await Post.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username avatar")
      .populate("likes", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      })
      .sort({ createdAt: -1 });

    console.log("Posts fetched:", posts.length);

    res.json({
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    console.error("Error in getAllPosts:", err);
    res.status(500).json({ error: "Ошибка сервера при получении постов" });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await Post.find({ author: userId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    if (!posts) {
      return res.status(404).json({ error: "Посты не найдены" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Ошибка при получении собственных постов:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Получение постов для пользователя с ID:", userId);

    const posts = await Post.find({ author: userId })
      .populate("author", "username avatar")
      .populate("likes", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      })
      .sort({ createdAt: "desc" });

    console.log("Найдено постов:", posts.length);

    if (!posts || posts.length === 0) {
      console.log("Посты не найдены");
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      details: "Произошла ошибка при получении постов пользователя",
    });
  }
};

export const getPostsByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    console.log("Получение постов для пользователя:", username);

    const user = await User.findOne({ username });
    console.log("Найденный пользователь:", user);

    if (!user) {
      console.log("Пользователь не найден");
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    console.log("Поиск постов для пользователя с ID:", user._id);
    const posts = await Post.find({ author: user._id })
      .populate("author", "username avatar")
      .populate("likes", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      })
      .sort({ createdAt: "desc" });

    console.log("Найдено постов:", posts.length);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPostsByUsername:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      details: "Произошла ошибка при получении постов пользователя",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.toString() !== req.user.id)
      return res.status(401).json({ error: "Unauthorized" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    if (!post.mediaType) {
      if (post.imageUrl) {
        post.mediaType = "image";
      } else if (post.videoUrl) {
        post.mediaType = "video";
      } else {
        post.mediaType = "image";
      }
      console.warn(
        `[postController.js] У поста ${post._id} отсутствовал mediaType при операции лайка. Установлено значение: ${post.mediaType}.`
      );
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar")
      .populate("likes", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      });

    res.json(populatedPost);
  } catch (error) {
    console.error("Error in likePost:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const followingIds = user.following;

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar",
        },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (err) {
    console.error("Error in getFeedPosts:", err);
    res.status(500).json({ error: "Ошибка сервера при получении ленты" });
  }
};
