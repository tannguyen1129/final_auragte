const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  password: {
  type: String,
  required: function () {
    return this.role !== "GUEST";
  },
},
  faceEmbeddings: [[Number]],
  licensePlates: [String],
  role: {
    type: String,
    enum: ["ADMIN", "EMPLOYEE", "GUEST"],
    default: "EMPLOYEE"
  },
  vehicleType: {
  type: String,
  enum: ["CAR", "BIKE", null],
  default: null
}
});

// Hash password tự động khi tạo user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
