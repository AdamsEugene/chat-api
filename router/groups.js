const router = require("express").Router();

const User = require("../models/User");
const Group = require("../models/Group");

// POST

router.post("/", async (req, res) => {
  console.log(req.body)
  try {
    const newGroup = new Group(req.body);

    const group = await newGroup.save();
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT

router.put("/update/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (
      group.members.includes(req.user.id) &&
      group.admins.includes(req.user.id)
    ) {
      const updatedGroup = await Group.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      const { members, ...doc } = updatedGroup._doc;
      res.status(200).json(doc);
    } else {
      res.status(404).json("You don't have permition");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/addadmin/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (
      group.members.includes(req.user.id) &&
      group.admins.includes(req.user.id)
    ) {
      if (group.admins.includes(req.body.adminId)) {
        await group.updateOne({ $pull: { admins: req.body.adminId } });
      } else {
        await group.updateOne({ $push: { admins: req.body.adminId } });
      }
      res.status(200).json("Admin list updated");
    } else {
      res.status(404).json("You can not add to this group");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/addmember/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group.members.includes(req.user.id)) {
      if (group.members.includes(req.body.id)) {
        await group.updateOne({ $pull: { members: req.body.id } });
      } else {
        await group.updateOne({ $push: { members: req.body.id } });
      }
      res.status(200).json("Member list updated");
    } else {
      res.status(404).json("You can not add to this group");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/picture/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group.members.includes(req.user.id)) {
      if (group.groupPics.includes(req.body.picture)) {
        await group.updateOne({ $pull: { groupPics: req.body.picture } });
      } else {
        await group.updateOne({ $push: { groupPics: req.body.picture } });
      }
      res.status(200).json("Picture list updated");
    } else {
      res.status(404).json("You can not add to this group");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET

router.get("/get/all", async (_req, res) => {
  try {
    const allGroups = await Group.find({});
    if (allGroups.length > 0) {
      const groups = allGroups.map((group) => {
        const { members, ...doc } = group._doc;
        return doc;
      });
      res.status(200).json(groups);
    } else {
      res.status(200).json([{ name: "No Name", dics: "No group found" }]);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/get/members/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const members = await Promise.all(
      group.members.map(async (member) => {
        const user = await User.findById(member);
        if (user) {
          const { password, ...doc } = user._doc;
          return doc;
        }
      })
    );
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE

router.delete("/del/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group.admins.includes(req.user.id)) {
      await Group.findByIdAndDelete(req.params.id);
      res.status(200).json("Group deleted");
    } else {
      res.status(404).json("You don't have permition");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
