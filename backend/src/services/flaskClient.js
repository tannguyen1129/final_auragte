const axios = require("axios");

// ✅ Tạo instance axios dùng baseURL sẵn
const flask = axios.create({
  baseURL: process.env.FLASK_API_URL || "http://localhost:5000",
  timeout: 30000,
});

// 👤 Gửi 1 ảnh mặt
async function extractFace(faceImage) {
  try {
    console.log("📤 Gửi ảnh mặt tới Flask...");
    const res = await flask.post("/extract_face", {
      face_image: faceImage,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi gọi Flask /extract_face:", err.response?.data || err.message);
    return null;
  }
}

// 🚘 Gửi 1 ảnh biển số
async function extractPlate(plateImage) {
  try {
    console.log("📤 Gửi ảnh biển số tới Flask...");
    const res = await flask.post("/extract_plate", {
      plate_image: plateImage,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi gọi Flask /extract_plate:", err.response?.data || err.message);
    return null;
  }
}

// 👤📸 Gửi nhiều ảnh mặt + 1 ảnh biển số để lấy embedding trung bình
async function extractFeatures(faceImages, plateImage) {
  try {
    console.log("📤 Gửi danh sách ảnh mặt + biển số đến Flask...");
    const res = await flask.post("/extract_features", {
      face_images: faceImages,
      plate_image: plateImage,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi gọi Flask /extract_features:", err.response?.data || err.message);
    return null;
  }
}

module.exports = {
  extractFace,
  extractPlate,
  extractFeatures,
};
