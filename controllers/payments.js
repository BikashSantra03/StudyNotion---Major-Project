const { instance } = require("../config/razorpayConfig");
const Course = require("../models/Course");
const User = require("../models/User");

const mailSender = require("../utils/mailSender");
const { courseEnrollmentMail } = require("../utils/mailTemplates");

const crypto = require("crypto");

//Capture payment and initiate Razorpay order
exports.capturePayments = async (req, res) => {
  try {
    //get UserId and courseId
    const { courseId } = req.body;
    const userId = req.user._id;

    //validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide courseId",
      });
    }

    //check course exists or not
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //check user already enrolled in the course or not
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    //create order
    const options = {
      amount: course.price * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_" + Math.random().toString(36).substring(7),
      notes: {
        courseId: course._id,
        userId: userId,
      },
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      console.log("Payment response:", paymentResponse);
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//verify Signature from razorpay webHook and server
exports.verifySignature = async (req, res) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`)
      .digest("hex");

    if (razorpaySignature === generatedSignature) {
      // Signature is valid, proceed with the payment
      const { courseId, userId } = req.body.payload.payment.entity.notes;

      try {
        //find the course and add user to the course
        const enrolledCourse = await Course.findByIdAndUpdate(
          { _id: courseId },
          {
            $push: {
              studentsEnrolled: userId,
            },
          },
          { new: true }
        );
        if (!enrolledCourse) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        //find the user and add course to the user
        const enrolledUser = await User.findByIdAndUpdate(
          { _id: userId },
          {
            $push: {
              coursesEnrolled: courseId,
            },
          },
          { new: true }
        );
        if (!enrolledUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        //send mail to user
        const mailResponse = await mailSender(
          enrolledUser.email,
          "Course Enrollment",
          courseEnrollmentMail(enrolledCourse.courseName, enrolledUser.name)
        );
        return res.status(200).json({
          success: true,
          message: "Payment successful, signature verified and user enrolled",
          mailResponse,
        });
      } catch (error) {
        console.error("Error updating course and user:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to update course and user",
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
