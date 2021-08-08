const mongoose = require("mongoose");

const groupMessageSchema = mongoose.Schema(
  {
    sender: { type: String, required: true },
    groupId: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    shareWith: { type: Array, default: [] },
    seen: { type: Boolean, default: true },
    createdAt: { type: Date },
    deleteFromMe: { type: Object, default: { sender: false, receiver: false } },
    deleteFromAll: { type: Boolean, default: false },
  },
  { timestamp: true }
);

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
