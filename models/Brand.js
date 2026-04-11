const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Brand name is required'], trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

brandSchema.pre('validate', function (next) {
  if (this.name && (this.isNew || this.isModified('name'))) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Brand', brandSchema);