const multer = require("multer");

// storage
const storage = multer.diskStorage({
  destination: (req, file, next) => {
    next(null, "images");
  },
  filename: (req, file, next) => {
    const ext = file.mimetype.split("/")[1];
    next(null, `${file.originalname}-${Date.now()}.${ext}`);
  },
});

// filter

const filter = (req, file, next) => {
  if (
    file.mimetype.split("/")[1] === "png" ||
    file.mimetype.split("/")[1] === "jpg"
  ) {
    next(null, true);
  } else {
    next(new Error("File must be image"), false);
  }
};

module.exports = storage;
