const User = require("../../models/Users.js");
const ParkingSession = require("../../models/ParkingSession.js"); 
const ParkingStats = require("../../models/ParkingStats.js");      

const TOTAL_CAR_SLOTS = 10;
const TOTAL_BIKE_SLOTS = 20;

module.exports = {
  Query: {
    parkingStats: async () => {
      const activeSessions = await ParkingSession.find({ status: "IN" }).populate("user");

      let carIn = 0;
      let bikeIn = 0;

      for (const session of activeSessions) {
        const user = session.user;
        if (!user || !user.vehicleType) continue;

        if (user.vehicleType === "CAR") carIn++;
        else if (user.vehicleType === "BIKE") bikeIn++;
      }

      return {
        totalCarSlots: TOTAL_CAR_SLOTS,
        carIn,
        carAvailable: TOTAL_CAR_SLOTS - carIn,
        totalBikeSlots: TOTAL_BIKE_SLOTS,
        bikeIn,
        bikeAvailable: TOTAL_BIKE_SLOTS - bikeIn
      };
    }
  }
};
