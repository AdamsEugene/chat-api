const mongoose = require("mongoose");

const activeUserSchema = mongoose.Schema(
  {
    usersId: { type: Array, default: [] },
  },
  { timestamp: true }
);

module.exports = mongoose.model("ActiveUser", activeUserSchema);
