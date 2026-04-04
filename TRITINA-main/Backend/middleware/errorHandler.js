const errorHandler = (err, req, res, next) => {
  let status  = err.statusCode || 500;
  let message = err.message    || "Internal Server Error";

  // Duplicate key (e.g. email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already in use.`;
    status  = 409;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map(e => e.message).join(". ");
    status  = 400;
  }

  // Bad ObjectId
  if (err.name === "Cast Error") {
    message = `Invalid ID: ${err.value}`;
    status  = 400;
  }

  // Multer file size
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File must be under 10MB.";
    status  = 400;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("💥 Error:", err.message);
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
