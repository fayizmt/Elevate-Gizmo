
const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next(); // Proceed to the next middleware or route handler
        } else {
            res.redirect('/admin'); // Redirect to the login page if the user is not logged in
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/admin/dashboard'); // Redirect to the home page if the user is logged in
        } else {
            next(); // Proceed to the next middleware or route handler
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};
