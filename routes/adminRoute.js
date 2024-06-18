const express=require('express');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middileware/adminAuth')
const imageUploader = require("../config/multer");
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const bannerController = require('../controller/bannerController');
const couponController = require('../controller/couponController');
const orderController = require('../controller/orderController')
const adminRoute=express()


adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");
adminRoute.use(express.static("public"));

adminRoute.use(session({secret:config.sessionSecret,  
  resave: false, 
  saveUninitialized: false}));

adminRoute.get('/',auth.isLogout,adminController.loginLoad)

adminRoute.post('/login',adminController.verifyLogin)

//forget password
adminRoute.get("/forget",auth.isLogout, adminController.forgetLoad);
adminRoute.post("/forget", adminController.forgetVerify);

//reset password
adminRoute.get("/forget-password",auth.isLogout, adminController.forgetPasswordLoad);
adminRoute.post("/forget-password", adminController.resetPassword);

//Home
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard)

adminRoute.get('/logout',auth.isLogin,adminController.adminLogout)

//Users
adminRoute.get('/users',adminController.loadUsers)


//category
adminRoute.get('/category',auth.isLogin,categoryController.loadCategory)
//add Category
adminRoute.get('/addcategory',auth.isLogin,categoryController.loadAddCategory)
adminRoute.post('/addcategory',imageUploader.uploadCategory.single("imagepath"),categoryController.addCategory)
//edit Category
adminRoute.get('/editcategory',categoryController.loadEditCategory)
adminRoute.post('/editcategory',imageUploader.uploadCategory.single("imagepath"),categoryController.updateCategory)
//block/unblock
adminRoute.post('/category/toggle-block/:id', categoryController.categoryStatus)


//product
adminRoute.get('/product',auth.isLogin,productController.loadProduct)
//add Product
adminRoute.get('/addproduct',auth.isLogin,productController.loadAddProduct)
adminRoute.post('/addproduct', imageUploader.uploadProduct.array("imagepath", 5),
imageUploader.productImgResize,productController.addProduct)
// edit Product
adminRoute.get('/editproduct',auth.isLogin,productController.loadEditProduct)
adminRoute.post('/editproduct', imageUploader.uploadProduct.array("images", 5),
imageUploader.productImgResize,productController.updateProduct);

adminRoute.delete("/removeImage", productController.removeImage);

adminRoute.patch(
  "/uploadImage/:productId",
  imageUploader.uploadProduct.array("images"),imageUploader.productImgResize,
  productController.uploadImage);
//block/unblock
adminRoute.post('/product',productController.productStatus)


// Banner
adminRoute.get('/banner',auth.isLogin,bannerController.loadBanner)
//add Banner
adminRoute.get('/addbanner',auth.isLogin,bannerController.addBannerLoad)
adminRoute.post('/addbanner',imageUploader.uploadBanner.single("image"),bannerController.addBanner)
//Edit Banner
adminRoute.get('/editbanner',auth.isLogin,bannerController.editBannerLoad)
adminRoute.post('/editbanner',imageUploader.uploadBanner.single("image"),bannerController.updateBanner)

//Coupon
adminRoute.get('/coupon',auth.isLogin,couponController.loadcoupon)
//add Coupon
adminRoute.get('/addcoupon',auth.isLogin,couponController.addCouponLoad)
adminRoute.post('/addcoupon',couponController.addCoupon)
//edit Coupon
adminRoute.get('/editcoupon',auth.isLogin,couponController.editCouponLoad)
adminRoute.post('/editcoupon',couponController.updateCoupon)
adminRoute.get("/deletecoupon",couponController.removeCoupon);


//order
adminRoute.get('/order',auth.isLogin,adminController.loadOrder)
adminRoute.get('/showorder',auth.isLogin,adminController.loadShowOrder)
adminRoute.post('/updateProductStatus',adminController.updateProductStatus)



module.exports=adminRoute