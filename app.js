const express = require("express");
connection = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(cookieParser());
const jwt = require("jsonwebtoken");
const {userAuth} = require('./middleware/auth');


app.use("/", require("./Routes/AuthRequest"));
app.use("/", require("./Routes/ProfileRequest"));
app.use("/", require("./Routes/connectionRequest"));
app.use("/", require("./Routes/UserRequest"));

connection()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server running on Port 3000");
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
