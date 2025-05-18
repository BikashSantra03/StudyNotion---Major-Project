const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { gender, contactNumber, dateOfBirth = "", about = "" } = req.body;
    const userId = req.user._id;

    //database validation
    if (!gender || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the necessary fields",
      });
    }

    //find the profileID
    const userDetails = await User.findById(userId);
    const profileID = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileID);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    //find the profileID
    const userDetails = await User.findById(userId).populate(
      "additionalDetails"
    );
    const profileID = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileID);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    //delete profile
    await Profile.findByIdAndDelete(profileID);

    //delete user
    await User.findByIdAndDelete({ _id: userId });

    //delete the user from the enrolled course

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//get all User Details
exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    //find the profileID
    const userDetails = await User.findById(userId).populate(
      "additionalDetails"
    );

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      userDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
