const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we'll upload the buffer to Cloudinary manually
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a buffer to Cloudinary and return the secure URL
function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'collaborative-team-hub',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = { cloudinary, upload, uploadToCloudinary };
