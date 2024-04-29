const couponModel = require('../model/couponModel');
const Cart = require('../model/cart');

const loadcoupon = async (req,res) => {
    try {
        const coupon = await couponModel.find({})
        res.render('coupon',{coupon:coupon})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addCouponLoad = async (req,res) => {
    try {
        res.render('addcoupon')
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addCoupon = async (req,res) => {
    try {
        const {name,
            couponCode,
            discountPercentage,
            maxDiscountAmount,
            activationDate,
            expiryDate,
            criteriaAmount,
            usedUsers }=req.body

        const couponData = await couponModel.create({
            name:name,
            couponCode:couponCode,
            discountPercentage:discountPercentage,
            maxDiscountAmount:maxDiscountAmount,
            activationDate:activationDate,
            expiryDate:expiryDate,
            criteriaAmount:criteriaAmount,

        })
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const editCouponLoad = async (req,res) => {
    try {
        const id = req.query.id;
        console.log(id);
        const coupon = await couponModel.findOne({_id:id});
        res.render('editcoupon',{coupon:coupon})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const updateCoupon = async (req,res) => {
    try {
        const id = req.body.id
        if (id) {
          const couponData = await couponModel.findByIdAndUpdate(
            { _id: req.body.id },
            {
              $set: {
            name:req.body.name,
            couponCode:req.body.couponCode,
            discountPercentage:req.body.discountPercentage,
            maxDiscountAmount:req.body.maxDiscountAmount,
            activationDate:req.body.activationDate,
            expiryDate:req.body.expiryDate,
            criteriaAmount:req.body.criteriaAmount,
              },
            }
          );
          console.log(couponData);
          res.redirect("/admin/coupon");
          }
          
      } catch (error) {
        console.log(error.message);
        throw new Error(error);
      }
    }
 

  const removeCoupon = async (req, res) => {
    try {
        const couponId = req.query.id;
        console.log(couponId);
        // Assuming you have a Coupon model defined using Mongoose
        const deleteCoupon = await couponDb.deleteOne({ _id: couponId });

        if (!couponData) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, message: 'Coupon removed successfully', data: couponData });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



module.exports = {
    loadcoupon,
    addCouponLoad,
    addCoupon,
    editCouponLoad,
    updateCoupon,
    removeCoupon
}