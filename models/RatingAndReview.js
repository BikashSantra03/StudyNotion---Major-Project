const mongoose = require("mongoose");

const ratingAndRevieweSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ratng: {
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
