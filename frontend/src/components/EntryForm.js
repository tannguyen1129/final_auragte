"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import FaceAutoCapture from "@/components/FaceAutoCapture";
import PlateCapture from "@/components/PlateCapture";
import {
  SparklesIcon,
  UserCircleIcon,
  FaceSmileIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

// GraphQL Mutation
const LOG_ENTRY = gql`
  mutation LogEntry(
    $faceImages: [String!]!
    $plateImage: String!
    $vehicleType: String
  ) {
    logEntry(
      faceImages: $faceImages
      plateImage: $plateImage
      vehicleType: $vehicleType
    ) {
      id
      checkinTime
      licensePlate
      faceIdentity
      status
      vehicleType
      user {
        role
        vehicleType
      }
    }
  }
`;

// Utility function
const formatTime = (t) =>
  new Date(t).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function EntryForm({ setMessage, onSuccess }) {
  const [faceImages, setFaceImages] = useState([]);
  const [plateBase64, setPlateBase64] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [vehicleType, setVehicleType] = useState("CAR");
  const [pendingData, setPendingData] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [captureKey, setCaptureKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [logEntry] = useMutation(LOG_ENTRY);

  const handleAddFaceImage = (base64) => {
    setFaceImages((prev) => [...prev, base64]);
    setFeedback({ type: "success", text: "Đã chụp ảnh khuôn mặt" });
  };

  const handleReset = (silent = false) => {
    setFaceImages([]);
    setPlateBase64(null);
    setPlatePreview(null);
    setVehicleType("CAR");
    setPendingData(null);
    setShowVehicleModal(false);
    setCaptureKey((prev) => prev + 1);
    setFeedback({ type: "", text: "" });
    if (!silent) setMessage("🔁 Đã đặt lại, vui lòng chụp lại từ đầu");
  };

  const handleSubmit = async () => {
    if (faceImages.length < 5 || !plateBase64) {
      setFeedback({ type: "error", text: "Cần đủ 5 ảnh khuôn mặt và 1 ảnh biển số" });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const { data, errors } = await logEntry({
        variables: { faceImages, plateImage: plateBase64, vehicleType },
      });
      if (errors?.length || !data?.logEntry) {
        throw new Error(errors?.[0]?.message || "Không nhận diện được.");
      }

      const session = data.logEntry;
      if (session.status === "PENDING" && session.user?.role === "GUEST") {
        setPendingData({
          faceImages,
          plateImage: plateBase64,
          licensePlate: session.licensePlate,
          time: session.checkinTime,
        });
        setShowVehicleModal(true);
        setSubmitting(false);
        return;
      }

      setMessage(
        `✅ Vào lúc ${formatTime(session.checkinTime)} - ${session.licensePlate} (${
          session.user.role === "GUEST" ? "Vãng lai" : "Nhân viên"
        })`
      );
      setFeedback({ type: "success", text: "Gửi xe thành công!" });
      handleReset(true);
      onSuccess();
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Lỗi không xác định." });
      setMessage(`❌ ${err.message || "Lỗi không xác định."}`);
    }
    setSubmitting(false);
  };

  const handleSubmitVehicleType = async () => {
    if (!pendingData || !vehicleType) return;
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    try {
      const { data, errors } = await logEntry({
        variables: {
          faceImages: pendingData.faceImages,
          plateImage: pendingData.plateImage,
          vehicleType,
        },
      });
      if (errors?.length || !data?.logEntry) {
        throw new Error(errors?.[0]?.message || "Không thể ghi nhận loại xe.");
      }

      setMessage(
        `✅ Vào lúc ${formatTime(pendingData.time)} - ${pendingData.licensePlate} (Vãng lai - ${vehicleType})`
      );
      setFeedback({ type: "success", text: "Đã xác nhận loại xe. Hoàn tất gửi xe." });
      handleReset(true);
      onSuccess();
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Lỗi gửi lại loại xe." });
      setMessage(`❌ ${err.message || "Lỗi gửi lại loại xe."}`);
    }
    setSubmitting(false);
    setShowVehicleModal(false);
  };

  return (
    <div className="max-w-lg mx-auto mb-8 p-6 rounded-2xl shadow-2xl border border-gray-100 bg-white/90 space-y-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-center space-x-3">
        <SparklesIcon className="w-7 h-7 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900">Gửi xe (Check-in)</h2>
      </div>

      {/* Face Capture Section */}
      <section className="space-y-2">
        <label className="flex items-center gap-2 font-medium">
          <UserCircleIcon className="w-6 h-6 text-purple-600" />
          Chụp khuôn mặt (ít nhất 5 ảnh)
        </label>
        <FaceAutoCapture
          key={captureKey}
          onCapture={handleAddFaceImage}
          maxCaptures={5}
          disabled={submitting}
        />
        <div className="text-sm flex items-center text-gray-700">
          <FaceSmileIcon className="w-5 h-5 mr-2 text-blue-400" />
          <b>{faceImages.length}/5</b> ảnh đã chụp
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(faceImages.length / 5) * 100}%` }}
          />
        </div>
      </section>

      {/* Plate Capture Section */}
      <section className="space-y-2">
        <label className="flex items-center gap-2 font-medium">
          <CreditCardIcon className="w-6 h-6 text-green-500" />
          Chụp biển số xe
        </label>
        {faceImages.length >= 5 ? (
          <>
            <PlateCapture
              onCapture={(base64) => {
                setPlateBase64(base64);
                setPlatePreview(`data:image/jpeg;base64,${base64}`);
                setFeedback({ type: "success", text: "Đã chụp ảnh biển số" });
              }}
              disabled={submitting}
            />
            {platePreview && (
              <img
                src={platePreview}
                alt="Ảnh biển số"
                className="mt-2 rounded-xl shadow border w-full max-h-40 object-cover"
              />
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">📷 Vui lòng chụp đủ 5 ảnh khuôn mặt trước.</p>
        )}
      </section>

      {/* Vehicle Type Section */}
      <section className="space-y-2">
        <label className="flex items-center gap-2 font-medium">
          <TruckIcon className="w-6 h-6 text-yellow-500" />
          Chọn loại phương tiện
        </label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={submitting}
        >
          <option value="CAR">🚘 Ô tô</option>
          <option value="BIKE">🏍️ Xe máy</option>
        </select>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmit}
          className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
            submitting ? "cursor-wait" : ""
          }`}
          disabled={faceImages.length < 5 || !plateBase64 || submitting}
          aria-label="Gửi xe"
        >
          {submitting ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <ArrowRightIcon className="w-5 h-5 mr-2" />
          )}
          {submitting ? "Đang gửi..." : "Gửi xe"}
        </button>
        <button
          onClick={() => handleReset(false)}
          className="flex items-center bg-gray-200 font-medium px-5 py-2.5 rounded-xl text-gray-700 shadow-sm hover:bg-gray-300 transition-all"
          disabled={submitting}
          aria-label="Bắt đầu lại"
        >
          <ArrowPathIcon className="w-5 h-5 mr-1" />
          Bắt đầu lại
        </button>
      </div>

      {/* Feedback */}
      {feedback.text && (
        <div
          className={`flex items-center space-x-2 text-sm rounded-xl p-3 border transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : feedback.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}
        >
          {feedback.type === "success" && <CheckBadgeIcon className="w-5 h-5" />}
          {feedback.type === "error" && <XCircleIcon className="w-5 h-5" />}
          {!feedback.type && <ExclamationTriangleIcon className="w-5 h-5" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Vehicle Type Modal for Guests */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 font-semibold text-lg text-yellow-900">
              <ExclamationTriangleIcon className="w-6 h-6" />
              Xác nhận loại xe cho khách vãng lai
            </div>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-yellow-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              disabled={submitting}
            >
              <option value="CAR">🚗 Ô tô</option>
              <option value="BIKE">🏍️ Xe máy</option>
            </select>
            <button
              onClick={handleSubmitVehicleType}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-2.5 rounded-xl shadow hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50"
              disabled={submitting || !vehicleType}
            >
              {submitting ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CheckBadgeIcon className="w-5 h-5 mr-2" />
              )}
              Xác nhận
            </button>
            <button
              onClick={() => setShowVehicleModal(false)}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
