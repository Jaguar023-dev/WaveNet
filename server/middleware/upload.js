// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Existing storage for general image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// NEW: Storage for verification documents
const verificationStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/verification/');
  },
  filename: function(req, file, cb) {
    cb(null, `verification_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Existing file filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// NEW: File filter for verification documents
const verificationFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed for verification documents'), false);
  }
};

// Existing upload for images
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// NEW: Upload for verification documents
const verificationUpload = multer({
  storage: verificationStorage,
  fileFilter: verificationFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export both upload configurations
module.exports = {
  upload,              // For general image uploads
  verificationUpload   // For verification document uploads
};