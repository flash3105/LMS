const mongoose = require("mongoose");

const ResourceViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ResourceView", ResourceViewSchema);
