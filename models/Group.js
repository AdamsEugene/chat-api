const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    dics: { type: String, default: "no information about this group" },
    members: { type: Array, default: [] },
    groupPics: { type: Object },
    admins: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
  }, 
  { timestamp: true }
);

module.exports = mongoose.model("Group", groupSchema);
