import torch
import os
import cv2
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# ------------------ LOAD MODEL ------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "retinal_best.pth")

print("Loading model from:", MODEL_PATH)

model = torch.load(MODEL_PATH, map_location="cpu")
model.eval()

print("✅ Model loaded successfully")


# ------------------ API ------------------
@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]

    # Read image
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Resize (important for consistency)
    img = cv2.resize(img, (224, 224))

    # ------------------ IMAGE PROCESSING ------------------

    # 1. EDGE DETECTION (FIXED)
    edges = cv2.Canny(img, 30, 100)
    edges_path = os.path.join(BASE_DIR, "edges.jpg")
    cv2.imwrite(edges_path, edges)

    # 2. GAUSSIAN BLUR
    gaussian = cv2.GaussianBlur(img, (5, 5), 0)
    gaussian_path = os.path.join(BASE_DIR, "gaussian.jpg")
    cv2.imwrite(gaussian_path, gaussian)

    # 3. LAPLACIAN
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian = np.uint8(np.absolute(laplacian))
    laplacian_path = os.path.join(BASE_DIR, "laplacian.jpg")
    cv2.imwrite(laplacian_path, laplacian)

    # 4. FAKE GRAD-CAM (FOR DEMO)
    heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
    gradcam = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)
    gradcam_path = os.path.join(BASE_DIR, "gradcam.jpg")
    cv2.imwrite(gradcam_path, gradcam)

    # ------------------ MODEL PREDICTION (DUMMY) ------------------
    # NOTE: Replace this with your actual model inference
    confidence = round(float(np.random.uniform(0.7, 0.95)), 2)

    # ------------------ RESPONSE ------------------
    return jsonify({
        "edges": "edges.jpg",
        "gaussian": "gaussian.jpg",
        "laplacian": "laplacian.jpg",
        "gradcam": "gradcam.jpg",
        "confidence": confidence,
        "result": "Glaucoma Detected"
    })


# ------------------ RUN SERVER ------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
