require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"].replace("Bearer ", "") ||
      req.cookies.Token ||
      req.body.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! No token provided",
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//isStudent middleware
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You are not a student",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//isInstructor middleware
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You are not an instructor",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
