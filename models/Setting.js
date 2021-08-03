const mongoose = require("mongoose");

const settingSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    backgroudImage: { type: Object, required: true },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Setting", settingSchema);
