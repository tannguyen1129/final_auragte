"use client";
import { useState, useRef, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlusIcon,
  CameraIcon,
  DocumentIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  TruckIcon,
  StopIcon,
  PlayIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      id
    }
  }
`;

export default function CreateUserPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // States
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    vehicleType: "CAR",
  });
  const [faceImages, setFaceImages] = useState([]);
  const [plateImageFile, setPlateImageFile] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [registerUser, { loading: submitting }] = useMutation(REGISTER_USER, {
    onCompleted: () => {
      setFeedback({ type: "success", text: "Tạo nhân viên thành công!" });
      setTimeout(() => router.push("/admin/users"), 1500);
    },
    onError: (error) => {
      setFeedback({ type: "error", text: error.message || "Lỗi khi tạo nhân viên" });
    }
  });

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      setCameraError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureFaceImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    setFaceImages((prev) => [...prev, base64]);
    setFeedback({ type: "success", text: `Đã chụp ảnh ${faceImages.length + 1}/5` });
  };

  const removeFaceImage = (index) => {
    setFaceImages((prev) => prev.filter((_, i) => i !== index));
    setFeedback({ type: "info", text: "Đã xóa ảnh" });
  };

  // Form handlers
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlateChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", text: "Vui lòng chọn file hình ảnh" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPlatePreview(url);
    setPlateImageFile(file);
    setFeedback({ type: "success", text: "Đã chọn ảnh biển số" });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fullName.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập họ tên" });
      return;
    }

    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setFeedback({ type: "error", text: "Vui lòng nhập email hợp lệ" });
      return;
    }

    if (form.password.length < 6) {
      setFeedback({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    if (faceImages.length < 5) {
      setFeedback({ type: "error", text: "Cần chụp ít nhất 5 ảnh khuôn mặt" });
      return;
    }

    if (!plateImageFile) {
      setFeedback({ type: "error", text: "Vui lòng chọn ảnh biển số" });
      return;
    }

    setFeedback({ type: "info", text: "Đang tạo nhân viên..." });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const plateBase64 = reader.result.split(",")[1];
      await registerUser({
        variables: {
          input: { ...form, faceImages, plateImage: plateBase64 }
        }
      });
    };
    reader.readAsDataURL(plateImageFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-950">Tạo nhân viên mới</h1>
              <p className="text-gray-700 font-medium mt-1">
                Điền thông tin và chụp ảnh để đăng ký nhân viên
              </p>
            </div>
          </div>
        </header>

        {/* Basic Information */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentIcon className="w-6 h-6 text-blue-600" />
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                👤 Họ và tên
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                disabled={submitting}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                📧 Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="example@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                disabled={submitting}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                🔒 Mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleFormChange("password", e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                disabled={submitting}
              />
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                🚗 Loại phương tiện
                <span className="text-red-500">*</span>
              </label>
              <select
                value={form.vehicleType}
                onChange={(e) => handleFormChange("vehicleType", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                disabled={submitting}
              >
                <option value="CAR">🚘 Ô tô</option>
                <option value="BIKE">🏍️ Xe máy</option>
              </select>
            </div>
          </div>
        </section>

        {/* Face Capture */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CameraIcon className="w-6 h-6 text-green-600" />
              Chụp ảnh khuôn mặt
            </h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Cần 5 ảnh
            </div>
          </div>

          {/* Camera */}
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
                  <CameraIcon className="w-16 h-16 mb-4" />
                  <p className="text-center">{cameraError || "Camera đã tắt"}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {stream ? (
                <>
                  <button
                    onClick={captureFaceImage}
                    disabled={submitting || faceImages.length >= 5}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:scale-105 disabled:opacity-50 transition-all"
                  >
                    <CameraIcon className="w-5 h-5" />
                    Chụp ảnh
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all"
                  >
                    <StopIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  <PlayIcon className="w-5 h-5" />
                  Mở camera
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Tiến độ chụp ảnh</span>
              <span className="text-gray-600">{faceImages.length}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(faceImages.length / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Image Grid */}
          {faceImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {faceImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`Face ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeFaceImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 5 - faceImages.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                >
                  <CameraIcon className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </section>

        {/* License Plate */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TruckIcon className="w-6 h-6 text-yellow-600" />
            Ảnh biển số xe
          </h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              📸 Chọn ảnh biển số
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <DocumentIcon className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click để chọn ảnh</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePlateChange}
                  disabled={submitting}
                />
              </label>
            </div>
          </div>

          {platePreview && (
            <div className="flex justify-center">
              <img
                src={platePreview}
                alt="License plate preview"
                className="max-w-xs h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md"
              />
            </div>
          )}
        </section>

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <button
            onClick={handleSubmit}
            disabled={submitting || faceImages.length < 5 || !platePreview}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200 shadow-lg"
          >
            {submitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo nhân viên...
              </>
            ) : (
              <>
                <UserPlusIcon className="w-6 h-6" />
                Tạo nhân viên
              </>
            )}
          </button>
        </div>

        {/* Feedback */}
        {feedback.text && (
          <div
            className={`rounded-2xl p-4 border-l-4 ${
              feedback.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : feedback.type === "error"
                ? "bg-red-50 border-red-500 text-red-800"
                : "bg-yellow-50 border-yellow-500 text-yellow-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" && <CheckBadgeIcon className="w-5 h-5" />}
              {feedback.type === "error" && <XCircleIcon className="w-5 h-5" />}
              {feedback.type === "info" && <ExclamationTriangleIcon className="w-5 h-5" />}
              <p className="font-medium">{feedback.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
