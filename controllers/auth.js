const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");

require("dotenv").config();

// handler functions--------------------------------------------------------------------------------------------------
async function hashThePassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error("Error while Encrypting Password:", error);
    // It's better to throw the error here so the calling function can handle the response.
    throw new Error("Error while encrypting password");
  }
}
//-----------------------------------------------------------------------------------------------------------------------


// Controllers starts ⬇️⬇️⬇️⬇️--------------------------------------------------------------------------------------

// Send OTP while signUp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    //check new user or not
    const isOldUser = await User.findOne({ email });

    if (isOldUser) {
      return res.status(401).json({
        success: false,
        message: "You are already a registered user. Please do Login",
      });
    }

    //generate OTP
    var generatedOTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    //check OTP already exists in the DB or not
    let result = await OTP.findOne({ Otp: generatedOTP });

    while (result) {
      //create new OTP
      generatedOTP = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ Otp: generatedOTP });
    }

    //create unique OTP entry in the DB
    const otpPayload = { email, generatedOTP };

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sign Up
exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    //data validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are reqired!",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword value does not match! Please try again",
      });
    }
    //check new user or not
    const isOldUser = await User.findOne({ email });

    if (isOldUser) {
      return res.status(401).json({
        success: false,
        message: "You are already a registered user. Please do Login",
      });
    }

    //find most recent OTP document for the user
    const latestOTPDocument = await OTP.find(email)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    console.log(latestOTPDocument);

    //validate OTP
    if (latestOTPDocument.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found!",
      });
    } else if (otp !== latestOTPDocument.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    //hash the password
    const hashedPassword = hashThePassword(password);

    //Create User entry in DB
    const profileDetails = await Profile.create({
      gender: null,
      DateOfBirth: null,
      contactNumber: null,
      about: null,
    });

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=128&background=0D8ABC&color=fff&rounded=true`,
    });
    return res.status(200).json({
      success: true,
      message: "User registered Succesfully",
    });
  } catch (error) {
    return res.status(400).jspn({
      success: false,
      message: "User Can not be registered! Please try again",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate Data
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "PLease fill all the details carefully",
      });
    }

    //check Existing User or not
    let existingUser = await User.findOne({ email }).populate(
      "additionalDetails"
    );

    if (!existingUser) {
      return res.status(401).send({
        success: false,
        message: "User is not registered",
      });
    }

    //generate JWT token after password is matched

    if (await bcrypt.compare(password, existingUser.password)) {
      //generate JWT token
      const payload = {
        email: existingUser.email,
        id: existingUser._id,
        role: existingUser.accountType,
      };

      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      //add token with user object
      existingUser.token = token;
      existingUser.password = undefined;

      //send response with JWT in cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("Token", token, options).status(200).send({
        success: true,
        token,
        existingUser,
        message: "User Logged in successfully",
      });
    } else {
      //passwsord does not match
      return res.status(403).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Login failed! Please try again later!",
    });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword, email } = req.body;

  if (!oldPassword || !newPassword || !confirmNewPassword || !email) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "newPassword and confirmNewPassword do not match",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        // User not found
        success: false,
        message: "User not found!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        // Unauthorized - incorrect old password
        success: false,
        message: "Incorrect old password!",
      });
    }

    // Hash the new password
    const hashedPassword = await hashThePassword(newPassword);

    // Update the user's password using the user's _id
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating the password, please try again later!",
      error: error.message,
    });
  }
};
