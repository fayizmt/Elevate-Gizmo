const bannerModel = require('../model/bannerModel') 

const loadBanner = async (req,res) => {
    try {
        const bannerList = await bannerModel.find({})
        res.render('banner',{bannerList:bannerList})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addBannerLoad = async (req,res) => {
    try {
        res.render('addbanner')
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addBanner = async (req, res) => {
    try {
        const { bannerName, description } = req.body;
        const image = req.file.filename ;

        // Check if required fields are provided
        if (!bannerName || !description || !image) {
            return res.status(400).send('Please provide bannerName, description, and image.');
        }

        const newBanner = new bannerModel({
            bannerName: bannerName,
            description: description,
            image: image,
        });

        const bannerData = await newBanner.save();

        if (bannerData) {
            return res.redirect('/admin/banner');
        } else {
            return res.status(500).render('addbanner', { message: 'Something went wrong.' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
}


const editBannerLoad = async (req,res) => {
    try {
        const id = req.query.id;
        const bannerData = await bannerModel.findOne({_id : id})
        console.log(bannerData);
        res.render('editbanner',{bannerData:bannerData})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const updateBanner = async (req,res) => {
    try {
        if (req.file) {
          const bannerData = await bannerModel.findByIdAndUpdate(
            { _id: req.body.id },
            {
              $set: {
                bannerName: req.body.bannerName,
                description: req.body.description,
                image: req.file.filename,
                // is_block: req.body.is_block,
              },
            }
          );
          res.redirect("/admin/banner");
          }
          else {
            const bannerData = await bannerModel.findByIdAndUpdate(
              { _id: req.body.id },
              {
                $set: {
                  bannerName: req.body.bannerName,
                  description: req.body.description,
                  image: req.file.filename
                  // is_block: req.body.is_block,
                },
              }
            );
          
            res.redirect("/admin/banner");
          }
      } catch (error) {
        console.log(error.message);
        throw new Error(error);
      }
    }



module.exports = {
    loadBanner,
    addBannerLoad,
    addBanner,
    editBannerLoad,
    updateBanner
}