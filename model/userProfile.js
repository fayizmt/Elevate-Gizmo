const mongoose = require('mongoose');

const schema=new mongoose.Schema({
    id:{
        type: mongoose.Types.ObjectId,
        required:true
    },
    name:{
        type:String
    },
    image:{
        type:String
    },
    gender:{
        type:String
    },
    dob:{
        type:String
    },
    email:{
        type:String
    },
    mobile:{
        type:Number
    },
    houseName:{
        type:String
    },
    streetName:{
        type:String
    },
    post:{
        type:String
    },
    pincode:{
        type:Number
    },
    district:{
        type:String
    },
    state:{
        type:String
    }
})

const profileschema= new mongoose.model('userProfile',schema)
module.exports=profileschema