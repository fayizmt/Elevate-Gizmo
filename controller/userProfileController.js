const signupModel = require("../model/signupModel");
const profile = require("../model/userProfile");


// get user profile
const loadProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const userData = await signupModel.findOne({ _id: id });
      if (!userData) {
        res.redirect("/login");
        return;
      }
      const proData = await profile.findOne({id:id})
      console.log("h1",proData);
      res.render("profile", {userData,proData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// edit or complete profile get page
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




// // using multer for file upload
// const multer1 = upload.upload2.single("image");

// create or update profile data
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

      let image = ""; // Initialize image variable

      if (req.file) {
        // Assuming the file is uploaded and saved correctly
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
