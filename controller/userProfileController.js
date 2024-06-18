const signupModel = require("../model/signupModel");
const profile = require("../model/userProfile");

const loadProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const userData = await signupModel.findOne({ _id: userId });
      if (!userData) {
        res.redirect("/login");
        return;
      }
      const proData = await profile.findOne({ id: userId }); 
      // console.log("h1", proData);
      res.render("profile", { userData, proData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const completeProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const userData = await signupModel.findOne({ _id: id });
      if (!userData) {
        res.redirect("/login");
        return;
      }
      const proData = await profile.findOne({id:id})
        res.render("editprofile", { userData ,proData});
      
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const updateProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const userData = await signupModel.findOne({ _id: id });
      if (!userData) {
        res.redirect("/login");
        return;
      }

      const {
        name,
        email,
        mobile,
        dob,
        houseName,
        streetName,
        post,
        pincode,
        district,
        state,
      } = req.body;

      let image = ""; 

      if (req.file) {
      
        image = req.file.filename;
      }

      const profileData = await profile.findOneAndUpdate(
        { id: id },
        {
          $set: {
            name,
            email,
            mobile,
            image,
            dob,
            houseName,
            streetName,
            post,
            pincode,
            district,
            state,
          },
        },
        { upsert: true, new: true }
      );
console.log(profileData);
      if (profileData) {
        res.redirect("profile");
      } else {
        console.log("Profile data not found");
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  loadProfile,
  completeProfile,
  updateProfile,
};