const ParkingSession = require("../../models/ParkingSession");
const User = require("../../models/Users.js");
const ParkingStats = require("../../models/ParkingStats");
const {
  extractFeatures,
  extractFace,
  extractPlate
} = require("../../services/flaskClient");

const {
  findMatchingFace,
  findMatchingPlate
} = require("../../services/compare");

// Thống kê IN / OUT theo thời gian
const buildStatsPipeline = (format) => [
  {
    $project: {
      time: { $dateToString: { format, date: "$checkinTime" } },
      type: { $literal: "IN" }
    }
  },
  {
    $unionWith: {
      coll: "parkingsessions",
      pipeline: [
        {
          $match: { checkoutTime: { $ne: null } }
        },
        {
          $project: {
            time: { $dateToString: { format, date: "$checkoutTime" } },
            type: { $literal: "OUT" }
          }
        }
      ]
    }
  },
  {
    $group: {
      _id: "$time",
      totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, 1, 0] } },
      totalOut: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, 1, 0] } }
    }
  },
  {
    $project: {
      label: "$_id",
      totalIn: 1,
      totalOut: 1,
      _id: 0
    }
  },
  { $sort: { label: 1 } }
];

module.exports = {
  Query: {
    statsLogsByPeriod: async (_, { period }) => {
      let format;
      switch (period) {
        case "DAY": format = "%Y-%m-%d"; break;
        case "MONTH": format = "%Y-%m"; break;
        case "YEAR": format = "%Y"; break;
        default: throw new Error("Invalid period type");
      }
      return await ParkingSession.aggregate(buildStatsPipeline(format));
    }
  },

  Mutation: {
    logEntry: async (_, { faceImages, plateImage, vehicleType }) => {
  console.log("🚦 logEntry: nhận faceImages + plateImage từ client");

  // 1. Gửi ảnh đến Flask để trích xuất đặc trưng
  const result = await extractFeatures(faceImages, plateImage);

  if (!result?.face_found || !result?.plate_found || !result?.embeddings?.length) {
    console.warn("❌ Không nhận diện được mặt hoặc biển.");
    throw new Error("Không nhận diện được khuôn mặt hoặc biển số.");
  }

  const plateText = result.plate_text?.trim();

  // 2. Chống đúp: kiểm tra xem đã có session IN với biển này chưa
  const existing = await ParkingSession.findOne({
    licensePlate: plateText,
    status: "IN"
  });

  if (existing) {
    console.warn("🚫 Đã có xe đang trong bãi với biển:", plateText);
    throw new Error("Xe này đã gửi bãi nhưng chưa lấy ra.");
  }

  // 3. Tìm người dùng theo khuôn mặt và biển
  const allUsers = await User.find();
  const faceUser = findMatchingFace(allUsers, result.embeddings[0]);
  const plateUser = findMatchingPlate(allUsers, plateText);

  let finalUser;

  try {
    // 4. Quyết định dùng user cũ hay tạo mới
    if (
      faceUser &&
      plateUser &&
      faceUser.id === plateUser.id &&
      faceUser.role === "EMPLOYEE"
    ) {
      finalUser = faceUser;
      console.log("✅ Dùng EMPLOYEE:", finalUser.fullName);
    } else {
      finalUser = await User.create({
        fullName: "Khách vãng lai",
        email: `guest_${Date.now()}@auragate.vn`,
        role: "GUEST",
        faceEmbeddings: result.embeddings,
        licensePlates: [plateText],
        vehicleType: vehicleType || null
      });
      console.log("🆕 Tạo user GUEST mới:", finalUser.email);
    }

    // 5. Tạo phiên gửi xe
    const session = await ParkingSession.create({
      user: finalUser._id,
      licensePlate: plateText,
      faceIdentity: finalUser.fullName,
      checkinTime: new Date(),
      status: "IN",
      vehicleType: finalUser.vehicleType || vehicleType || null
    });

    // 6. Cập nhật slot bãi nếu là GUEST
    if (finalUser.role === "GUEST" && vehicleType) {
      await ParkingStats.updateOne({}, {
        $inc: {
          carIn: vehicleType === "CAR" ? 1 : 0,
          bikeIn: vehicleType === "BIKE" ? 1 : 0
        }
      });
      console.log(`➕ GUEST vào bãi: tăng ${vehicleType}`);
    }

    const populated = await session.populate("user");

    return {
      id: populated._id.toString(),
      licensePlate: populated.licensePlate,
      faceIdentity: populated.faceIdentity,
      checkinTime: populated.checkinTime?.toISOString() || null,
      checkoutTime: null,
      status: populated.status,
      vehicleType: populated.vehicleType,
      user: populated.user
    };

  } catch (err) {
    console.error("❌ Lỗi khi ghi log entry:", err.message);
    throw new Error("Không thể ghi nhận phiên gửi xe.");
  }
},

    logExit: async (_, { faceImage, plateImage }) => {
      console.log("🚦 logExit: nhận face + plate từ client");

      const faceResult = await extractFace(faceImage);
      const plateResult = await extractPlate(plateImage);

      if (!faceResult?.face_found || !faceResult.embedding) {
        throw new Error("Không nhận diện được khuôn mặt.");
      }

      if (!plateResult?.plate_found || !plateResult.plate_text) {
        throw new Error("Không nhận diện được biển số.");
      }

      const plateText = plateResult.plate_text.trim();
      const activeSessions = await ParkingSession.find({ status: "IN" }).populate("user");

      const matchedByPlate = activeSessions.filter(
        (s) => s.licensePlate?.trim() === plateText
      );

      let matchedSession = null;
      for (const session of matchedByPlate) {
        const user = session.user;
        if (!user) continue;

        const matchFace = findMatchingFace([user], faceResult.embedding);
        if (matchFace) {
          matchedSession = session;
          break;
        }
      }

      if (!matchedSession) {
        throw new Error("❌ Không xác minh được người dùng hợp lệ để thoát xe.");
      }

      matchedSession.checkoutTime = new Date();
      matchedSession.status = "OUT";
      await matchedSession.save();

      const populated = await matchedSession.populate("user");
      const user = populated.user;
      const type = matchedSession.vehicleType;

      if (type === "CAR" || type === "BIKE") {
        const updateField = type === "CAR" ? { carIn: -1 } : { bikeIn: -1 };
        await ParkingStats.updateOne({}, { $inc: updateField });
        console.log(`➖ Đã thoát bãi: giảm ${type}`);
      } else {
        console.warn("⚠️ Không xác định loại xe, không trừ slot");
      }

      const response = {
        id: populated._id.toString(),
        licensePlate: populated.licensePlate,
        faceIdentity: populated.faceIdentity,
        checkinTime: populated.checkinTime?.toISOString() || null,
        checkoutTime: populated.checkoutTime?.toISOString() || null,
        status: populated.status,
        vehicleType: matchedSession.vehicleType,
        user: user
      };

      if (user.role === "GUEST") {
        console.log("🧹 Đã thoát xe – xoá user GUEST sau 1s...");
        setTimeout(() => {
          User.findByIdAndDelete(user._id)
            .then(() => console.log("✅ GUEST đã xoá:", user.email))
            .catch((err) => console.error("❌ Lỗi xoá GUEST:", err));
        }, 1000);
      }

      return response;
    }
  }
};
