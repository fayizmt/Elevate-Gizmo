const User = require("../model/userModel");

const loginLoad = async (req, res) => {
    try {
     
      res.render("login");
     } catch (error) 
     {console.log(error.message);
      throw new Error(error);
    }
  };

module.exports={loginLoad}