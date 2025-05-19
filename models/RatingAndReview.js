const mongoose = require("mongoose");

const ratingAndRevieweSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },

  rating: {
    type: String,
    required: true,
  },
  review: {
    type: Number,
    trim: true,
    required: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndRevieweSchema);
