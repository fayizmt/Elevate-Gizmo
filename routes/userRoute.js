const express=require('express')
const userRoute=express()
const userController=require("../controller/userController")
userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(express.static("public"));

// login routes 
// Login Routes
userRoute.get("/", userController.loginLoad);
userRoute.get("/login", userController.loginLoad);
// userRoute.post("/login", userController.verifyLogin);
// userRoute.get("/logout",  auth.isLogin,auth.checkBlock, userController.userLogout);

module.exports=userRoute