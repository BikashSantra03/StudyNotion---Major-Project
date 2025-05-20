const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { gender, contactNumber, dateOfBirth = "", about = "" } = req.body;
    const userId = req.user.id;

    //database validation
    if (!gender || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the necessary fields",
      });
    }

    //find the profileID
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
    const userId = req.user.id;

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

    //delete all the courses enrolled by the user
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { enrolledStudents: userId } },
        { new: true }
      );
    }

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
    const userId = req.user.id;

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

//update display picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const displayPicture = req.files.displayPicture;

    const userDetails = await User.findById(userId);

    // Check if the user exists
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Check if the file is provided
    if (!displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    // Check if the file is an image
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = displayPicture.name.split(".")[1].toLowerCase();
    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported",
      });
    }

    //upload to cloudinary
    const response = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log("Cloudinary upload successful".magenta);
    // Save the image URL to the user's profile
    userDetails.image = response.secure_url;
    await userDetails.save();
    // Return the updated user details
    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully",
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
