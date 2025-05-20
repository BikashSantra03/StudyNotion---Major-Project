const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//reset password token for Mail reset link
exports.resetPasswordToken = async (req, res, next) => {
  try {
    const { email } = req.body;

    //check email is provided or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email is not registered with us!",
      });
    }

    //generate TOKEN
    const Token = crypto.randomUUID();

    //Update the user with the token
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: Token,
      resetPasswordExpire: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    //Email reset link
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/update-password/${Token}`;
    // const resetUrl = `http://localhost:3000/update-password/${Token}`;

    const title = "Password Reset Link";
    const body = `Your password reset link is as follows: \n\n ${resetUrl} \n\n If you did not request this email, please ignore it. \n\n Thank you!`;

    //send email
    const mailResponse = await mailSender(email, title, body);
    if (!mailResponse) {
      return res.status(500).json({
        success: false,
        message: "Error sending email",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Password reset link has been sent to ${email}`,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

//reset password
exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword, confirmNewPassword, token } = req.body;

    //check token is provided or not
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is not provided",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "newPassword and confirmNewPassword do not match",
      });
    }

    //check token is valid or not
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, //gt means greater than
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};
