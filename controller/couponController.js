const couponModel = require('../model/couponModel')

const loadcoupon = async (req,res) => {
    try {
        res.render('coupon')
        
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
        
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const editCouponLoad = async (req,res) => {
    try {
        res.render('editcoupon')
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const updateCoupon = async (req,res) => {
    try {
    
        
    } catch (error) {
        console.log(error.message);
        
    }
}



module.exports = {
    loadcoupon,
    addCouponLoad,
    addCoupon,
    editCouponLoad,
    updateCoupon
}