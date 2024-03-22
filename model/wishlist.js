const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,
         ref: 'signupModel',
          required: true },
    productId: [{ 
        type: mongoose.Schema.Types.ObjectId,
         }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;