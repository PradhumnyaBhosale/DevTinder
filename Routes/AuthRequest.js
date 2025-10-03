const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup",async (req, res) => {
  try {
    console.log("Starting user creation process...");
    // Create new user instance
    const { firstName, lastName, email, password, gender, age } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    console.log("Original password:", password);
    console.log("Hashed password:", hashed);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      gender,
      age,
    });

    // Save the user
    const savedUser = await user.save();
    console.log("User saved successfully:", savedUser);

    // Send success response
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: savedUser,
    });

  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }

});





authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" });


    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(200).json({
      success: true,
      message: "Login successful for user " + user.firstName +" "+ user.lastName,
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: err.message,
    });
  }

});

authRouter.post("/logout", (req, res) => {
      
   res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  
})

 
module.exports = authRouter;
