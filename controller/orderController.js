const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId
const userDb = require("../model/signupModel");
const cartDb = require("../model/cart");
const productDb = require("../model/productModel");
const couponDb = require("../model/couponModel");
const checkoutDb = require("../model/checkoutModel");
const Razorpay = require("razorpay");


//Razorpay
const razorId = process.env.RAZORPAY_ID_KEY;
const razorSecret = process.env.RAZORPAY_SECRET_KEY;
const instance = new Razorpay({
  key_id: razorId,
  key_secret: razorSecret,
});


const loadCheckout = async (req, res) => {
 
    try {
        const userId = req.session.user_id;
        const userData = await userDb.findById(userId);
        
        const cartData = await cartDb.findOne({ userId }).populate("products.productId");
        
        let cartTotal = 0;
        let total = 0;
        let couponDiscount = 0;

        if (cartData && cartData.products.length > 0) {
            const totalWithoutDiscount = await cartDb.aggregate([
                { $match: { userId: new ObjectId(userId) } },
                { $unwind: "$products" },
                { $project: { price: "$products.price", quantity: "$products.quantity" } },
                { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$price"] } } } }
            ]);

            if (totalWithoutDiscount.length > 0) {
                cartTotal = totalWithoutDiscount[0].total;

                const couponData = await couponDb.findOne({ "usedUsers": userId });

                if (couponData) {
                    couponDiscount = couponData.maxDiscountAmount;
                    total = cartTotal - couponDiscount;
                } else {
                    total = cartTotal;
                }
            }
        }

        res.render('checkout', {
            cartTotal,
            total,
            couponDiscount,
            cart: cartData
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { name,mobile,email, houseName, streetName, pincode, district,city, state, payment_option } = req.body;

        const user = await userDb.findOne({ _id: userId });
        const cartData = await cartDb.findOne({ userId }).populate("products.productId");

        if (cartData) {
            let total = 0;
            let proIds = [];

            cartData.products.forEach((data) => {
                let obj = {
                    id: data.productId._id,
                    price: data.productId.price,
                    color: data.productId.color,
                    count: data.quantity,
                    productStatus:"Placed"
                };
                proIds.push(obj);
                total += data.productId.price * data.quantity;
            });

            total = total < 1000 ? total + 50 : total;

            const orderDetails = {
                product: proIds,
                houseName,
                streetName,
                pincode,
                city,
                district,
                state,
                name,
                mobile,
                email,
                paymentOption: payment_option,
                totalAmount: total,
                orderStatus:"Placed",
            };
            
            const savedOrder = await checkoutDb.findOneAndUpdate(
                { userId },
                { $push: { orderDetails } },
                { upsert: true, new: true }
            );
            
            if (savedOrder) {
                if (payment_option == "cashOnDelivery") {
                    for (let i of proIds) {
                       await productDb.findOneAndUpdate(
                            { _id: i.id },
                            { $inc: { quantity: -i.count } },
                            { new: true }
                        );
                    }
                    
                    res.redirect("/orderComplete/hai");
                    
                } else {
                    res.redirect("/payment");
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const removeCoupon = async(req,res)=>{
  try {
    const userId=req.session.user_id;
    const cartData=await cartDb.findOne({userId:userId})
    console.log(cartData,'halohlaohlao');
    await couponDb.findOneAndUpdate({_id:cartData.couponDiscount},{$pull:{usedUsers:userId}})
    await cartDb.findOneAndUpdate({userId:userId},{$set:{couponDiscount:0}})
    res.json({remove:true})
  } catch (error) {
    console.log(error.message);
      res.render('500Error')
  }
};

const loadPayment = async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.render("login");
    }

    const user = await userDb.findOne({ _id: req.session.user_id });
    if (!user) {
      
      return res.render("login");
    }

    const checkoutData = await checkoutDb.findOne({ userId: user._id });
    if (!checkoutData || !checkoutData.orderDetails.length) {
      
      return res.render("error", { message: "Checkout data not found." });
    }

    const latestOrder = checkoutData.orderDetails[checkoutData.orderDetails.length - 1];
    const amount = latestOrder.totalAmount;

    res.render("payment", { amount });
  } catch (error) {
   
    console.error("Error loading payment:", error);
    res.render("error", { message: "An error occurred while loading payment." });
  }
};

  // razorpay peyment 
  const paymentComplete = async (req, res) => {
    try {
        
        if (!req.session.user_id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userData = await userDb.findOne({ _id: req.session.user_id });
        const checkoutData = await checkoutDb.findOne({ userId: userData._id });

        // Check if checkout data and order details are valid
        if (!checkoutData || !checkoutData.orderDetails || checkoutData.orderDetails.length === 0) {
            return res.status(400).json({ error: "Invalid checkout data" });
        }

        // Get the latest order details
        const orderDetailsArray = Array.isArray(checkoutData.orderDetails)
            ? checkoutData.orderDetails
            : [checkoutData.orderDetails];
        const latestOrder = orderDetailsArray[orderDetailsArray.length - 1];
        const { totalAmount } = latestOrder;

        // Prepare data for creating a Razorpay order
        const amount = totalAmount * 100; 
        const currency = "INR";
        const receipt = userData.email;

        const data = {
            key: razorId,
            contact: userData.mobile,
            name: userData.name,
            email: userData.email,
        };

        
        const order = await instance.orders.create({ amount, currency, receipt });

       
        res.json({ order, data });
    } catch (err) {
        console.error("Error in paymentComplete:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const orderComplete = async (req, res) => {
  // console.log("hkjhgdsfkjgsdl");
  if (req.session.user_id) {
    const method = req.params.data;
    const userData = await userDb.findOne({
      _id: req.session.user_id,
    });
    // console.log("dfjhksjhksjh2");
    const checkData = await checkoutDb.findOne({
      userId: userData._id,
    });
    let proIds = [];

    const cartData = await cartDb.findOne({ userId: userData._id }).populate("products.productId");
    // console.log("dfjhksjhksjh3");
    if (cartData && cartData.products) {
      cartData.products.forEach((data) => {
        let obj = {
          id: data.id._id,
          price: data.id.price,
          // color: data.id.color,
          quantity: data.quantity,
        };
        console.log("dfjhksjhksjh0");
        proIds.push(obj);
      });
    }
    
    if (checkData && checkData.orderDetails && checkData.orderDetails.length > 0) {
      // console.log("dfjhksjhksjh4");
      const lastOrder = checkData.orderDetails.length - 1;
      const lastorderObj = checkData.orderDetails[lastOrder];
      const deleteCart = await cartDb.findOneAndDelete({
        userId: userData._id,
      });
      console.log(deleteCart);
      if (method == "upi") {
        const val = "Success";
        for (let i of proIds) {
          const update = await productDb.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(i.id) },
            { $inc: { quantity: -i.quantity } },
            { new: true }
          );
        }
        const updateObj = await checkoutDb.findOneAndUpdate(
          { userId: userData._id },
          { $set: { [`orderDetailes.${lastOrder}.paymentStatus`]: val } },
          { new: true }
        );
        console.log(updateObj);
      }
    }
    
    res.render("orderComplete");
  }
};


  

module.exports = {
    loadCheckout,
    placeOrder,
    loadPayment,
    paymentComplete,
    orderComplete,
    removeCoupon
};
