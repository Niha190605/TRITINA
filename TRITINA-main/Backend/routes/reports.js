const express = require("express");
const router  = express.Router();

const { protect, restrictTo } = require("../middleware/auth");
const { upload }              = require("../config/cloudinary");
const {
  uploadReport,
  sendReport,
  getMyReports,
  getAllReports,
  getReport,
  deleteReport,
} = require("../controllers/reportController");

// Doctor only
router.post("/upload",    protect, restrictTo("doctor"), upload.single("image"), uploadReport);
router.patch("/:id/send", protect, restrictTo("doctor"), sendReport);
router.get("/all",        protect, restrictTo("doctor"), getAllReports);
router.delete("/:id",     protect, restrictTo("doctor"), deleteReport);

// Patient only
router.get("/my",         protect, restrictTo("patient"), getMyReports);

// Both
router.get("/:id",        protect, getReport);

module.exports = router;