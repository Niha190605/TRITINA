/**
 * ml/aiEngine.js
 * ─────────────────────────────────────────────────────────────
 * Connects to Python Flask server (flask_model/app.py)
 * which loads retinal_best.pth and stage_best.pth
 *
 * Flask server must be running on port 8000:
 *   cd flask_model
 *   python app.py
 * ─────────────────────────────────────────────────────────────
 */

const axios = require("axios");

const FLASK_URL = process.env.FLASK_URL || "http://localhost:8000";

/**
 * predict() — sends image URL to Flask, gets AI result back
 * @param {string} imageUrl - Cloudinary URL of the uploaded retinal image
 * @returns {{ diagnosis, stage, confidence, risk, findings, analyzedAt }}
 */
const predict = async (imageUrl) => {
  try {
    const response = await axios.post(
      `${FLASK_URL}/predict`,
      { image_url: imageUrl },
      { timeout: 30000 } // 30s timeout for model inference
    );

    const data = response.data;

    return {
      diagnosis:  data.diagnosis,
      stage:      data.stage,
      confidence: data.confidence,
      risk:       data.risk,
      findings:   data.findings,
      analyzedAt: new Date(),
    };

  } catch (err) {
    // If Flask is down, throw a clear error
    if (err.code === "ECONNREFUSED") {
      throw new Error("ML service is offline. Please start the Flask server on port 8000.");
    }
    if (err.response?.data?.error) {
      throw new Error(`ML error: ${err.response.data.error}`);
    }
    throw new Error(`Prediction failed: ${err.message}`);
  }
};

module.exports = { predict };