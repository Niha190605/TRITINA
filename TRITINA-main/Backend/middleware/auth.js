const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token — attach req.user
exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }

    const token   = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or inactive." });
    }

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid token.";
    return res.status(401).json({ success: false, message: msg });
  }
};

// Role guard — restrictTo("doctor") or restrictTo("patient", "doctor")
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(", ")} allowed.`,
      });
    }
    next();
  };
};