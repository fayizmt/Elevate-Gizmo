const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
  userId:{
    type : mongoose.Schema.Types.ObjectId,
    ref:"signupdtails",
    required:true
},
products:[{
    productId :{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required:true
    },
    quantity : {
        type : Number,
        default : 1
    },
    price:{
        type:Number,
        default:0
    },
    offerPrice:{
        type:Number,
        default:0
    },
    totalPrice: {
        type: Number,
        default: function () {
            return this.price * this.quantity;
        }
    }
}],
couponDiscount: {
    type: String,
    ref:'coupon',
  },
})



module.exports = mongoose.model('cart',cartSchema)