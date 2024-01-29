const express=require('express')
const adminRoute=express()

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");
adminRoute.use(express.static("public"));

module.exports=adminRoute