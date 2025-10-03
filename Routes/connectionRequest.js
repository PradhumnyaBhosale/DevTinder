const express = require("express");
const connectionRequestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

connectionRequestRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all connection requests involving this user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ from: loggedInUserId }, { to: loggedInUserId }],
    });

    // Build excluded IDs (self + interacted users)
    const excludedUserIds = new Set();
    excludedUserIds.add(loggedInUserId.toString());

    connectionRequests.forEach((req) => {
      excludedUserIds.add(req.from.toString());
      excludedUserIds.add(req.to.toString());
    });

    // Handle pagination params
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    limit = Math.min(limit, 50); // Limit maximum results per page to 50

    // Fetch potential users with pagination
    const potentialUsers = await User.find({
      _id: { $nin: Array.from(excludedUserIds) },
    })
      .select("firstName lastName age gender photourl about skills")
      .skip(skip)
      .limit(limit);

    // Count total users for frontend
    const totalUsers = await User.countDocuments({
      _id: { $nin: Array.from(excludedUserIds) },
    });

    res.status(200).json({
      success: true,
      message: "Feed fetched successfully",
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      data: potentialUsers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: err.message,
    });
  }
});

connectionRequestRouter.post(
  "/request/send/:status/:ReceiverId",
  userAuth,
  async (req, res) => {
    try {
      const Receiver = req.params.ReceiverId;
      const Sender = req.user._id;
      const status = req.params.status;

      const receiverUser = await User.findById(Receiver);

      if (!receiverUser) {
        return res.status(404).json({
          success: false,
          message: "Receiver user not found",
        });
      }

      if (status !== "interested") {
        return res.status(400).json({
          success: false,
          message: "Invalid status for sending request",
          error: "Status must be 'interested'",
        });
      }
      if (Receiver === Sender) {
        return res.status(400).json({
          success: false,
          message: "You cannot send request to yourself",
          error: "You cannot send request to yourself",
        });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { from: Sender, to: Receiver },
          { from: Receiver, to: Sender },
        ],
      });

      if (existingRequest) {
        res.status(400).json({
          success: false,
          message: "Request already sent",
        });
      }

      const Request = new ConnectionRequest({
        from: Sender,
        to: Receiver,
        status: status,
      });

      const request = await Request.save();

      console.log(
        `sent request from ${Sender} to ${Receiver} with status ${status}`
      );
      res.status(200).json({
        success: true,
        message: "Request sent successfully",
        data: request,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: "Failed to send request",
        error: err.message,
      });
    }
  }
);

connectionRequestRouter.post(
  "/request/respond/:requestId/:status",
  userAuth,
  async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const status = req.params.status;
      const userId = req.user._id;

      if (!["rejected", "accepted"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
          error: "Invalid status",
        });
      }
      const request = await ConnectionRequest.findById({
        _id: requestId,
        to: userId,
        status: "interested",
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
          error: "Request not found",
        });
      }

      request.status = status;
      await request.save();

      console.log(`Request ${requestId} responded with status ${status}`);
      res.status(200).json({
        success: true,
        message: "Request responded successfully",
        data: request,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: "Failed to respond to request",
        error: err.message,
      });
    }
  }
);

module.exports = connectionRequestRouter;
