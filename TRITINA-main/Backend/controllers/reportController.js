const Report  = require("../models/Report");
const { cloudinary, uploadBase64 } = require("../config/cloudinary");
const { predict } = require("../ml/aiEngine");  // ← ML model lives here

// POST /api/reports/upload  (doctor only)
// Receives: image file (original), edgeImageBase64, gradcamImageBase64
exports.uploadReport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Retinal image required." });
    if (!req.body.patientId) return res.status(400).json({ success: false, message: "patientId required." });

    // Upload edge + gradcam base64 images to cloudinary
    const { edgeImageBase64, gradcamImageBase64 } = req.body;

    let edgeUrl = null, edgeId = null, gradcamUrl = null, gradcamId = null;

    if (edgeImageBase64) {
      const edge = await uploadBase64(edgeImageBase64, "retinaai/edge");
      edgeUrl = edge.url; edgeId = edge.publicId;
    }
    if (gradcamImageBase64) {
      const gcam = await uploadBase64(gradcamImageBase64, "retinaai/gradcam");
      gradcamUrl = gcam.url; gradcamId = gcam.publicId;
    }

    const ai = await predict(req.file.path);

    const report = await Report.create({
      patient:    req.body.patientId,
      reviewedBy: req.user._id,
      image: {
        originalUrl: req.file.path,
        originalId:  req.file.filename,
        edgeUrl, edgeId, gradcamUrl, gradcamId,
      },
      ...ai,
      status: "analyzed",
    });

    res.status(201).json({ success: true, report: formatReport(report) });
  } catch (err) { next(err); }
};

// PATCH /api/reports/:id/send  (doctor adds note + prescription + sends to patient)
exports.sendReport = async (req, res, next) => {
  try {
    const { doctorNote, prescription } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });

    report.doctorNote    = doctorNote || report.doctorNote;
    report.prescription  = prescription || report.prescription;
    report.sentByDoctor  = true;
    report.reviewedBy    = req.user._id;
    report.status        = "sent";
    await report.save();

    res.status(200).json({ success: true, report: formatReport(report) });
  } catch (err) { next(err); }
};

// GET /api/reports/my  (patient — own reports sent by doctor)
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ patient: req.user._id, sentByDoctor: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports: reports.map(formatReport) });
  } catch (err) { next(err); }
};

// GET /api/reports/all  (doctor — all reports, filterable)
exports.getAllReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patient = req.query.patientId;
    if (req.query.risk)      filter.risk    = req.query.risk;
    if (req.query.status)    filter.status  = req.query.status;

    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports: reports.map(formatReport) });
  } catch (err) { next(err); }
};

// GET /api/reports/:id
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });

    // Patient can only see their own
    if (req.user.role === "patient" && report.patient._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied." });

    res.status(200).json({ success: true, report: formatReport(report) });
  } catch (err) { next(err); }
};

// DELETE /api/reports/:id  (doctor only)
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });

    // Delete all 3 images from cloudinary
    const ids = [report.image.originalId, report.image.edgeId, report.image.gradcamId].filter(Boolean);
    await Promise.all(ids.map(id => cloudinary.uploader.destroy(id).catch(() => {})));

    await report.deleteOne();
    res.status(200).json({ success: true, message: "Report deleted." });
  } catch (err) { next(err); }
};


function formatReport(doc) {
  return {
    id:           doc._id.toString(),
    date:         doc.createdAt.toISOString().split("T")[0],
    originalImage: doc.image?.originalUrl || null,
    edgeImage:     doc.image?.edgeUrl     || null,
    gradcamImage:  doc.image?.gradcamUrl  || null,
    diagnosis:    doc.diagnosis,
    stage:        doc.stage,
    confidence:   doc.confidence,
    risk:         doc.risk,
    findings:     doc.findings,
    doctorNote:   doc.doctorNote   || null,
    prescription: doc.prescription || null,
    sentByDoctor: doc.sentByDoctor,
    status:       doc.status,
    patient:      doc.patient,
    reviewedBy:   doc.reviewedBy,
    createdAt:    doc.createdAt,
  };
}

module.exports = {
  uploadReport: exports.uploadReport,
  sendReport: exports.sendReport,
  getMyReports: exports.getMyReports,
  getAllReports: exports.getAllReports,
  getReport: exports.getReport,
  deleteReport: exports.deleteReport,
};