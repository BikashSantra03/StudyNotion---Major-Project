const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const cloudinary = require("../utils/cloudinary");

//create subsection
exports.createSubsection = async (req, res) => {
  try {
    const { title, timeDuration, description } = req.body;
    const { sectionId } = req.params;
    const video = req.files.videoFile;

    //data validation
    if (!title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check valid section or not
    const sectionExists = await Section.findById(sectionId);
    if (!sectionExists) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await cloudinary.uploader.upload(
      video,
      process.env.CLOUDINARY_VIDEO_FOLDER
    );

    //create subsection
    const newSubsection = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
    });

    //push subsection to section and return updated section with populated subsection
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSections: newSubsection._id },
      },
      { new: true }
    ).populate("subSections");

    //return response
    return res.status(201).json({
      success: true,
      message: "Subsection created successfully",
      updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//update subsection
exports.updateSubsection = async (req, res) => {
  try {
    const { title, timeDuration, description } = req.body;
    const { subsectionId } = req.params;
    const video = req.files.videoFile;

    //data validation
    if (!title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check valid subsection or not
    const subsectionExists = await SubSection.findById(subsectionId);
    if (!subsectionExists) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await cloudinary.uploader.upload(
      video,
      process.env.CLOUDINARY_VIDEO_FOLDER
    );

    //update subsection
    const updatedSubsection = await SubSection.findByIdAndUpdate(
      subsectionId,
      {
        title,
        timeDuration,
        description,
        videoUrl: uploadDetails.secure_url,
      },
      { new: true }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
      updatedSubsection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//delete subsection
exports.deleteSubsection = async (req, res) => {
  try {
    const { subsectionId } = req.params;

    //data validation
    if (!subsectionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check valid subsection or not
    const subsectionExists = await SubSection.findById(subsectionId);
    if (!subsectionExists) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    //delete subsection
    await SubSection.findByIdAndDelete(subsectionId);

    //return response
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
