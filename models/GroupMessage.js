const mongoose = require("mongoose");

const groupMessageSchema = mongoose.Schema(
  {
    sender: { type: String, required: true },
    groupName: { type: String, required: true },
    message: { type: String, required: true },
    shareWith: { type: Array, default: [] },
    seen: { type: Boolean, default: false },
    deleteFromMe: { type: Boolean, default: false },
    deleteFromAll: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamp: true }
);

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
