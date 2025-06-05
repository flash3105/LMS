const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["document", "video", "link"],
    required: true,
  },
  description: {
    type: String,
  },
  filePath: {
    type: String,
  },
  originalName: {
    type: String,
  },
  link: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

module.exports = mongoose.model("Resource", ResourceSchema);
