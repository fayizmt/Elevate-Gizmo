const signupModel = require("../model/signupModel");
const checkoutModel = require("../model/checkoutModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel")
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const randomstring = require("randomstring")
const config = require("../config/config");




const securePassword = async(password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}


// For send reset password mail
const sendResetPassword = async (name, email, token) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "for reset password",
      html: `<p> Hii ${name}, please copy the link <a href="http://localhost:8083/admin/forget-password?token=${token}"> reset your password </a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Mail has been sent', info.response);
      }
    });

  } catch (error) {
    console.log(error.message);
  }
};


const loginLoad = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async (req,res) => {
  try {
      const { email, password } = req.body;
      const userData = await signupModel.findOne({ email: email });
      console.log(userData);
      if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (passwordMatch) {
              if (userData.is_admin === 1) {
                 req.session.user_id = userData._id;
                  // Redirect to admin dashboard
                  return res.redirect('/admin/dashboard');
              } else {
               
                return res.redirect('/admin');
              }
          } else {
              // Incorrect password
              return res.redirect('/admin');
          }
      } else {
          // User not found
        
        userData = await signupModel.findOne({ _id: req.session.user_id });
      res.render('dashboard')
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadDashboard = async (req, res) => {
     try {
      const ordercount = await checkoutModel.countDocuments();
      const productcount = await productModel.countDocuments();
      const categorycount = await categoryModel.countDocuments();
      const order = await checkoutModel.find().populate('userId');
      const orderDetails = await checkoutModel.find()


      const totalrevenue = await checkoutModel.aggregate([
        {
          $unwind: '$orderDetails' // Unwind the orderDetails array
        },
          {
              $match: {
                  'orderDetails.product.productStatus': 'Delivered' 
              }
          },
          {
              $group: {
                  _id: null,
                  totalrevenue: { $sum: "$orderDetails.totalAmount" }
              }
          }
      ]);

      const totalRevenueNumber = totalrevenue.map(result => result.totalrevenue)[0] || 0;

      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

      const monthlyRevenue = await checkoutModel.aggregate([
        {
          $unwind: '$orderDetails' 
        },
        {
          $match: {
            'orderDetails.product.productStatus': 'Delivered', 
            'orderDetails.createdAt': { 
              $gte: startOfMonth,
              $lt: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: '$orderDetails.totalAmount' } 
          }
        }
      ]);
      
      
      const monthlyRevenueNumber = monthlyRevenue.map(result => result.monthlyRevenue)[0] || 0;
      console.log(ordercount,"1", productcount,"2", categorycount,"3", totalRevenueNumber,"4", monthlyRevenueNumber,"5", order,"hasjkdfhaksjlf");
      console.log(totalRevenueNumber,monthlyRevenueNumber);
      
      res.render('dashboard', { ordercount, productcount, categorycount, totalRevenueNumber, monthlyRevenueNumber, order,orderDetails })
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadOrder = async (req, res) => {
    try {

      if(req.session.user_id){
        const orders = await checkoutModel.find()
        // let checkData = [];
        // for (let i of orders) {
        //   let userId = i.userId;
        //   for (let j of i.orderDetails) {
        //     const obj = { userId: userId, orders: j };
        //     checkData.push(obj);
        //   }
        // }
        if(orders){
          res.render("order",{orders});
        }else{
          res.render("order",{orders});
        }
        }else{
          res.render('login')
        }
          } catch (error) {
            console.log(error.message);
          }
          
        };

        const loadShowOrder = async (req, res) => {
          try {
            const orderId = req.query.id;
            console.log(orderId);
            const orderDetails = await checkoutModel.findOne(
              { 'orderDetails._id': orderId },
              { 'orderDetails.$': 1 }
            );
            
            const order = orderDetails.orderDetails[0]; // Assuming there's only one order detail
            const productIds = order.product.map(product => product.id);
        
            const productDetails = await productModel.find({ _id: { $in: productIds } });
            
            console.log(productDetails); // Check if productDetails contains the correct data
            
            res.render('showorder', { order, productDetails });
          } catch (error) {
            console.log(error.message);
          }
        };
        
        const updateProductStatus = async (req, res) => {
          try {
              const productId = req.body.productId;
              const productStatus = req.body.newStatus;
      
              const updateOrder = await checkoutModel.updateMany(
                  { 'orderDetails.product.id': productId }, 
                  {
                      $set: {
                          'orderDetails.$[orderElem].product.$[productElem].productStatus': productStatus,
                          'orderDetails.$[orderElem].orderStatus': productStatus,
                      }
                  },
                  {
                      arrayFilters: [{ 'orderElem.product.id': productId }, { 'productElem.id': productId }]
                  }
              );
      
              console.log(productId);
              console.log(updateOrder, "uporder", productStatus);
      
              if (updateOrder) {
                  res.json({ success: true, updateOrder });
              } else {
                  res.status(404).json({ success: false, message: "Product not found" });
              }
          } catch (error) {
              console.log(error);
              res.status(500).json({ success: false, message: "Internal server error" });
          }
      };
      
      
      
  const loadUsers = async (req,res) => {
    try {
      const users = await signupModel.find()
      res.render('users',{users})
      
    } catch (error) {
      console.log(error.message);
    }
  };

  const forgetLoad = async (req, res) => {
    try {

      res.render('forget')
      
    } catch (error) {
      console.log(error.message);
    }
    
  };
  
  const forgetVerify = async (req, res) => {
    try {
      const email = req.body.email;
      const userData = await signupModel.findOne({ email: email });
  
      if (userData) {
        if (userData.is_verified === 0) {
          res.render("forget", { message: "Please verify your email" });
        } else {
          const randomString = randomstring.generate();
          const updateData = await signupModel.updateOne(
            { email: email },
            { $set: { token: randomString } }
          );
          sendResetPassword(userData.name, userData.email, randomString);
          res.render("forget", { message: "Please check your inbox" });
        }
      } else {
        res.render("forget", { message: "Email is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const forgetPasswordLoad = async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await signupModel.findOne({ token: token });
      if (tokenData) {
        res.render("forget-password", { user_id: tokenData._id });
      } else {
        res.render("404", { message: "Token is invalid" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const password = req.body.password;
      const user_id = req.body.user_id;

      const hashedPassword = await securePassword(password);
      const updateData = await signupModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { password: hashedPassword, token: "" } }
      );

      res.redirect("/admin");
    } catch (error) {
      console.log(error.message);
    }
  };
  // Admin logout
  const adminLogout = async (req,res) => {
    try {
      req.session.destroy();
      res.redirect('/admin')
    } catch (error) {
      console.log(error.message);
    }
  }
  
module.exports = {
    loginLoad,
    verifyLogin,
    loadDashboard,
    adminLogout,
    loadUsers,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    loadOrder,
    loadShowOrder,
    updateProductStatus
  }