const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'signupdetails' 
    },
    orderDetails: [{
        product: [{
            id: {
                type: mongoose.Types.ObjectId,
                ref: 'Product'
            },
            price: {
                type: Number,
            },
            offerPrice: {
                type: Number,
            },
            color: {
                type: String,
            },
            count: {
                type: Number
            },
            productStatus:{
                type:String,
                required:true
              }
        }],
        name: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        houseName: {
            type: String,
            required: true
        },
        streetName: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        
        paymentOption: {
            type: String,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        shippingCharge: {
            type: String,
            default: "Free"
        },
        discount: {
            type: Number
        },
        totalAmount: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            default: "placed"
        },
        paymentStatus: {
            type: String,
            default: "pending"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
});

module.exports = mongoose.model('checkouts', checkoutSchema);
