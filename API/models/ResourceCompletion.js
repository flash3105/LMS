const mongoose = require("mongoose");

const ResourceCompletionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  completedAt: { type: Date, default: Date.now },
});

ResourceCompletionSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model("ResourceCompletion", ResourceCompletionSchema);