const mongoose = require("mongoose");
const User = require("./user");

const connectionRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
  status: {
      type: String,
      enum: ["ignore", "accepted", "rejected", "interested"],
      default: "ignore",
    },

  },

  { timestamps: true } 
);
connectionRequestSchema.index({ from: 1, to: 1 });
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequest;
