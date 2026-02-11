const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const isCloudinaryConfigured = () => (
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadBuffer = (buffer, options = {}) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'image', ...options },
    (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    }
  );

  streamifier.createReadStream(buffer).pipe(stream);
});

module.exports = {
  isCloudinaryConfigured,
  uploadBuffer
};
