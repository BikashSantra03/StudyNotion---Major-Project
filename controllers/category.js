const Category = require("../models/Category");
const Course = require("../models/Course");
const { getTopSellingCourses } = require("./course");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    //create entry in the database
    const category = new Category({
      name,
      description,
    });

    await category.save();
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all Categorys
exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
    if (!allCategorys) {
      return res.status(404).json({ message: "No Categorys found" });
    }
    return res.status(200).json({ success: true, allCategorys });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;

    //get courses for the specific category
    const selectedCategory = await Category.findById(categoryId).populate(
      "course"
    );
    if (!selectedCategory) {
      return res.status(404).json({ message: "No Category found" });
    }

    //get courses for diffrent categories

    const diffrentCategories = await Category.find({
      _id: { $ne: categoryId },
    }).populate("course");

    if (!diffrentCategories) {
      return res.status(404).json({ message: "No Category found" });
    }

    //get top selling courses of a specific category
    const topSellingCoursesOfaCategory = await Course.aggregate([
      { $match: { category: categoryId } },
      { $addFields: { enrolledCount: { $size: "$studentsEnrolled" } } },
      { $sort: { enrolledCount: -1 } },
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

      // project the fields
      /*
      {
        $project: {
          _id: 1,
          courseName: 1,
          courseDescription: 1,
          price: 1,
          thumbnail: 1,
          tag: 1,
          instructorName: {
            $concat: ["$instructor.firstName", " ", "$instructor.lastName"],
          },
          categoryName: "$category.name",
        },
      },
  
    */
    ]);

    return res.status(200).json({
      success: true,
      selectedCategory,
      diffrentCategories,
      topSellingCoursesOfaCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
