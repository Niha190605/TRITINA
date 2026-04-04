const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String, required: [true, "Email is required"],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: { type: String, enum: ["patient", "doctor"], required: true },
    isActive: { type: Boolean, default: true },

    // Patient fields
    age:            { type: Number },
    gender:         { type: String, enum: ["Male", "Female", "other", ""] },
    phone:          { type: String },
    medicalHistory: { type: String },

    // Doctor fields
    specialization: { type: String },
    licenseNumber:  { type: String },
    hospital:       { type: String },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
