const express = require("express");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("colors");

//importing configs
const { dbConnect } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinaryDB");

//imporuing routes
const userRoutes = require("./routes/User");
const ProfileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");
const PaymentRoutes = require("./routes/Payments");
const ContactRoutes = require("./routes/Contact");

const PORT = process.env.PORT || 8000;

const app = express();

//middlewares
app.use(express.json());

app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./public/",
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow sending cookies across origins (if needed)
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", ProfileRoutes);
app.use("/api/v1/course", CourseRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/contact", ContactRoutes);

//default API
app.get("/", (req, res) => {
  res.send("<h1>Server is up and running</h1>");
});

//activatating server
app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`.blue);
});

//database connection
dbConnect();
cloudinaryConnect();
