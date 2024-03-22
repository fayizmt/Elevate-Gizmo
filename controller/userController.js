// const User = require("../model/userModel");
const signupModel = require("../model/signupModel");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel")
const otpGenerator = require('otp-generator');
const randomstring = require("randomstring")
const config = require("../config/config")
const twilio = require('twilio');
const otpVerify = require("../helpers/otpValidate");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer")


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authTocken =  process.env.TWILIO_AUTH_TOCKEN ;

const twilioClient = new twilio(accountSid,authTocken)

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
      html: `<p> Hii ${name}, please copy the link <a href="http://localhost:8083/forget-password?token=${token}"> reset your password </a>`
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


 const loadRegistration = async (req, res) => {
    try {
     
      res.render("registration");
     } catch (error) 
     {console.log(error.message);
      throw new Error(error);
    }
  };
  
  const insertUser = async (req,res)=>{
    try {

      const {name,email,mobile,password} = req.body;

      // Perform validation checks on user input
      if (!name || !email || !mobile || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Additional validation for email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Additional validation for mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number format.' });
    }

      const otp = otpGenerator.generate(4,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
      });
      console.log(`otp is ${otp}`);
      const currentDate = new Date();

      const hashedPassword = await bcrypt.hash(password, 10);

      const existUser = await signupModel.findOne({email:email})
      if(existUser){
        return res.status(400).json({ message: 'the email is already exist.' });
      }
      
      else{
        const user = new signupModel({
       
          name: name,
          email: email,
          mobile: mobile,
          // image: req.file.filename,
          password: hashedPassword,
          is_admin: 0,
          is_varified:0,
          otp: otp,
          otpExpiration: new Date(currentDate.getTime())
          });
    
        const userData = await user.save();
      console.log(userData);

      // await twilioClient.messages.create({
      //   body: `this is testing otp  ${otp}`,
      //   to: `+91 ${mobile}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });
      console.log('otp send to number');

      res.render('otpVerification')
      }
      
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const loadVerifyOtp = async (req,res)=>{
    try {
     
      res.render("otpverification");
     } catch (error) 
     {console.log(error.message);
      throw new Error(error);
    }
  }

  const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        const otpData = await signupModel.findOne({ otp: otp });

        if (!otpData) {
            console.log('Invalid OTP or mobile number');
            return res.status(400).json({ success: false, msg: 'Invalid OTP or mobile number' });
        }

        const isOtpExpired = await otpVerify(otpData.otpExpiration);

        if (isOtpExpired) {
            return res.status(400).json({ success: false, msg: 'Your OTP has expired' });
        }

       
        await signupModel.updateOne({ otp: otp }, { $unset: { otp: "", otpExpiration: "" } });

        res.redirect("/login");

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, msg: error.message });
    }
};

  const loginLoad = async (req, res) => {
    try {
     
      res.render("login");
     } catch (error) 
     {console.log(error.message);
      throw new Error(error);
    }
  };

  const verifyLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
  
      const userData = await signupModel.findOne({ email: email });
    
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          
            req.session.user_id = userData._id; // Store id in session
            
            res.redirect('/home');
          
        } else {
          res.render('login', { message: 'email or password is incorrect' });
        }
      } else {
        res.render('login', { message: 'email or password is incorrect' });
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  };
  
  const loadHome = async (req, res) => {
    try {
      let userData;
      if (req.session.user_id) {
        
        userData = await signupModel.findOne({ _id: req.session.user_id }); // Retrieve user by id
        
      }
      // console.log(req.session.user_id);
      const productList = await productModel.find({}).populate('category');
      const bannerList = await bannerModel.find({})
      res.render("home", { productList: productList,
      bannerList: bannerList });
    } catch (error) {
      console.log(error.message);
    }
  };

  const userLogout = async (req,res) => {
    try {

      req.session.destroy();
      res.redirect('/');
      
    } catch (error) {
      console.log(error.mrssage);
    }
  }
  
 const loadProductDetails = async (req,res) => {
    try {
      const { id } = req.params;
    const productDetail = await productModel.findById(id).populate('category')

      res.render("product-detail",{productDetail:productDetail})

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
          res.render("login", { message: "Please check your inbox" });
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
      console.log(updateData);
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  

  
  
module.exports={
  loginLoad,
  verifyLogin,
  loadRegistration,
  insertUser,
  loadVerifyOtp,
  verifyOtp,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  loadProductDetails,
  
  }