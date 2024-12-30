const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  creator: {
    type: Number,
    required: true,
  },
  members: {
    type: [Number],
    default: [],
  },
  type: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

// 簡化 pre-save 中間件
ChatRoomSchema.pre("save", function (next) {
  console.log("Saving with members:", this.members);
  next();
});

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
