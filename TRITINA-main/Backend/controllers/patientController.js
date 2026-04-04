const User   = require("../models/User");
const Report = require("../models/Report");

// GET /api/patients  (doctor — all patients with risk summary)
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: "patient", isActive: true }).sort({ createdAt: -1 });

    const enriched = await Promise.all(patients.map(async (p) => {
      const reports    = await Report.find({ patient: p._id }).select("risk diagnosis stage confidence createdAt sentByDoctor").sort({ createdAt: -1 }).lean();
      const risks      = reports.map(r => r.risk).filter(Boolean);
      const highestRisk = risks.includes("High") ? "High" : risks.includes("Moderate") ? "Moderate" : risks.length ? "Low" : "None";

      return {
        id: p._id.toString(), name: p.name, email: p.email,
        age: p.age, gender: p.gender, phone: p.phone,
        reportCount: reports.length, highestRisk,
        latestReport: reports[0] || null,
      };
    }));

    res.status(200).json({ success: true, count: enriched.length, patients: enriched });
  } catch (err) { next(err); }
};

// GET /api/patients/:id  (doctor — one patient + all their reports)
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    const reports = await Report.find({ patient: patient._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      patient: { id: patient._id.toString(), name: patient.name, email: patient.email, age: patient.age, gender: patient.gender, phone: patient.phone },
      reports: reports.map(r => ({
        id: r._id.toString(),
        date: r.createdAt.toISOString().split("T")[0],
        originalImage: r.image?.originalUrl || null,
        edgeImage:     r.image?.edgeUrl     || null,
        gradcamImage:  r.image?.gradcamUrl  || null,
        diagnosis: r.diagnosis, stage: r.stage,
        confidence: r.confidence, risk: r.risk, findings: r.findings,
        doctorNote: r.doctorNote || null, prescription: r.prescription || null,
        sentByDoctor: r.sentByDoctor, status: r.status,
      })),
    });
  } catch (err) { next(err); }
};

// PATCH /api/patients/profile  (patient — update own profile)
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "age", "gender", "phone", "medicalHistory"];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};