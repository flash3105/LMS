// models/Assist.js
const mongoose = require("mongoose");

const AssistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open","in-progress","resolved","closed"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assist", AssistSchema);
