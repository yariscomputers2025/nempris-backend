const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
