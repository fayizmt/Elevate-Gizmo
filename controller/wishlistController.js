const Wishlist = require("../model/wishlist");
const Product = require("../model/productModel"); // Import ProductModel

const mongoose = require('mongoose')

const loadWishlist = async (req, res) => {
    const userId = req.session.user_id;

    try {
        // Find the wishlist items for the user
        const wishlistItems = await Wishlist.findOne({ userId:userId }).populate({
          path: 'productId',
          model: 'Product', // Model name for the Product schema
        });
      
        if (!wishlistItems) {
          console.log('Wishlist not found for the user.');
          return; // Handle the case where the wishlist is not found
        }

        res.render('wishlist', { wishlistData: wishlistItems });
      
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    }


 const addToWishlist = async (req, res) => {
        const userId = req.session.user_id; // Get the user ID from the session
        const productId = req.params.id;
    
        try {
            // Check if the user exists in the Wishlist
            let existingUser = await Wishlist.findOne({ userId });
    
            if (existingUser) {
                // User already exists in the Wishlist, check if the product is already added
                const productExists = existingUser.productId.find(item => item.equals(productId));
    
                if (productExists) {
                    return res.status(400).json({ message: "The product is already added to the wishlist" });
                } else {
                    // Add the product to the user's wishlist
                    existingUser.productId.push(productId);
                    await existingUser.save();
    
                    return res.status(200).json({ message: "Product added to wishlist successfully" });
                }
            } else {
                // User not found in the Wishlist, create a new wishlist for the user
                const newWishlistItem = await Wishlist.create({
                    userId: userId,
                    productId: [productId]
                });
    
                return res.status(201).json({ message: "Item added to wishlist successfully" });
            }
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    };

const removeWishlistItem = async (req,res) => {

    const productId = req.params.id
    // console.log(productId);
    const userId = req.session.user_id
    // console.log(userId);
    try {
        await Wishlist.updateOne(
            {userId:userId},
            {$pull:{productId:productId}});
        res.status(200).json({message:"Item is deleted"});    
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Internal server error" }); 
    }
}    


module.exports = {
    loadWishlist,
    addToWishlist,
    removeWishlistItem
};
