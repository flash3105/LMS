const mongoose = require("mongoose");

const ResourceRatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String },
  ratedAt: { type: Date, default: Date.now },
});

ResourceRatingSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model("ResourceRating", ResourceRatingSchema);
