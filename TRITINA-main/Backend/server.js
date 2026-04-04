require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// ── Connect MongoDB ───────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "RetinaAI Server running 🚀" });
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/reports",  require("./routes/reports"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/messages", require("./routes/messages"));

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `${req.originalUrl} not found` });
});

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  RetinaAI Backend running on http://localhost:${PORT}`);
  console.log(`🌍  Env   : ${process.env.NODE_ENV || "development"}`);
  console.log(`🩺  Health: http://localhost:${PORT}/api/health\n`);
});