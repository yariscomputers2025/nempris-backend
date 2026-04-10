const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 }
      }
    ],
    customerName: { type: String, required: [true, 'Customer name is required'] },
    phone: { type: String, required: [true, 'Customer phone is required'] },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'completed'],
      default: 'pending'
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
