const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sendToken = (user, status, res) =>
  res.status(status).json({ success: true, token: signToken(user._id), user });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, age, gender, phone, specialization, licenseNumber, hospital } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: "name, email, password, role required." });

    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: "Email already in use." });

    const user = await User.create({ name, email, password, role, age, gender, phone, specialization, licenseNumber, hospital });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
// role must be passed so patient can't login as doctor and vice versa
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required." });

    const user = await User.findOne({ email, role }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    if (!user.isActive) return res.status(403).json({ success: false, message: "Account Deactivated." });

    user.password = undefined;
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = (req, res) =>
  res.status(200).json({ success: true, user: req.user });
