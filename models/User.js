const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: Object, required: true },
    adminTo: { type: Array, default: [] },
    friends: { type: Array, default: [] },
    groups: { type: Array, default: [] },
    blockList: { type: Array, default: [] },
    statusPics: { type: Array, default: [] },
    profilePics: { type: Array, default: [] },
    status: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamp: true }
);

module.exports = mongoose.model("User", userSchema);
