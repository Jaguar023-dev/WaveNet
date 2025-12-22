// server/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Check if streamifier is available, provide fallback
let streamifier;
try {
  streamifier = require('streamifier');
} catch (err) {
  console.warn('streamifier not found, using fallback implementation');
  streamifier = {
    createReadStream: (buffer) => {
      const { Readable } = require('stream');
      const readable = new Readable();
      readable._read = () => {}; // _read is required but can be noop
      readable.push(buffer);
      readable.push(null);
      return readable;
    }
  };
}

// Configure Cloudinary from environment variables
const configureCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    console.log('Cloudinary configured successfully');
    return true;
  }
  
  console.warn('Cloudinary environment variables not set. Using local storage fallback.');
  return false;
};

const isCloudinaryConfigured = configureCloudinary();

/**
 * Upload a file to Cloudinary or local storage
 */
const uploadToCloudinary = (buffer, folder = 'wavenet', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      // Fallback to local storage simulation
      const mockResult = {
        secure_url: `/uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${resourceType === 'image' ? 'jpg' : 'mp4'}`,
        public_id: `local_${Date.now()}`,
        width: resourceType === 'image' ? 800 : 1280,
        height: resourceType === 'image' ? 600 : 720,
        format: resourceType === 'image' ? 'jpg' : 'mp4',
        resource_type: resourceType,
        bytes: buffer.length
      };
      return resolve(mockResult);
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { width: 1200, height: 630, crop: 'limit' },
          { quality: 'auto:good' }
        ] : [],
        timeout: 60000 // 60 second timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Handle stream errors
    uploadStream.on('error', (error) => {
      console.error('Cloudinary stream error:', error);
      reject(error);
    });
    
    // Pipe the buffer to Cloudinary
    const readableStream = streamifier.createReadStream(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!isCloudinaryConfigured) {
    console.log(`[Mock] Would delete: ${publicId}`);
    return { result: 'ok' };
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
const uploadMultipleToCloudinary = async (files, folder = 'wavenet') => {
  const uploadPromises = files.map(file => {
    const resourceType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 'raw';
    
    return uploadToCloudinary(
      file.buffer || Buffer.from(''), 
      folder, 
      resourceType
    );
  });
  
  return Promise.all(uploadPromises);
};

/**
 * Extract public ID from Cloudinary URL
 */
const extractPublicId = (url) => {
  if (!url) return '';
  
  try {
    // Cloudinary URL pattern: https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/filename.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the index after 'upload'
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
      // Not a standard Cloudinary URL, extract filename
      return url.split('/').pop().split('.')[0];
    }
    
    // Extract everything after 'upload' except version (v1234567)
    let publicIdParts = [];
    for (let i = uploadIndex + 1; i < pathParts.length; i++) {
      if (i === uploadIndex + 1 && pathParts[i].startsWith('v')) {
        // Skip version string
        continue;
      }
      publicIdParts.push(pathParts[i]);
    }
    
    const publicId = publicIdParts.join('/');
    return publicId.split('.')[0]; // Remove extension
  } catch (err) {
    // If URL parsing fails, fallback to simple extraction
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
};

/**
 * Generate Cloudinary URL with transformations
 */
const generateUrl = (publicId, transformations = [], resourceType = 'image') => {
  if (!isCloudinaryConfigured || !publicId || publicId.startsWith('local_') || publicId.startsWith('temp_')) {
    // Return mock URL for local files
    return `/uploads/${publicId.replace(/^(local_|temp_)/, '')}.jpg`;
  }
  
  const transformationString = transformations.map(t => 
    Object.entries(t).map(([key, value]) => `${key}_${value}`).join(',')
  ).join('/');
  
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: resourceType,
    transformation: transformationString ? [{ ...transformations }] : []
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  extractPublicId,
  generateUrl,
  isConfigured: isCloudinaryConfigured
};