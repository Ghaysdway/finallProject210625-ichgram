import mongoose from "mongoose";

const exploreSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  trendingScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Explore = mongoose.model("Explore", exploreSchema);
export default Explore;
