const express=require('express')
const userRoute=express()
const nocache = require('nocache')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middileware/auth')
const userController = require("../controller/userController");
const wishlistController = require("../controller/wishlistController");
const cartController = require("../controller/cartController")

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
userRoute.get("/",auth.isLogout, userController.loginLoad);
userRoute.get("/login",auth.isLogout, userController.loginLoad);
userRoute.post("/login", userController.verifyLogin);

//Home
userRoute.get("/home",auth.isLogin,userController.loadHome);
userRoute.get("/product-detail/:id",userController.loadProductDetails);

//wishlist
userRoute.get("/wishlist",wishlistController.loadWishlist);
userRoute.post("/wishlist/:id",wishlistController.addToWishlist);
userRoute.delete("/wishlist/:id",wishlistController.removeWishlistItem);

//Cart

userRoute.get("/cart",cartController.loadCart);
userRoute.post("/cart/:id",cartController.addToCart);
userRoute.post("/count-quantity",cartController.cartQuantity);
userRoute.delete("/cart/:id",cartController.removeCartItem);
userRoute.post("/cart",cartController.loadCart);


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