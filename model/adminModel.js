const mongoose = require("mongoose");
const adminDetails = mongoose.connection.collection('adminDetails');
  module.exports = adminDetails
