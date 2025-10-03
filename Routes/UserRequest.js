const express = require("express");
const connectionRequestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(cookieParser());
const jwt = require("jsonwebtoken");
const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const requests = await ConnectionRequest.find({
      to: loggedInUserId,
      status: "interested",
    }).populate("from", ["firstName", "lastName"]);

    res.status(200).json({
      success: true,
      message: "Connection requests fetched successfully",
      data: requests,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({
      success: false,
      message: "Failed to get users",
      error: err.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [
        { from: loggedInUserId, status: "interested" },
        { to: loggedInUserId, status: "interested" },
      ],
    })
      .populate("from", ["firstName", "lastName"])
      .populate("to", ["firstName", "lastName"]);
    res.status(200).json({
      success: true,
      message: "Connection requests fetched successfully",
      data: connections,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({
      success: false,
      message: "Failed to get users",
      error: err.message,
    });
  }
});

module.exports = userRouter;
