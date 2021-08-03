const router = require("express").Router();

const ActiveUser = require("../models/ActiveUser");

// ADD OR REMOVE USER

router.post("/", async (req, res) => {
  try {
    const actives = await ActiveUser.find({});

    if (actives.length > 0) {
      if (actives[0].usersId.includes(req.user.id)) {
        await ActiveUser.updateOne({ $pull: { usersId: req.user.id } });
      } else {
        await ActiveUser.updateOne({ $push: { usersId: req.user.id } });
      }
      res.status(200).json("done");
    } else {
      const newActiveUser = await ActiveUser({ usersId: req.user.id });
      const activeUser = await newActiveUser.save();
      res.status(200).json(activeUser);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/all", async (_req, res) => {
  try {
    await ActiveUser.find({}, (_err, user) => {
      res.status(200).json(user);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
