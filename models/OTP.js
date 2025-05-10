const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

const sendVerificationEmail = async (email, body) => {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email From StudyNotion",
      body
    );
    console.log("Email send successfully", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email!", email);
  }
};


//pre middleware -> before saving entry to db sending a email
OTPSchema.pre("save", async (next) => {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
