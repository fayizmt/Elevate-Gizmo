

const loadOrder = async (req,res) => {
    try {
        
        res.render('order')
    } catch (error) {
        console.log(error.message);
    }
}

const loadShowOrder = async (req,res) => {
    try {
        
        res.render('showorder')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadOrder,
    loadShowOrder
}