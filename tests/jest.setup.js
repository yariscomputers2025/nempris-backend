require('dotenv').config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'jest-secret';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'jest-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'jest-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'jest-secret';

jest.setTimeout(30000);
