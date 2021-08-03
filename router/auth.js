const router = require("express").Router();
const CryptoJS = require("crypto-JS");
const jwt = require("jsonwebtoken");

const imageToBase64 = require("image-to-base64");
//or
//import imageToBase64 from 'image-to-base64/browser';

const User = require("../models/User"); 

router.post("/register", async (req, res) => {
  const ciphertext = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.PASSWORD_SECRET_KEY
  ).toString();

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
    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser) return res.status(404).json("User already exist!");
    let newUser;
    if (imageFile) {
      newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: ciphertext,
        profilePics: imageFile,
      });
    } else {
      newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: ciphertext,
      });
    }

    const user = await newUser.save();

    const {
      password,
      adminTo,
      friends,
      groups,
      blockList,
      statusPics,
      status,
      ...userDetails
    } = user._doc;
    res.status(200).json(userDetails);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(403).json("You do not have account");

    const bytesPassword = (bytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ));
    const originalPassword = bytesPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password)
      res.status(403).json("Password does not match");
    else {
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );
      const { password, ...userDetails } = user._doc;
      res.status(200).json({ ...userDetails, accessToken });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
