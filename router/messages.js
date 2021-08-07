const router = require("express").Router();
const CryptoJS = require("crypto-JS");

const Message = require("../models/Message");

// POST

router.post("/", async (req, res) => {
  if (req.body.sender === req.user.id) {
    const ciphertext = CryptoJS.AES.encrypt(
      req.body.message,
      process.env.MESSAGE_SECRET_KEY
    ).toString();
    try {
      const newMessage = await new Message({
        sender: req.body.sender,
        receiver: req.body.receiver,
        message: ciphertext,
        createdAt: req.body.createdAt,
      });

      await newMessage.save();
      const { message, ...others } = newMessage._doc;
      res.status(200).json({ ...others, message: req.body.message });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("Not authorized");
  }
});

// PUT

router.put("/seen/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (message.receiver === req.user.id) {
      await message.updateOne({ $set: { seen: true } }, { new: true });

      const bytesMessage = (bytes = CryptoJS.AES.decrypt(
        message.message,
        process.env.MESSAGE_SECRET_KEY
      ));
      const originalMessage = bytesMessage.toString(CryptoJS.enc.Utf8);

      res
        .status(200)
        .json({ ...message._doc, seen: true, message: originalMessage });
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/delme/:id", async (req, res) => {
  console.log(req.body);
  try {
    const message = await Message.findById(req.params.id);
    if (
      message.receiver === req.user.id ||
      message.sender === req.user.id ||
      message.shareWith.includes(req.user.id)
    ) {
      await message.updateOne(
        { $set: { deleteFromMe: req.body } },
        { new: true }
      );

      const bytesMessage = (bytes = CryptoJS.AES.decrypt(
        message.message,
        process.env.MESSAGE_SECRET_KEY
      ));
      const originalMessage = bytesMessage.toString(CryptoJS.enc.Utf8);

      res.status(200).json({
        ...message._doc,
        deleteFromMe: req.body,
        message: originalMessage,
      });
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/share/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (
      message.receiver === req.user.id ||
      message.sender === req.user.id ||
      message.shareWith.includes(req.user.id)
    ) {
      await message.updateOne(
        { $push: { shareWith: [...req.body.ids] } },
        { new: true }
      );
      res.status(200).json("done");
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/delall/:messageId", async (req, res) => {
  try {
    const oneMessage = await Message.findById(req.params.messageId);
    if (oneMessage.sender === req.user.id) {
      await oneMessage.updateOne(
        { $set: { deleteFromAll: req.body.all, message: "" } },
        { new: true }
      );
      res.status(200).json({ ...oneMessage._doc, deleteFromAll: true });
    } else {
      res.status(404).json("You can't update this message");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET

router.get("/", async (req, res) => {
  try {
    const allMessages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id },
        { shareWith: req.user.id },
      ],
    });
    // console.log(allMessages);
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
    const message = await Message.findById(req.params.messageId);
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
