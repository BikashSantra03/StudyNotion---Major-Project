const { Course, Section } = require("../models");

//create section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    //const {courseId} = req.params;

    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check instructor or not
    const role = req.user.role;
    if (role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a section",
      });
    }

    //check valid course or not
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //push section to course and return updated course with populated section and subsection
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSections",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//update section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;
    //const { sectionId } = req.params;

    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check instructor or not
    const role = req.user.role;
    if (role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update a section",
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

    //update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
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

//delete section
exports.deleteSection = async (req, res) => {
  try {
    // const { sectionId } = req.body;
    const { sectionId } = req.params;

    //data validation
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check instructor or not
    const role = req.user.role;
    if (role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete a section",
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

    //delete section
    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
