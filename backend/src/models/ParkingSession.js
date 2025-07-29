const mongoose = require("mongoose");

const ParkingSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  licensePlate: String,
  faceIdentity: String,
  checkinTime: Date,
  checkoutTime: Date,
  status: { type: String, enum: ["IN", "OUT"] },
  vehicleType: { type: String, enum: ["CAR", "BIKE", null], default: null }
});

module.exports = mongoose.model("ParkingSession", ParkingSessionSchema);
