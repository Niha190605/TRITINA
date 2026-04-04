const express = require("express");
const router  = express.Router();

const { protect, restrictTo }              = require("../middleware/auth");
const { getAllPatients, getPatient, updateProfile } = require("../controllers/patientController");

router.get("/",          protect, restrictTo("doctor"),  getAllPatients);
router.get("/:id",       protect, restrictTo("doctor"),  getPatient);
router.patch("/profile", protect, restrictTo("patient"), updateProfile);

module.exports = router;