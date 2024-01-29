const mongoose= require("mongoose")


const dbConnect=()=>{
    try{
        const conn= mongoose.connect(process.env.MONGODB_URL)
        console.log("Db connected Successfully");
    }
    catch (error){
        console.log("Db is error");
    }
}
module.exports={dbConnect}