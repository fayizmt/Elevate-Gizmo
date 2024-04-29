const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: "product",
        required: true
    },
    userId: {
        type: ObjectId,
        ref: "signupdetails",
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('Review', reviewSchema);