const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String, required: true },
    shareWith: { type: Array, default: [] },
    seen: { type: Boolean, default: false },
    deleteFromMe: { type: Object, default: { sender: false, receiver: false } }, 
    deleteFromAll: { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Message", messageSchema);
