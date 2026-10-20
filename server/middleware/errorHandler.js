// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `Duplicate value for field: ${field}. Please use a unique value.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ID format: ${err.value}` });
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
