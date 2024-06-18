const mongoose = require("mongoose");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");


const loadProduct = async (req,res) => {
    try {
        const productList = await productModel.find({}).populate('category');
        
        res.render('product',{productList:productList})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddProduct = async (req,res) => {
    try {
        const categoryList = await categoryModel.find({});

        
        res.render('addproduct',{categoryList:categoryList})
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async (req,res) => {
    try {
       
        const productName = req.body.productName;
        const description = req.body.description;
        const category = req.body.category;
        const color = req.body.color;
        const price = req.body.price;
        const actualPrice = req.body.actualPrice;
        const quantity = req.body.quantity;

        const images = [];
        for (let i = 0; i < req.files.length; i++){
            images[i] = req.files[i].filename;
        }

        const productData = await productModel.create({
            productName: productName,
            description: description,
            category: category,
            color: color,
            price: price,
            actualPrice: actualPrice,
            quantity: quantity,
            images: images,
            
          })

          if (productData) {
            res.redirect("/admin/product");
          } else {
            res.render("addproduct", { message: "Something wrong." });
          }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProduct = async (req,res) => {
    try {
        const id = req.query.id;
        const productData = await productModel.findOne({_id : id})
        console.log(productData);
        const categoryData = await categoryModel.find();

        if (productData) {
    
     res.render("editproduct", {
        product: productData,
        category: categoryData,
      
      });
      console.log(productData);
    } else {
      res.redirect("/admin/product");
    }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req, res) => {
    try {
      const id = req.body.id;
      const productName = req.body.productName;
      const description = req.body.description;
      const category = req.body.category;
      const color = req.body.color;
      const price = req.body.price;
      const actualPrice =req.body.actualPrice;
    //   const brand = req.body.brand;
      const quantity = req.body.quantity;
      const images = [];
  
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
      }
  
      let updateObject = {
        productName: productName,
        description: description,
        category: category,
        color: color,
        price: price,
        actualPrice: actualPrice,
        // brand: brand,
        quantity: quantity,
        images: images,
      };
  
      if (req.files.length === 0) {
        // If no files were uploaded, remove the images property from updateObject
        delete updateObject.images;
      }
  
      console.log("Update Object:", updateObject);
  
      const product = await productModel.findById(id);
  
      // Update the document with the new values
      Object.assign(product, updateObject);
  
      const updatedProduct = await product.save();
  
      console.log("Updated Product Data:", updatedProduct);
  
      if (updatedProduct) {
        res.redirect("/admin/product");
      } else {
        res.render("editProduct", { message: "Something went wrong" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };
  // Remove Image
  const removeImage = async (req, res) => {
    try {
      const productId = req.query.productId;
      const imageIndex = req.query.imageIndex;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
  
      const product = await productModel.findById(productId);
      if (!product || imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(404).json({ error: "Invalid product or image index" });
      }

      product.images.splice(imageIndex, 1);

      await product.save();
  
      res.json({ success: true, message: "Image removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  


// Upload Image

const uploadImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Assuming array of images in product model
    const images = req.files.map((file) => file.filename);
    if (product.images.length + images.length > 10) {
      return res.json({
        success: true,
        message: "Maximum 10 images allowed",
        product: product,
      });
    }

    // Add the new filenames 
    product.images = product.images.concat(images);
    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: "Image(s) uploaded successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const productStatus = async (req, res) => {
  try {
      const { productId, action } = req.body;
      const is_block = action === 'block';

      await productModel.findByIdAndUpdate(productId, { is_block });
      res.json({ success: true });
  } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    updateProduct,
    removeImage,
    uploadImage,
    productStatus
}
