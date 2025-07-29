const mongoose = require('mongoose');

const parkingStatsSchema = new mongoose.Schema({
  totalCarSlots: { type: Number, default: 50 },
  totalBikeSlots: { type: Number, default: 100 },
  carIn: { type: Number, default: 0 },
  bikeIn: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ParkingStats', parkingStatsSchema);
