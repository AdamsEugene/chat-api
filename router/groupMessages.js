const router = require("express").Router();
const CryptoJS = require("crypto-JS");

const GroupMessage = require("../models/GroupMessage");

// POST

router.post("/", async (req, res) => {
  if (req.body.sender === req.user.id) {
    const ciphertext = CryptoJS.AES.encrypt(
      req.body.message,
      process.env.MESSAGE_SECRET_KEY
    ).toString();
    try {
      const newMessage = await new GroupMessage({
        sender: req.body.sender,
        groupId: req.body.groupId,
        message: ciphertext,
        createdAt: req.body.createdAt,
      });

      const message = await newMessage.save();
      res.status(200).json({ ...message._doc, message: req.body.message });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("Not authorized");
  }
});

// PUT
router.put("/delme/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);
    if (
      message.sender === req.user.id ||
      message.shareWith.includes(req.user.id)
    ) {
      await message.updateOne({ $set: { deleteFromMe: req.body.me } });
      res.status(200).json(message);
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/share/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);
    if (
      message.sender === req.user.id ||
      message.shareWith.includes(req.user.id)
    ) {
      await message.updateOne({ $push: { shareWith: [...req.body.ids] } });
      res.status(200).json(message);
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/delall/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);
    if (message.sender === req.user.id) {
      await message.updateOne({ $set: { deleteFromAll: req.body.all } });
      res.status(200).json(message);
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET

router.get("/:groupId", async (req, res) => {
  try {
    const allMessages = await GroupMessage.find({
      groupId: req.params.groupId,
    });

    if (allMessages.length > 0) {
      const messages = allMessages.map((oneMessage) => {
        const { message, ...msg } = oneMessage._doc;
        const bytesMessage = (bytes = CryptoJS.AES.decrypt(
          message,
          process.env.MESSAGE_SECRET_KEY
        ));
        const originalMessage = bytesMessage.toString(CryptoJS.enc.Utf8);

        return { ...msg, message: originalMessage };
      });

      res.status(200).json(messages);
    } else {
      res.status(200).json([
        {
          sender: "admin",
          message: "Nomessages found!",
          createdAt: Date.now(),
        },
      ]);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE

router.delete("/:messageId", async (req, res) => {
  try {
    const message = await GroupMessage.findById(req.params.messageId);
    if (message.sender === req.user.id) {
      await Message.findByIdAndDelete(req.params.messageId);
      res.status(200).json("Message deleted");
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
