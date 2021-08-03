const router = require("express").Router();
const imageToBase64 = require("image-to-base64");

const Setting = require("../models/Setting");

// POST

router.post("/", async (req, res) => {
  let imageFile;
  if (req.file) {
    const base64Img = await imageToBase64(req.file.path);

    imageFile = {
      contentType: req.file.mimetype,
      path: req.file.path,
      image: base64Img,
    };
  }
  try {
    const image = await Setting.findOne({ userId: req.user.id });

    if (!image) {
      const backgroundImage = new Setting({
        userId: req.user.id,
        backgroudImage: imageFile,
      });
      const bgImage = await backgroundImage.save();
      res.status(200).json(bgImage);
    } else {
      const backgroundImage = await Setting.findByIdAndUpdate(
        image._id,
        { $set: { backgroudImage: imageFile } },
        { safe: true, upsert: true, new: true }
      );
      res.status(200).json(backgroundImage);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET

router.get("/", async (req, res) => {
  try {
    const image = await Setting.findOne({ userId: req.user.id });
    if (image) res.status(200).json(image);
    else res.status(200).json({ backgroudImage: "Nothing here" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
