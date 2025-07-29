const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/Users.js");
const { extractFeatures } = require("../../services/flaskClient");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = {
  Query: {
    hello: () => "Auragate Backend up and running 🚀",

    getAllUsers: async () => {
      return await User.find();
    },

    getAllEmployees: async () => {
      return await User.find({ role: { $in: ["EMPLOYEE", "ADMIN"] } });
    },

    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const foundUser = await User.findById(user.id);
      if (!foundUser) throw new Error("User not found");
      return foundUser;
    },
  },

  Mutation: {
    registerUser: async (_, { input }) => {
  const {
    fullName,
    email,
    password,
    faceImages,
    plateImage,
    role,
    vehicleType // ✅ thêm vào từ input
  } = input;

  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);

  let faceEmbeddings = [];
  let licensePlates = [];

  if (role !== "ADMIN") {
    try {
      const result = await extractFeatures(faceImages, plateImage);
      console.log("[FLASK RESULT]", result);

      if (!result?.face_found || !result?.plate_found) {
        throw new Error("Không nhận diện được khuôn mặt hoặc biển số");
      }

      faceEmbeddings = result.embeddings || [result.embedding];
      licensePlates = [result.plate_text];
    } catch (err) {
      console.error("[ERROR] Gọi Flask thất bại:", err);
      throw new Error("Lỗi kết nối đến Flask để trích xuất đặc trưng");
    }
  }

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    faceEmbeddings,
    licensePlates,
    role: role || "EMPLOYEE",
    vehicleType: vehicleType || null  // ✅ gán nếu có
  });

  return user;
},

    loginUser: async (_, { email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    console.warn("❌ Không tìm thấy user với email:", email);
    throw new Error("Invalid credentials");
  }

  console.log("🔐 Đăng nhập email:", email);
  console.log("🔐 Nhập mật khẩu:", password);
  console.log("🔐 Mật khẩu lưu trong DB:", user.password);

  const valid = await bcrypt.compare(password, user.password);
  console.log("✅ So sánh kết quả:", valid);

  if (!valid) {
    console.warn("❌ Mật khẩu không khớp");
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);
  console.log("✅ Đăng nhập thành công:", user.email);
  return { token, user };
},

    deleteUser: async (_, { id }) => {
  const result = await User.findByIdAndDelete(id);
  return !!result;
},

    updateUser: async (_, { userId, input }) => {
      const updateData = { ...input };
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      const updated = await User.findByIdAndUpdate(userId, updateData, {
        new: true
      });

      if (!updated) throw new Error("User not found");
      return updated;
    }
  }
};
