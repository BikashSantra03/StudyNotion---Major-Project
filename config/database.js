const mongoose = require("mongoose");
require("dotenv").config();
require("colors")


exports.dbConnect = async (req, res) => {
  try {
    const data = await mongoose.connect(process.env.MONGO_URL);

    if (data) console.log("MongoDB connection successfull".magenta);
  } catch (error) {
    console.log("DB Connection Issues");
    console.error(error);
  }
};
 