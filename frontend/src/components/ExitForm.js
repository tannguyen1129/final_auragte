"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import FaceAutoCapture from "@/components/FaceAutoCapture";
import PlateCapture from "@/components/PlateCapture";
import {
  SparklesIcon,
  UserCircleIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// GraphQL Mutation
const LOG_EXIT = gql`
  mutation LogExit($faceImage: String!, $plateImage: String!) {
    logExit(faceImage: $faceImage, plateImage: $plateImage) {
      id
      checkoutTime
      licensePlate
      faceIdentity
      status
      vehicleType
      user {
        role
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

export default function ExitForm({ faceImage, setFaceImage, setMessage, onSuccess }) {
  const [plateBase64, setPlateBase64] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [logExit] = useMutation(LOG_EXIT);

  const handleReset = (silent = false) => {
    setFaceImage("");
    setPlateBase64(null);
    setPlatePreview(null);
    setCameraEnabled(true);
    setFeedback({ type: "", text: "" });
    if (!silent) setMessage("🔁 Đã đặt lại, vui lòng chụp lại từ đầu");
  };

  const handleSubmit = async () => {
    if (!faceImage || !plateBase64) {
      setFeedback({ type: "error", text: "Cần ảnh khuôn mặt và ảnh biển số" });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const { data, errors } = await logExit({
        variables: { faceImage, plateImage: plateBase64 },
      });
      if (errors?.length || !data?.logExit) {
        throw new Error(errors?.[0]?.message || "Không nhận diện được.");
      }

      const session = data.logExit;
      const roleLabel = session.user.role === "GUEST" ? "Vãng lai" : "Nhân viên";
      const typeLabel = session.vehicleType === "CAR" ? "Ô tô" : session.vehicleType === "BIKE" ? "Xe máy" : "Khác";

      setMessage(
        `✅ Ra lúc ${formatTime(session.checkoutTime)} - ${session.licensePlate} (${roleLabel} - ${typeLabel})`
      );
      setFeedback({ type: "success", text: "Lấy xe thành công!" });
      handleReset(true);
      onSuccess();
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Lỗi không xác định." });
      setMessage(`❌ ${err.message || "Lỗi không xác định."}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto mb-8 p-6 rounded-2xl shadow-2xl border border-gray-100 bg-white/90 space-y-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-center space-x-3">
        <SparklesIcon className="w-7 h-7 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Lấy xe (Check-out)</h2>
      </div>

      {/* Face Capture Section */}
      <section className="space-y-2">
        <label className="flex items-center gap-2 font-medium">
          <UserCircleIcon className="w-6 h-6 text-purple-600" />
          Chụp khuôn mặt (1 ảnh)
        </label>
        {cameraEnabled ? (
          <FaceAutoCapture
            onCapture={(base64) => {
              setFaceImage(base64);
              setFeedback({ type: "success", text: "Đã chụp ảnh khuôn mặt" });
              setCameraEnabled(false);
            }}
            maxCaptures={1}
            disabled={submitting}
          />
        ) : (
          <button
            onClick={() => {
              setFaceImage("");
              setCameraEnabled(true);
              setFeedback({ type: "", text: "Mở lại camera" });
            }}
            className="flex items-center bg-gray-200 font-medium px-4 py-2 rounded-xl text-gray-700 shadow-sm hover:bg-gray-300 transition-all"
            aria-label="Mở lại camera"
          >
            <ArrowPathIcon className="w-5 h-5 mr-1" />
            Mở lại camera
          </button>
        )}
        {faceImage && (
          <div className="text-sm flex items-center text-gray-700">
            <CheckBadgeIcon className="w-5 h-5 mr-2 text-green-500" />
            Ảnh khuôn mặt đã sẵn sàng
          </div>
        )}
      </section>

      {/* Plate Capture Section */}
      <section className="space-y-2">
        <label className="flex items-center gap-2 font-medium">
          <CreditCardIcon className="w-6 h-6 text-green-500" />
          Chụp biển số xe
        </label>
        {faceImage ? (
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
          <p className="text-sm text-gray-400">📷 Vui lòng chụp ảnh khuôn mặt trước.</p>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmit}
          className={`flex items-center justify-center bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
            submitting ? "cursor-wait" : ""
          }`}
          disabled={!faceImage || !plateBase64 || submitting}
          aria-label="Lấy xe"
        >
          {submitting ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <ArrowRightIcon className="w-5 h-5 mr-2" />
          )}
          {submitting ? "Đang xử lý..." : "Lấy xe"}
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
    </div>
  );
}
