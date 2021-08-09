const router = require("express").Router();
const { encrypt } = require("../configs/crypto");
const jwt = require("jsonwebtoken");
const imageToBase64 = require("image-to-base64");

const User = require("../models/User");
const Group = require("../models/Group");

// PUT

router.put("/:userId", async (req, res) => {
  if (req.user.id === req.params.userId) {
    if (req.body.password) {
      req.body.password = encrypt(req.body.password);
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: req.body },
        { new: true }
      );

      const accessToken = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...user } = updatedUser._doc;
      res.status(200).json({ ...user, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("You can not update this account");
  }
});

router.put("/addfriend/new", async (req, res) => {
  try {
    const oldUser = await User.findById(req.user.id);

    if (oldUser.friends.includes(req.body.id)) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { friends: req.body.id } },
        { new: true }
      );
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } else {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { friends: req.body.id } },
        { new: true }
      );
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/admin/:userId", async (req, res) => {
  if (req.user.id === req.params.userId) {
    try {
      const oldUser = await User.findById(req.user.id);

      if (oldUser.adminTo.includes(req.body.adminTo)) {
        await oldUser.updateOne({ $pull: { adminTo: req.body.adminTo } });
      } else {
        await oldUser.updateOne({ $push: { adminTo: req.body.adminTo } });
      }
      res.status(200).json("Friend list updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("You can not add to this user");
  }
});

router.put("/group/:userId", async (req, res) => {
  if (req.user.id === req.params.userId) {
    try {
      const groupsList = req.body.groups;
      const oldUser = await User.findById(req.user.id);

      groupsList.forEach(async (group) => {
        if (oldUser.groups.includes(group)) {
          await oldUser.updateOne({ $pull: { groups: group } });
        } else {
          await oldUser.updateOne({ $push: { groups: group } });
        }
      });
      res.status(200).json("Group list updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("You can not add to this user");
  }
});

router.put("/blockuser/someone", async (req, res) => {
  try {
    const oldUser = await User.findById(req.user.id);

    if (oldUser.blockList.includes(req.body.id)) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { blockList: req.body.id } },
        { new: true }
      );
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } else {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { blockList: req.body.id } },
        { new: true }
      );
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/statuspic/:userId", async (req, res) => {
  if (req.user.id === req.params.userId) {
    try {
      const files = req.file;
      const oldUser = await User.findById(req.user.id);

      files.forEach(async (pic) => {
        let imageFile;
        if (pic) {
          const base64Img = await imageToBase64(req.file.path);

          imageFile = {
            contentType: pic.mimetype,
            path: pic.path,
            image: base64Img,
          };
        }

        if (oldUser.statusPics.includes(imageFile)) {
          await oldUser.updateOne({ $pull: { statusPics: imageFile } });
        } else {
          await oldUser.updateOne({ $push: { statusPics: imageFile } });
        }
      });
      res.status(200).json("Status Picture list updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("You can not add to this user");
  }
});

router.put("/profilepic/:userId", async (req, res) => {
  if (req.user.id === req.params.userId) {
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
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { profilePics: imageFile } },
        { safe: true, upsert: true, new: true }
      );

      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2d" }
      );

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("You can not add to this user");
  }
});

// GET

router.get("/all", async (req, res) => {
  try {
    let allUsers = [];
    await User.find({}, (err, users) => {
      if (!err)
        users.forEach(async (user) => {
          const { password, ...doc } = user._doc;
          await allUsers.push(doc);
        });
      allUsers.length === 0 && res.status(200).json([{}]);
      allUsers.length > 0 && res.status(200).json(allUsers);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/friends", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friends = await Promise.all(
      user.friends.map(async (friendId) => {
        const user = await User.findById(friendId);
        const { password, ...doc } = user._doc;
        return doc;
      })
    );
    friends.length === 0 && res.status(200).json([{}]);
    friends.length > 0 && res.status(200).json(friends);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find({ members: { $in: [req.user.id] } });
    if (groups.length > 0)
      res
        .status(200)
        .json([
          { name: "Default", dics: "for public chat", _id: "2" },
          ...groups,
        ]);
    else
      res
        .status(200)
        .json([{ name: "Default", dics: "for public chat", _id: "2" }]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE

router.delete("/del/:id", async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      await User.findByIdAndDelete(req.user.id);
      res.status(200).json("Ok");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json("Not authorized");
  }
});

module.exports = router;
