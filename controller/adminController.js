const signupModel = require("../model/signupModel")
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const randomstring = require("randomstring")
const config = require("../config/config")




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

  const loadHome = async (req, res) => {
    try {
      let userData;
      if (req.session.user_id) {
        
        userData = await signupModel.findOne({ _id: req.session.user_id }); // Retrieve user by id
        
      }
      
  
      res.render("dashboard");
    } catch (error) {
      console.log(error.message);
    }
  };
  const adminLogout = async (req,res) => {
    try {
      req.session.destroy();
      res.redirect('/admin')
    } catch (error) {
      console.log(error.message);
    }
  }

  const loadUsers = (req,res) => {
    try {

      res.render('users')
      
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
  
module.exports = {
    loginLoad,
    verifyLogin,
    loadHome,
    adminLogout,
    loadUsers,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
  }