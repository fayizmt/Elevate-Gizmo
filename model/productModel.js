const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    
    is_block: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true }
);






module.exports = mongoose.model('Product', productSchema);