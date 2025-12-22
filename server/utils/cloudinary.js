// server/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} resourceType - 'image', 'video', or 'raw'
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'wavenet', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { width: 1200, height: 630, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ] : []
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'video', or 'raw'
 * @returns {Promise<Object>} Cloudinary delete result
 */
const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToCloudinary = async (files, folder = 'wavenet') => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, folder, file.mimetype.startsWith('image/') ? 'image' : 'video')
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Extract Cloudinary public ID from URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
const extractPublicId = (url) => {
  if (!url) return '';
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  extractPublicId
};