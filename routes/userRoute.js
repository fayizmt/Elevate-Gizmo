const express=require('express')
const userRoute=express()
const nocache = require('nocache')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middileware/auth');
const imageUploader = require("../config/multer");
const userController = require("../controller/userController");
const userprofileController = require("../controller/userProfileController")
const wishlistController = require("../controller/wishlistController");
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const reviewController = require("../controller/reviewController");
userRoute.use(session({secret:config.sessionSecret,
    resave: false, 
    saveUninitialized: false}));
userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(express.static("public"));


// Registration
userRoute.get("/registration",auth.isLogout, userController.loadRegistration);
userRoute.post("/registration", userController.insertUser);

//otp Verification
userRoute.get("/otpVerification",userController.loadVerifyOtp)
userRoute.post("/otpVerification",userController.verifyOtp)

//forget Password
userRoute.get("/forget",userController.forgetLoad)
userRoute.post("/forget",userController.forgetVerify)

// Login Routes
userRoute.get("/", userController.home);
userRoute.get("/login", userController.loginLoad);
userRoute.post("/login", userController.verifyLogin);

//Home
userRoute.get("/home",auth.isLogin,userController.loadHome);
userRoute.get("/contact",userController.loadContact);
userRoute.get("/about-us",userController.loadAboutUs);

userRoute.get("/product-detail/:id",userController.loadProductDetails);

userRoute.get("/shop",userController.loadShop);
userRoute.get("/search",userController.searchProduct);



//profile
userRoute.get("/profile",auth.isLogin,userprofileController.loadProfile)
userRoute.get("/editProfile",auth.isLogin,userprofileController.completeProfile)
userRoute.post("/editProfile",imageUploader.uploadUser.single("image"),userprofileController.updateProfile)

//wishlist
userRoute.get("/wishlist",auth.isLogin,wishlistController.loadWishlist);
userRoute.post("/wishlist/:id",wishlistController.addToWishlist);
userRoute.delete("/wishlist/:id",wishlistController.removeWishlistItem);

//Cart

userRoute.get("/cart",auth.isLogin,cartController.loadCart);
userRoute.post("/cart/:id",auth.isLogin,cartController.addToCart);
userRoute.post("/count-quantity",cartController.cartQuantity);
userRoute.delete("/cart/:id",cartController.removeCartItem);
userRoute.post("/cart",cartController.loadCart);

// check coupon
userRoute.post("/couponCheck",cartController.checkCoupon);


userRoute.get("/checkout",orderController.loadCheckout);
// userRoute.post("/checkout",orderController.addCheckoutDetails)
userRoute.post("/checkout",orderController.placeOrder);

//
userRoute.post("/removecoupon",orderController.removeCoupon);


//payment
userRoute.get("/payment",orderController.loadPayment);
userRoute.post("/paymentComplete",orderController.paymentComplete);

userRoute.get("/orderComplete/:data",orderController.orderComplete);
userRoute.get("/orderList",auth.isLogin,userController.loadOrder);
userRoute.get("/orderHistory/:id",userController.orderHistory);

userRoute.put('/cancelOrder/:id',userController.cancelOrder)

userRoute.post('/addReview',reviewController.addReview)
userRoute.get('/editReview',reviewController.editReviewGet)
userRoute.post('/submit-editreview',reviewController.updateReview)

// Logout
userRoute.get("/logout",auth.isLogin,userController.userLogout);

//forget password
userRoute.get("/forget",auth.isLogout, userController.forgetLoad);
userRoute.post("/forget", userController.forgetVerify);

//reset password
userRoute.get("/forget-password",auth.isLogout, userController.forgetPasswordLoad);
userRoute.post("/forget-password", userController.resetPassword);

// userRoute.post("/login", userController.verifyLogin);
// userRoute.get("/logout",  auth.isLogin,auth.checkBlock, userController.userLogout);

module.exports=userRoute