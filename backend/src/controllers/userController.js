import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Необходимо указать текущий и новый пароли." });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Текущий пароль неверен." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Пароль успешно изменен." });
  } catch (error) {
    console.error("Ошибка при смене пароля:", error);
    res.status(500).json({ message: "Ошибка сервера при смене пароля." });
  }
};

export const getCurrentUserProfile = async (req, res) => {
  try {
    console.log(
      "Получение профиля текущего пользователя. ID пользователя:",
      req.user.id
    );

    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Ошибка при преобразовании ID пользователя:", error);
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers")
      .populate("following");

    if (!user) {
      console.log("Пользователь не найден с ID:", req.user.id);
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const postsCount = await Post.countDocuments({ author: userId });
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    const userResponse = {
      ...user.toObject(),
      postsCount,
      posts,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    };

    console.log("Отправка профиля пользователя:", userResponse);
    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Ошибка в getCurrentUserProfile:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, email, bio, fullName, website, phone } = req.body;
    const userId = req.params.id;

    let objectIdUserId;
    try {
      objectIdUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Ошибка при преобразовании ID пользователя:", error);
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }

    const user = await User.findById(objectIdUserId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio === undefined ? user.bio : bio;
    user.fullName = fullName === undefined ? user.fullName : fullName;
    user.website = website === undefined ? user.website : website;
    user.phone = phone === undefined ? user.phone : phone;

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      fullName: updatedUser.fullName,
      website: updatedUser.website,
      phone: updatedUser.phone,
    };

    res.status(200).json({ message: "Профиль обновлен", user: userResponse });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    let objectIdUserId;
    try {
      objectIdUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Ошибка при преобразовании ID пользователя:", error);
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }

    const user = await User.findByIdAndDelete(objectIdUserId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.status(200).json({ message: "Пользователь успешно удален" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    let objectIdUserId;
    try {
      objectIdUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Ошибка при преобразовании ID пользователя:", error);
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }

    const user = await User.findById(objectIdUserId)
      .select("-password")
      .populate("followers")
      .populate("following");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const postsCount = await Post.countDocuments({ author: objectIdUserId });
    const posts = await Post.find({ author: objectIdUserId }).sort({
      createdAt: -1,
    });

    const userResponse = {
      ...user.toObject(),
      postsCount,
      posts,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfileByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const currentUserId = req.user?._id;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    let isFollowing = false;
    if (currentUserId && user.followers) {
      const currentObjectId =
        typeof currentUserId === "string"
          ? new mongoose.Types.ObjectId(currentUserId)
          : currentUserId;
      console.log(
        `Checking if ${currentObjectId} is in ${user.username}'s followers:`,
        user.followers
      );
      isFollowing = user.followers.some((followerId) =>
        followerId.equals(currentObjectId)
      );
      console.log(`isFollowing result: ${isFollowing}`);
    }

    const userResponse = {
      ...user.toObject(),
      postsCount,
      posts,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in getUserProfileByUsername:", error);
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Поисковый запрос обязателен" });
    }

    const searchRegex = new RegExp(query, "i");

    const users = await User.find({
      $or: [{ username: searchRegex }, { fullName: searchRegex }],
    })
      .select("username fullName avatar")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при поиске пользователей" });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }
    if (currentUserId && !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res
        .status(400)
        .json({ message: "Неверный формат ID текущего пользователя" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "username fullName avatar",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    let followersWithStatus = user.followers;

    if (currentUserId) {
      const currentUser = await User.findById(currentUserId)
        .select("following")
        .lean();
      if (currentUser) {
        followersWithStatus = user.followers.map((follower) => ({
          ...follower,
          isFollowing: currentUser.following.some((followedId) =>
            followedId.equals(follower._id)
          ),
        }));
      }
    } else {
      followersWithStatus = user.followers.map((follower) => ({
        ...follower,
        isFollowing: false,
      }));
    }

    res.status(200).json(followersWithStatus);
  } catch (error) {
    console.error("Ошибка при получении подписчиков:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ message: "Неверный формат ID пользователя" });
    }
    if (currentUserId && !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res
        .status(400)
        .json({ message: "Неверный формат ID текущего пользователя" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "username fullName avatar",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    let followingWithStatus = user.following;

    if (currentUserId) {
      const currentUser = await User.findById(currentUserId)
        .select("following")
        .lean();
      if (currentUser) {
        followingWithStatus = user.following.map((followedUser) => ({
          ...followedUser,
          isFollowing: currentUser.following.some((followedByCurrentUser) =>
            followedByCurrentUser.equals(followedUser._id)
          ),
        }));
      }
    } else {
      followingWithStatus = user.following.map((followedUser) => ({
        ...followedUser,
        isFollowing: false,
      }));
    }

    res.status(200).json(followingWithStatus);
  } catch (error) {
    console.error("Ошибка при получении подписок:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
