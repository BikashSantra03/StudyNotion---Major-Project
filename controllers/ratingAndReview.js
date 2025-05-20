const mongoose = require("mongoose");
const Course = require("../models/Course");
const ratingAndReviews = require("../models/ratingAndReview");

const User = require("../models/User");

//create rating and review
exports.createRating = async (req, res) => {
  try {
    const { rating, review, courseId } = req.body;
    const userId = req.user.id;

    //data validation
    if (!rating || !review || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //check user enrolled in course or not
    const enrolledUser = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!enrolledUser) {
      return res.status(400).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }
    //check if user already rated the course
    const alreadyRated = await ratingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyRated) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this course",
      });
    }

    //create an entry for new rating and review
    const ratingAndReview = await ratingAndReviews.create({
      rating,
      review,
      user: userId,
      course: courseId,
    });

    //push the rating and review to the course
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { ratingAndReviews: ratingAndReview._id },
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Rating and Review created successfully",
      data: ratingAndReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get average rating of a course
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    //data validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide course id",
      });
    }

    // Aggregate to calculate average rating
    const ratingAggregation = await ratingAndReviews.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (ratingAggregation.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average Rating fetched",
        data: {
          courseId,
          averageRating: ratingAggregation[0]?.averageRating?.toFixed(2) || 0,
          totalRatings: ratingAggregation[0]?.totalRatings || 0,
        },
      });
    }

    /* 
        const ratingsAndReviews = await ratingAndReviews.find({
          course: courseId,
        });
        const averageRating =
          ratingsAndReviews.reduce((acc, curr) => acc + curr.rating, 0) /
          ratingsAndReviews.length;
        */
  } catch (error) {
    console.error("Error calculating average ratings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while calculating average ratings",
      error: error.message,
    });
  }
};

//get all Ratings
exports.getAllRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    const allRatingsAndReview = await ratingAndReviews
      .find({ course: courseId })
      .sort({ rating: "desc" })
      .populate("user", "firstName lastName email image")
      .populate("course", "courseName");

    return res.status(200).json({
      success: true,
      message: "All rating and reviews are fetched for a course",
      data: allRatingsAndReview,
    });
  } catch (error) {}
};
