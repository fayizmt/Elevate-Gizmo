const cartDb = require("../model/cart");
const userDb = require("../model/signupModel");
const productDb = require("../model/productModel");
const Category = require("../model/categoryModel");
const couponDb = require("../model/couponModel")
const { ObjectId } = require("mongoose").Types;

const loadCart = async (req,res) => {
    try {
        const categoryData = await Category.find();
        const id = req.session.user_id;
        const userData = await userDb.findById({ _id: id });
        // console.log(userData);
    
        const userId = userData._id;
    
        const cartData = await cartDb
        .findOne({ userId: userId })
        .populate("products.productId");
        // console.log(cartData);
        if (req.session.user_id) {
          if (cartData) {
            let Total;
            if (cartData.products != 0) {
              const total = await cartDb.aggregate([
                {
                  $match: { userId: new ObjectId(userId) },
                },
                {
                  $unwind: "$products",
                },
                {
                  $project: {
                    price: "$products.price",
                    quantity: "$products.quantity",
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: {
                      $sum: {
                        $multiply: ["$quantity", "$price"],
                      },
                    },
                  },
                },
              ]);
              let Total = total[0].total;
              let couponCode = "";
              
              const coupon = await couponDb.findOne({ criteriaAmount: { $lt: Total } });
              
              if (coupon) {
                  couponCode = coupon.couponCode;
                  console.log(couponCode);
              } else {
                  console.log("No valid coupon found.");
              }
              
    
              console.log(total);
            //   console.log(userId);
    
              res.render("cart", {
                user: userData,
                cart: cartData.products,
                userId: userId,
                total: Total,
                category: categoryData,
                coupon: couponCode
              });
              console.log("case1");
            } else {
              res.render("cart", {
                user: req.session.user_id,
                cart: [],
                total: 0,
                category: categoryData,
              });
              console.log("case2");
            }
          } else {
            res.render("cart", {
              user: userData,
              cart: [],
              total: 0,
              category: categoryData,
            });
            console.log("case3");
          }
        } else {
          res.render("cart", {
            message: "User Logged",
            user: userData,
            cart: [],
            total: 0,
            category: categoryData,
          });
          console.log("case4");
        }
      } catch (error) {
        console.log(error.message);
        throw new Error(error);
      }
    };




    const addToCart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const productId = req.params.id;
            const userId = req.session.user_id;

            const userData = await userDb.findById(userId);
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }

            const productData = await productDb.findById(productId);
            if (!productData) {
                return res.status(404).json({ error: "Product not found" });
            }

            let userCart = await cartDb.findOne({ userId: userId });

            // Calculate the product price based on discounts
            let productPrice = 0;
            if (productData.discountedPrice || productData.categoryDiscountedPrice) {
                productPrice = Math.min(productData.discountedPrice, productData.categoryDiscountedPrice);
            } else {
                productPrice = productData.price;
            }

            if (userCart) {
                const existingProduct = userCart.products.find(product => product.productId === productId);

                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    userCart.products.push({ productId: productId, quantity: 1, price: productPrice });
                }

                // Update total cart price
                userCart.totalPrice = userCart.products.reduce((total, product) => {
                    return total + (product.quantity * product.price);
                }, 0);

                userCart = await userCart.save();
            } else {
                userCart = new cartDb({
                    userId: userId,
                    products: [{ productId: productId, quantity: 1, price: productPrice }],
                    totalPrice: productPrice,
                });

                userCart = await userCart.save();
            }

            res.json({ success: true, totalPrice: userCart.totalPrice });
        } else {
            res.json({ loginRequired: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "An error occurred" });
    }
};

      const removeCartItem = async (req, res) => {
        const productId = req.params.id;
        const userId = req.session.user_id;
      
        try {
          // Validate productId and userId
          if (!productId || !userId) {
            return res.status(400).json({ error: 'Invalid request parameters' });
          }
      
          // Update the cart by removing the product
          const cartData = await cartDb.findOneAndUpdate(
            { userId: userId, "products.productId": productId },
            { $pull: { products: { productId: productId } } },
            { new: true } // Return the updated cart data
          );
      
          if (!cartData) {
            return res.status(404).json({ error: 'Product not found in cart' });
          }
      
          res.json({ success: true, cart: cartData }); // Send success response with updated cart data
        } catch (error) {
          console.error(error.message);
          res.status(500).json({ error: 'Internal server error' }); // Send 500 error response
        }
      };

      const cartQuantity = async (req, res) => {
        try {
            const userId = req.body.userId;
            const productId = req.body.productId;
            const count = parseInt(req.body.count);
            // console.log(userId);
            // console.log(productId);
            // console.log(count);
    
            const cartData = await cartDb.findOne(
                {
                    userId: new ObjectId(userId),
                    "products.productId": new ObjectId(productId),
                },
                {
                    "products.productId.$": 1,
                    "products.quantity": 1,
                    "products.totalPrice": 1,
                }
            );
    
            const [{ quantity, totalPrice }] = cartData.products;
            console.log(quantity);
            const stockAvailable = await productDb.findById({
                _id: new ObjectId(productId),
            });
    
            if (stockAvailable.quantity < quantity + count) {
                return res.json({ changeSuccess: false, message: "Insufficient stock" });
            }
    
            let productPrice = 0;
    
            if (
                stockAvailable.discountedPrice ||
                stockAvailable.categoryDiscountedPrice
            ) {
                productPrice =
                    stockAvailable.discountedPrice > stockAvailable.categoryDiscountedPrice
                        ? stockAvailable.discountedPrice
                        : stockAvailable.categoryDiscountedPrice;
            } else {
                productPrice = stockAvailable.price;
            }
    
            const newTotalPrice = totalPrice + (productPrice * count);
    
            await cartDb.updateOne(
                {
                    userId: userId,
                    "products.productId": productId,
                },
                {
                    $inc: { "products.$.quantity": count },
                    $set: { "products.$.totalPrice": newTotalPrice },
                }
            );
    
            // Calculate the total cart price by iterating over all products
            const updatedCart = await cartDb.findOne({ userId: new ObjectId(userId) });
            const totalCartPrice = updatedCart.products.reduce(
                (total, product) => total + product.totalPrice,
                0
            );
  console.log(totalCartPrice);
    
            res.json({ changeSuccess: true, totalPrice: totalCartPrice });
        } catch (error) {
            console.log(error.message);
            res.json({ changeSuccess: false, message: "An error occurred" });
        }
    };

    const checkCoupon = async (req, res) => {
      try {
          const userId = req.session.user_id; 
          const couponCode = req.body.couponCode; 
          const currentDate = new Date();
  
          const cartData = await cartDb.findOne({ userId: userId });
          const cartTotal = cartData.products.reduce((acc, val) => acc + val.totalPrice, 0);
  
          const couponData = await couponDb.findOne({ couponCode: couponCode });
          if (couponData) {
              if (currentDate >= couponData.activationDate && currentDate <= couponData.expiryDate) {
                  const isUserUsed = couponData.usedUsers.includes(userId);
                  if (!isUserUsed) {
                      if (cartTotal >= couponData.criteriaAmount) {
                          await couponDb.findOneAndUpdate({ couponCode: couponCode }, { $push: { usedUsers: userId } });
                          await cartDb.findOneAndUpdate({ userId: userId }, { $set: { couponDiscount: couponData._id } });
                          res.json({ coupon: true });
                      } else {
                          res.json({ coupon: 'amount issue' });
                      }
                  } else {
                      res.json({ coupon: 'used' });
                  }
              } else {
                  res.json({ coupon: 'coupon not active' });
              }
          } else {
              res.json({ coupon: false });
          }
      } catch (error) {
          console.error('Error applying coupon:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  };
  
    

    
module.exports = {
    loadCart,
    addToCart,
    removeCartItem,
    cartQuantity,
    checkCoupon,
}