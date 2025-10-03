const express = require("express");
const ProfileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(cookieParser());
const jwt = require("jsonwebtoken");
const isEditAllowed = require("../utils/validation");

ProfileRouter.get("/profile", userAuth, async (req, res) => {
  // It's better to send the user object as JSON
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

ProfileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const permission = isEditAllowed(req);

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: "Invalid Update Fields",
      });
    }

    const loggedUser = req.user;
    const updates = Object.keys(req.body);
    updates.forEach((update) => {
      loggedUser[update] = req.body[update];
    });
    await loggedUser.save();
    res.status(200).json({
      success: true,
      message: `${loggedUser.firstName}, your profile is updated successfully.`,
      user: loggedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

ProfileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findByIdAndDelete(id);
    res.clearCookie("token"); // Also clear the auth cookie on delete
    res.status(200).json({
      success: true,
      message: "User account deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: err.message,
    });
  }
});

module.exports = ProfileRouter;
