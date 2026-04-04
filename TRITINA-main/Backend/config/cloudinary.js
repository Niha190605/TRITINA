const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for original retinal image uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "retinaai/originals",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1024, height: 1024, crop: "limit", quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPG, PNG, WebP allowed"), false);
  },
});

// Upload a base64 data URL to cloudinary (used for edge + gradcam images)
const uploadBase64 = async (base64String, folder) => {
  const result = await cloudinary.uploader.upload(base64String, { folder });
  return { url: result.secure_url, publicId: result.public_id };
};

module.exports = { cloudinary, upload, uploadBase64 };