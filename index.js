const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");

require("dotenv").config();

const verify = require("./configs/verifyToken");
const setting = require("./configs/uploadConfig");

const dbConnect = require("./configs/db");
const authRouter = require("./router/auth");
const userRouter = require("./router/users");
const groupRouter = require("./router/groups");
const activeUserRouter = require("./router/activeUsers");
const messageRouter = require("./router/messages");
const groupMessageRouter = require("./router/groupMessages");
const settingRouter = require("./router/settings");

dbConnect(process.env.DB_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const upload = multer({
  storage: setting,
  //   fileFilter: setting,
});
const PORT = process.env.PORT || 9000;

app.get("/", (req, res) => res.send("api running... ..."));

app.use("/api/auth", upload.single("image"), authRouter);
app.use("/api/users", upload.single("image"), verify, userRouter);
app.use("/api/groups", upload.single("groupPics"), verify, groupRouter);
app.use("/api/activeUsers", verify, activeUserRouter);
app.use("/api/messages", verify, messageRouter);
app.use("/api/groupMessages", verify, groupMessageRouter);
app.use("/api/settings", upload.single("image"), verify, settingRouter);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
