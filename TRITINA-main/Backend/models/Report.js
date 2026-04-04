const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    
    patient:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  
    image: {
      originalUrl:  { type: String, required: true },
      originalId:   { type: String },                 
      edgeUrl:      { type: String },                  
      gradcamUrl:   { type: String },                  
      gradcamId:    { type: String },
    },

  
    diagnosis:  { type: String },
    stage:      { type: String }, 
    confidence: { type: Number, min: 0, max: 100 },
    risk:       { type: String, enum: ["Low", "Moderate", "High"] },
    findings:   { type: String },
    analyzedAt: { type: Date },

   
    doctorNote:   { type: String, default: null },
    prescription: { type: String, default: null },

    
    sentByDoctor: { type: Boolean, default: false },

    
    status: {
      type: String,
      enum: ["uploaded", "analyzed", "sent"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);


reportSchema.pre(/^find/, function (next) {
  this.populate("patient",    "name email age")
      .populate("reviewedBy", "name specialization");
  next();
});

module.exports = mongoose.model("Report", reportSchema);