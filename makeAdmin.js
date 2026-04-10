const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL;

const ADMIN_EMAIL = "tumkibet32@gmail.com";
const ADMIN_PASSWORD = "jamkei5242";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("Admin already exists.");

      // OPTIONAL: remove admin
      const remove = process.argv.includes("--remove");

      if (remove) {
        await User.deleteOne({ email: ADMIN_EMAIL });
        console.log("Admin removed.");
      }

      process.exit();
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      name: "Super Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log(admin);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();