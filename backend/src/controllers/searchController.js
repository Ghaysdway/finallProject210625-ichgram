import User from "../models/userModel.js";

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
      $or: [
        { username: { $regex: `^${escapedQuery}`, $options: "i" } },
        { fullName: { $regex: escapedQuery, $options: "i" } },
      ],
    }).select("username fullName email avatar _id");

    res.status(200).json({ items: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
