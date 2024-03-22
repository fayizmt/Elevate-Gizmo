const mongoose = require("mongoose")
const nocache = require('nocache')
// const session = require('express-session')
const dotenv=require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')

// connecting db 
const dbConnect= require("./config/mongodb")

dbConnect.dbConnect()

// loading assets 

app.use('/admin',express.static(path.join(__dirname,"public/admin")))
app.use('/user',express.static(path.join(__dirname,"public/user")))
app.use(express.static(path.join(__dirname,"public")))


// for user route 
const userRoute = require("./routes/userRoute")
app.use("/",userRoute)



// for admin route 
const adminRoute = require("./routes/adminRoute");

// const { connect } = require("http2");
app.use("/admin",adminRoute)




const PORT = process.env.PORT||7000

app.listen(PORT, 
    () => console.log(`Server is running At http://localhost:${PORT}`))