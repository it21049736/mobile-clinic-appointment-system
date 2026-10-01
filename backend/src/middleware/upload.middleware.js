const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// With CLOUDINARY_URL set (hosted backend) images go to Cloudinary, because the host's disk
// is wiped on every restart. Without it (local development) they are saved in src/uploads.
const useCloud = Boolean(process.env.CLOUDINARY_URL);
const CLOUD_FOLDER = 'mobile-clinic/doctors';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!useCloud) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const diskStorage = multer.diskStorage({
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

const multerUpload = multer({
  storage: useCloud ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadToCloud = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: CLOUD_FOLDER, resource_type: 'image' }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

// Sets req.file.storedPath: a Cloudinary https URL, or "uploads/<file>" for local storage.
const storeFile = async (req, res, next) => {
  if (!req.file) return next();
  try {
    if (useCloud) {
      const result = await uploadToCloud(req.file.buffer);
      req.file.storedPath = result.secure_url;
    } else {
      req.file.storedPath = `uploads/${req.file.filename}`;
    }
    next();
  } catch (error) {
    res.status(502);
    next(new Error('Image upload failed. Please try again.'));
  }
};

const uploadImage = (fieldName) => [multerUpload.single(fieldName), storeFile];

// ".../upload/v1712345678/mobile-clinic/doctors/abc123.jpg" -> "mobile-clinic/doctors/abc123"
const cloudPublicId = (url) => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

// Deletes a stored image (Cloudinary URL or "uploads/<file>"); missing files are ignored.
const removeUpload = (storedPath) => {
  if (!storedPath) return;
  if (/^https?:\/\//.test(storedPath)) {
    const publicId = cloudPublicId(storedPath);
    if (useCloud && publicId) cloudinary.uploader.destroy(publicId).catch(() => {});
    return;
  }
  fs.unlink(path.join(UPLOAD_DIR, path.basename(storedPath)), () => {});
};

module.exports = { uploadImage, removeUpload };
