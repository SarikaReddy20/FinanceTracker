import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = allowedMimeTypes.has(file.mimetype);
  const isAllowedExtension = allowedExtensions.has(extension);

  if (isAllowedMime && isAllowedExtension) {
    return cb(null, true);
  }

  return cb(new Error("Only image files (JPG, JPEG, PNG, WEBP) are allowed"));
};

const billUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default billUpload;
