const multer = require('multer');
const sharp = require('sharp');
const { uploadBuffer } = require('../config/cloudinaryConfig');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const processImages = async (files = []) => {
  const uploads = files.slice(0, 10).map(async (file) => {
    const buffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    const result = await uploadBuffer(buffer, 'nempris/products');
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  });

  return Promise.all(uploads);
};

module.exports = {
  upload,
  processImages
};
