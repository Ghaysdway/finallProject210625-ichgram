import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { type: String },
    videoUrl: { type: String },
    mediaType: { type: String, required: true, enum: ["image", "video"] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
