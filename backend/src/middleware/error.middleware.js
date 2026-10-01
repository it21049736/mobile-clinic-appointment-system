const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  const stack = process.env.NODE_ENV === 'production' ? null : err.stack;

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: errors.join(', '), errors, stack });
  }

  if (err.name === 'CastError') {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resource not found', stack });
    }
    return res.status(400).json({ message: `Invalid value for ${err.path}`, stack });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 5MB' : err.message;
    return res.status(400).json({ message, stack });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(400).json({ message: `Duplicate ${field}`, stack });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({ message: err.message, stack });
};

module.exports = { errorHandler };
