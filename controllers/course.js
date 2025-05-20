const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create course
exports.createCourse = async (req, res) => {
  try {
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      tag,
      instructions,
      status,
    } = req.body;

    const thumbnail = req.files.thumbnailImage;

    //data validation
    if (
      !courseName ||
      !courseDescription ||
      !thumbnail ||
      !price ||
      !whatYouWillLearn ||
      !category ||
      !tag ||
      !instructions ||
      status
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }

    //check instructor or not
    const role = req.user.role;
    if (role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a course",
      });
    }

    //check valid Category or not
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
    }

    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new course
    const course = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category: categoryExists._id,
      thumbnail: thumbnailImage.secure_url,
      instructor: req.user.id,
      tag,
      instructions,
      status,
    });

    //push course to instructor
    const instructor = await User.findById(req.user.id);
    instructor.courses.push(course._id);
    await instructor.save();

    //push course to category
    categoryExists.course.push(course._id);
    await categoryExists.save();

    //return response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

//get course by id
exports.getCourseDetails = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    //data validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide course id",
      });
    }

    //check course exists or not
    const course = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
      .populate("category")
      .populate("ratingAndReviews");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //return response
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "firstName, lastName, email")
      .populate("category", "name description")
      .populate("studentsEnrolled", "firstName, lastName, email");

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get top selling courses
exports.getTopSellingCourses = async (req, res) => {
  try {
    const topSoldCourses = await Course.aggregate([
      {
        $addFields: {
          totalStudentsEnrolled: { $size: "$studentsEnrolled" },
        },
      },
      { $sort: { totalStudentsEnrolled: -1 } },
      { $limit: 5 },

      // populate the instructor field by lookup
      {
        $lookup: {
          from: "user",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor",
        },
      },
      { $unwind: "$instructor" },

      // populate the category field by lookup
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      //project the required fields
      /*  {
        $pro ject: {
          title: 1,
          totalStudentsEnrolled: 1,
          "instructor.firstName": 1,
          "instructor.lastName": 1,
          "category.name": 1,
          price: 1,
          createdAt: 1,
        },
      }, */
    ]);
    if (!topSoldCourses || topSoldCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Top selling courses retrieved successfully",
      topSoldCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
