const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: [true, "Message cannot be empty"], maxlength: 2000 },
    read: { type: Boolean, default: false },
    relatedReport: { type: mongoose.Schema.Types.ObjectId, ref: "Report", default: null },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  this.populate("from", "name role")
      .populate("to",   "name role");
  next();
});

module.exports = mongoose.model("Message", messageSchema);