const jwt = require("jsonwebtoken");
const User = require("../models/Users.js");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = async ({ req }) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return { user };
  } catch (err) {
    return { user: null };
  }
};

module.exports = authMiddleware;
