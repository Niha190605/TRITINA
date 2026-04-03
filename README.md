# TRITINA 👁️
### AI-Powered Retinal Disease Detection & Clinical Reporting Platform

> *Because vision loss shouldn't depend on your zip code.*

---

## 🏆 Hackathon Project

**Team Name:** TRITINA  
**Team Leader:** Niharika Mathankar  
**Team Members:** Anuja Tiwaskar · Nikhil Tembhare

---

## 🔍 What is TRITINA?

TRITINA is a full-stack clinical platform that enables doctors to upload fundus (retinal) images and receive instant AI-powered diagnoses across 4 conditions:

| Disease | Description |
|---|---|
| 🔴 Diabetic Retinopathy | Damage to retinal blood vessels due to diabetes |
| 🟡 Glaucoma | Optic nerve damage causing vision loss |
| 🟠 Cataract | Clouding of the eye lens |
| 🟢 Normal | No disease detected |

The doctor receives a **GradCAM heatmap** — a visual explanation of exactly where in the retina the AI detected the issue — making the diagnosis explainable and trustworthy.

---

## ✨ Key Features

- 🩺 **Doctor Portal** — Upload fundus images, get instant AI diagnosis, write prescriptions, send reports
- 👤 **Patient Portal** — Patients can view their reports and diagnosis history
- 🔬 **Laplacian Segmentation** -Multi-scale edge detection revealing vessels, optic disc, and lesions
- 🔥 **GradCAM Heatmaps** — Visual explanation of AI decisions
- ☁️ **Cloudinary Integration** — Secure cloud storage for all retinal images
- 🔐 **JWT Authentication** — Secure login for doctors and patients
- 📋 **Report Pipeline** — Doctor → Diagnosis → Prescription → Patient, all in one flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| AI Models | PyTorch, ResNet-50 CNN |
| Explainability | GradCAM, Laplacian Segmentation |
| Database | MongoDB (via Motor async driver) |
| Image Storage | Cloudinary |
| Auth | JWT (python-jose, passlib) |

---

## 🏗️ Architecture

```
Doctor uploads image
        ↓
   Frontend (HTML)
        ↓
  POST /api/analyse
        ↓
  FastAPI Backend
        ↓
    CNN Ensemble
        ↓
 GradCAM Heatmap / Laplacian Segmentation
        ↓
  Cloudinary (images)
        ↓
  MongoDB (report saved)
        ↓
 Patient Portal (report delivered along with prescription)
```

## 📁 Project Structure

```
TRITINA/
├── retina_ai_backend/
│   ├── main.py                  ← FastAPI app entry point
│   ├── requirements.txt
│   ├── train.py             ← AI model training script
│   ├── .env.example
│   ├── models/                  ← Trained model weights (.pth)
│   └── app/
│       ├── config.py            ← Settings and env variables
│       ├── database.py          ← MongoDB connection
│       ├── ml_engine.py         ← CNN + GradCAM
│       ├── s3_service.py        ← Cloudinary image storage
│       ├── schemas.py           ← Pydantic data models
│       ├── auth_utils.py        ← JWT authentication
│       └── routes/
│           ├── auth.py          ← Login/register endpoints
│           ├── analyse.py       ← Main AI analysis endpoint
│           ├── reports.py       ← Report delivery
│           ├── patients.py      ← Patient management
│           └── messages.py      ← Messaging system
└── Tritina_final.html         ← Frontend (Doctor + Patient portal)
```

---

## 🧠 AI Model Details

- **CNN (ResNet-50)** — Transfer learning on fundus image dataset
- **Ensemble** —  CNN predictions for higher robustness
- **Training Data** — Cataract, Glaucoma, Diabetic Retinopathy, Normal retinal image datasets
- **Input Size** — 224×224 RGB fundus images
- **Output** — 4-class softmax prediction + GradCAM heatmap

---

## 👥 Team

| Name | Role |
|---|---|
| Niharika Mathankar | Team Leader . Project Architecture . ML model |
| Anuja Tiwaskar |·Backend Development . Integration |
| Nikhil Tembhare | .Frontend Development. Backend Development |
