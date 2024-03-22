const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    
        category: {
          type: String,
          required: true,
          
          
        },
        description: {
          type: String,
          required: true,
          
        
        },
        imagepath: {
          type: String,
      required: true,
      
        },
        is_block: {
          type: Boolean,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
        { timestamps: true },

)

module.exports = mongoose.model("Category",categorySchema)