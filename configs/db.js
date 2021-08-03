const mongoose = require("mongoose");

const dbConnect = async (DB_URI) =>
  await mongoose.connect(
    DB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    (err) => console.log(err ? err : "DB Connected")
  );

module.exports = dbConnect;
