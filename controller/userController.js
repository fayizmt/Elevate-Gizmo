
const signupModel = require("../model/signupModel");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel");
const checkoutModel = require("../model/checkoutModel");
const cartModel = require("../model/cart");
const Review=require('../model/reviewModel');



// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authTocken =  process.env.TWILIO_AUTH_TOCKEN ;

// const twilioClient = new twilio(accountSid,authTocken)


  
  const loadContact = async (req,res) => {
    res.render('contact')
  }
  
  const loadAboutUs = async (req,res) => {
    res.render('about-us')
  }
  
  const loadHome = async (req, res) => {
    try {
        let userData;
        if (req.session.user_id) {
            userData = await signupModel.findOne({ _id: req.session.user_id }); 
        }

        const productList= await productModel.find({ is_block: false }).populate('category');

        const bannerList = await bannerModel.find();
        let cartCount = 0; 

        if (userData) {
            const cart = await cartModel.findOne({ userId: userData._id });
            if (cart) {
                cartCount = cart.products.length;
                console.log('Number of products in the cart:', cartCount);
            } else {
                console.log('Cart is empty or not found');
            }
        } else {
            console.log('User data not found');
        }

        res.render("home", {
            productList,
            bannerList,
            cartCount
        });
    } catch (error) {
        console.log(error.message);
    }
};

//order List 

  const loadOrder = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userData = await signupModel.findOne({
                _id: req.session.user_id,
            });
            const checkData = await checkoutModel.findOne({
                userId: userData._id,
            });
            if (checkData) {
                const data = checkData.orderDetails;
                // let proIds = [];
                // for (let i of data.product) {
                // const product = await productModel.findById(i.id);  
                // }
                res.render("orderList", { data });
            } else {
                res.render("orderList", { data: null });
            }
        } else {
            res.redirect("/login"); 
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); 
    }
};

const orderHistory = async (req, res) => {
  if (req.session.user_id) {
    const id = req.params.id;
    const user = await signupModel.findOne({ _id: req.session.user_id });
    const review = await Review.find({userId:req.session.user_id})
    const checkdata = await checkoutModel.findOne({ userId: user._id });
    const obj = checkdata.orderDetails.find((data) => data._id == id);
   
    // Find product

    let product = [];
    for (let i of obj.product) {
      let productDetailes = {};
      let data = await productModel.findById(i.id);
      productDetailes.name = data.productName;
      productDetailes.image = data.images[0];
      productDetailes.price = data.price;
      productDetailes.quantity = i.count;
      product.push(productDetailes);
      console.log(product);
    }

    // Date and Time  convertion

    const date = new Date(obj.createdAt);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const newdate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    res.render("orderHistory", { obj, newdate, product,review });
  }
};

const cancelOrder = async (req, res) => {
  if (req.session.user_id) {
    const orderId = req.params.id;
    const update = "cancelled";
    const user = await signupModel.findOne({ _id: req.session.user_id });

    // Find the checkout document with the matching user ID and order ID
    const checkData = await checkoutModel.findOneAndUpdate(
      { userId: user._id, "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": update, "orderDetails.$.product.$[].productStatus": update } },
      { new: true } 
    );

    console.log(checkData);

    if (checkData) {
      res.status(200).json({ message: "Order and product status updated successfully.", updatedOrder: checkData });
    } else {
      res.status(500).json({ message: "Error finding or updating order." });
    }
  } else {
    res.status(401).json({ message: "User not authenticated." });
  }
};

const loadShop = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const searchQuery = req.query.search;
    let productQuery = productModel.find();
    const category =await categoryModel.find();

    if (searchQuery) {
      productQuery = productQuery.where('productName').regex(new RegExp(searchQuery, 'i'));
    }
     // Apply category filter if selected
     if (req.query.category) {
      productQuery = productQuery.where('category').equals(req.query.category);
  }
  if (req.query.priceFilter) {
      if (req.query.priceFilter === 'high-to-low') {
          productQuery = productQuery.sort({ price: -1 });
      } else if (req.query.priceFilter === 'low-to-high') {
          productQuery = productQuery.sort({ price: 1 });
      }
  }
    const totalProducts = await productModel.countDocuments(productQuery);
    const perPage = 10; 
    const totalPages = Math.ceil(totalProducts / perPage);
    const currentPage = Math.min(req.query.page || 1, totalPages);
    const skipValue = Math.max((currentPage - 1) * perPage, 0);

    const product = await productQuery
      .skip(skipValue)
      .limit(perPage);
      let cartCount = 0; 

      if (user_id) {
          const cart = await cartModel.findOne({ userId: user_id });
          if (cart) {
              cartCount = cart.products.length;
              console.log('Number of products in the cart:', cartCount);
          } else {
              console.log('Cart is empty or not found');
          }
      } else {
          console.log('User data not found');
      }
    res.render('shop', { 
      product,
      category,
      totalPages,
      currentPage,
      cartCount
    });
  } catch (error) {
    console.error("Error loading shop:", error);
    res.status(500).send("Internal Server Error");
  }
};


const searchProduct = async (req, res) => {
  try {
    const productName = req.query.input.toLowerCase();
      console.log(productName);
      const matchingProducts = await productModel.find({
          productName: { $regex: productName, $options: 'i' }
      });
      console.log(matchingProducts.length)
      res.json({ suggestions: matchingProducts });

  } catch (error) {
    console.error("Error searching for products:", error);
    res.status(500).json({ message: "Error searching for products" });
  }
};


  const loadProductDetails = async (req,res) => {
    try {
      const userId = req.session.user_id
      const { id } = req.params;
    const productDetail = await productModel.findById(id).populate('category')
    const relatedProducts = await productModel.find()
    const reviewData = await Review.find({
    productId:id
    });
    let reviews = [];
    for (let i of reviewData) {
      const user = await signupModel.findOne({
        _id: i.userId
      });
      const username = user.name;
      let obj = { username: username, content: i.reviewText, starcount: i.rating };
      reviews.push(obj);
    }
    let cartCount = 0; 

        if (userId) {
            const cart = await cartModel.findOne({ userId: userId });
            if (cart) {
                cartCount = cart.products.length;
                console.log('Number of products in the cart:', cartCount);
            } else {
                console.log('Cart is empty or not found');
            }
        } else {
            console.log('User data not found');
        }
      res.render("product-detail",
        {
        productDetail,
        relatedProducts,
        cartCount,
        reviews,
        id
      })

    } catch (error) {
      console.log(error.message);
    }
  };

  
  
  

  
  
module.exports={
  loadAboutUs,
  loadContact,
  loadHome,
  loadOrder,
  orderHistory,
  cancelOrder,
  loadShop,
  searchProduct,
  loadProductDetails,
  
  }