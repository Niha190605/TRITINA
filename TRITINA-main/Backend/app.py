from flask import Flask, request, jsonify
from flask_cors import CORS
import torch

app = Flask(__name__)
CORS(app)

model = torch.load("ml/retina_best.pth", map_location="cpu")
model.eval()

@app.route("/")
def home():
    return "ML API Running"

@app.route("/predict", methods=["POST"])
def predict():
    return jsonify({"result": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)  
