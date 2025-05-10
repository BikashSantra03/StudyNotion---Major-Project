const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },

  courseDescription: {
    type: String,
    required: true,
  },

  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  whatYouWillLearn: {
    type: String,
  },

  price: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
  },

  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],

  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
