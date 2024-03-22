const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_varified: {
    type: Number,
    default: 1,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiration: {
    type: Date,
    default: Date.now,
    get: function(otpExpiration) {
      return otpExpiration.getTime();
    },
    set: function(otpExpiration) {
      return new Date(otpExpiration);
    }
  },
  token: {
    type: String,
    default: '',
  }
});



module.exports = mongoose.model('signupdetails', signupSchema);
