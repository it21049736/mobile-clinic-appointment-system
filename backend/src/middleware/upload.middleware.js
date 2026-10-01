const fs = require('fs');
const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  const err = new Error('Only images (jpeg, jpg, png) are allowed');
  err.statusCode = 400;
  cb(err);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Deletes a stored upload given its public path ("uploads/<file>"); missing files are ignored.
const removeUpload = (publicPath) => {
  if (!publicPath) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(publicPath)), () => {});
};

module.exports = { upload, removeUpload };
