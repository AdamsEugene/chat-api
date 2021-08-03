const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  const reqHeader = req.headers.token;
  if (!reqHeader) return res.status(403).json("Your not althorize");

  const token = reqHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    err && res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
};

module.exports = verify;
