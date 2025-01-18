const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    enum: ["text", "image", "file", "broadcast"],
    default: "text",
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
