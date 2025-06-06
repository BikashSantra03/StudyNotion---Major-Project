const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },

  courseDescription: {
    type: String,
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  whatYouWillLearn: {
    type: String,
  },

  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],

  price: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
  },

  tag: {
    type: [String],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  status: {
    type: String,
    enum: ["Draft", "Published"],
  },

  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
