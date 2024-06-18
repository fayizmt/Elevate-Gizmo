const Review=require('../model/reviewModel');
const productModel = require('../model/productModel');
const checkoutModel = require('../model/checkoutModel');



const addReview = async(req,res)=>{
    if (req.session.user_id) {
        console.log('Request Body:', req.body);

        const star = req.body.rating;
        const textcontent = req.body.reviewText;
        const proId = req.body.productId;
        console.log(proId, textcontent, star);
        const userId = req.session.user_id ;
        const checkdata = await checkoutModel.findOne({ userId: userId });
        let orderStatus;
        let productStatus;
    console.log("1");
        try {
          if (checkdata) {
    console.log("2");

            let proIdExists = false;
            checkdata.orderDetails.forEach((order) => {
              order.product.forEach((product) => {
                if (product.id.toString() === proId) {
    console.log("6");

                  orderStatus = order.orderStatus;
                  productStatus = product.productStatus
                  proIdExists = true;
                }
              });
            });
            if (proIdExists === false) {
              res
                .status(200)
                .json({ message: "pls purchase this product for post review" });
            } else {
              const findPreviewsReview = await Review.findOne({
                userId: userId,
                productId: proId,
              });
              if (findPreviewsReview) {
                res
                  .status(200)
                  .json({ message: "you already review this product" });
              } else {
               
                if (productStatus == "Delivered") {
    console.log("3");

                  const reviewCreate = new Review({
                    productId: proId,
                    userId: userId,
                    reviewText: textcontent,
                    rating: star,
                  });
                  await reviewCreate.save();
    console.log("4");

                  if (reviewCreate) {
                    res.status(200).json({ message: "created successfull" });
                  }
                } else {
                  res.status(200).json({
                    message: "you can review this product after deliverd",
                  });
                }
              }
            }
          } else {
    console.log("5");

            res
              .status(200)
              .json({ message: "pls purchase this product for post review" });
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        res.status(200).json({ message: "pls login" });
      }
        }
    
const editReviewGet = async(req,res)=>{
        try {
            const { productid,orderid} = req.query;
            const userId = req.session.user_id;
            const review = await Review.findOne({productId:productid,userId})
            console.log(productid,review)
            res.json({review,orderid,productid});

        } catch (error) {
            console.log(error);
        }
    }
const updateReview = async(req,res)=>{
        try {
            const userId = req.session.user_id;
            const productId = req.body.productId;
            const comment =req.body.reviewText;
            const orderId = req.body.orderId;
            console.log(req.body)
                const updatedReview = await Review.findOneAndUpdate(
                    { productId: productId, userId },
                    { $set: { comment: comment } },
                  );
 
              
              res.redirect(`/orderHistory?id=${orderId}`);
        } catch (error) {
            console.log(error);
        }
    }

module.exports={
    addReview,
    editReviewGet,
    updateReview
}