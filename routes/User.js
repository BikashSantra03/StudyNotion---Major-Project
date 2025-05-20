const express = require("express");
const router = express.Router();

// Importing controllers
const {
  login,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/auth");
const {
  resetPasswordToken,
  updatePassword,
} = require("../controllers/resetPassword");

// Importing middlewares
const { auth } = require("../middlewares/auth");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

router.post("/login", login);
router.post("/signup", signUp);
router.post("/send-otp", sendOTP);

router.post("./change-password", auth, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token (reset password via new page through email)
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", updatePassword);

module.exports = router;
