const express = require("express");
const { dbConnect } = require("./config/databse");
require("dotenv").config();
require("colors");

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`.blue);
});
dbConnect();
