"use client";
import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import FaceAutoCapture from "@/components/FaceAutoCapture";
import PlateCapture from "@/components/PlateCapture";

const LOG_ENTRY = gql`
  mutation LogEntry($faceImages: [String!]!, $plateImage: String!, $vehicleType: String) {
    logEntry(faceImages: $faceImages, plateImage: $plateImage, vehicleType: $vehicleType) {
      id
      checkinTime
      licensePlate
      faceIdentity
      status
      user {
        role
        vehicleType
      }
    }
  }
`;

export default function EntryForm({ setMessage, onSuccess }) {
  const [faceImages, setFaceImages] = useState([]);
  const [plateBase64, setPlateBase64] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [vehicleType, setVehicleType] = useState("CAR");
  const [askVehicleType, setAskVehicleType] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [captureKey, setCaptureKey] = useState(0);
  const [logEntry] = useMutation(LOG_ENTRY);

  const handleAddFaceImage = (base64) => {
    setFaceImages((prev) => [...prev, base64]);
  };

  useEffect(() => {
    if (faceImages.length > 0 && faceImages.length < 5) {
      setMessage(`✅ Đã chụp ${faceImages.length} ảnh khuôn mặt`);
    }
  }, [faceImages.length]);

  const handleResetManual = () => {
    setFaceImages([]);
    setPlateBase64(null);
    setPlatePreview(null);
    setMessage("🔁 Đã đặt lại, vui lòng chụp lại từ đầu");
    setCaptureKey((prev) => prev + 1);
    setAskVehicleType(false);
    setPendingSubmitData(null);
  };

  const handleResetSilent = () => {
    setFaceImages([]);
    setPlateBase64(null);
    setPlatePreview(null);
    setCaptureKey((prev) => prev + 1);
    setAskVehicleType(false);
    setPendingSubmitData(null);
  };

  const handleSubmit = async () => {
    if (faceImages.length < 5 || !plateBase64) {
      alert("Cần chụp ít nhất 5 ảnh khuôn mặt và 1 ảnh biển số.");
      return;
    }
    try {
      const { data, errors } = await logEntry({
        variables: { faceImages, plateImage: plateBase64 },
      });

      if (errors?.length || !data) {
        throw new Error(errors?.[0]?.message || "Không nhận diện được.");
      }

      const session = data.logEntry;
      const role = session.user.role;
      const time = session.checkinTime;

      if (role === "GUEST" && !session.user.vehicleType) {
        setPendingSubmitData({
          faceImages,
          plateImage: plateBase64,
          time,
          licensePlate: session.licensePlate,
        });
        setAskVehicleType(true);
        return;
      }

      setMessage(
        `✅ Vào lúc ${formatTime(time)} - ${session.licensePlate} (${role === "GUEST" ? "Vãng lai" : "Nhân viên"})`
      );
      handleResetSilent();
      onSuccess();
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage(`❌ ${err.message || "Lỗi không xác định."}`);
    }
  };

  const handleSubmitVehicleType = async () => {
    try {
      const { faceImages, plateImage, time, licensePlate } = pendingSubmitData;
      const { data, errors } = await logEntry({
        variables: {
          faceImages,
          plateImage,
          vehicleType,
        },
      });

      if (errors?.length || !data) {
        throw new Error(errors?.[0]?.message || "Gửi loại xe thất bại.");
      }

      setMessage(
        `✅ Vào lúc ${formatTime(time)} - ${licensePlate} (Vãng lai - ${vehicleType})`
      );
      handleResetSilent();
      onSuccess();
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage(`❌ ${err.message || "Lỗi gửi lại loại xe."}`);
    }
  };

  const formatTime = (t) =>
    new Date(t).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="mb-8 p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">🚗 Gửi xe (Vào)</h2>

      <label className="block font-medium mb-1">🧑 Khuôn mặt (≥ 5 ảnh)</label>
      <FaceAutoCapture
        key={captureKey}
        onCapture={handleAddFaceImage}
        maxCaptures={5}
      />
      <p className="text-sm text-gray-500 mt-1">Đã chụp: {faceImages.length} ảnh</p>

      {faceImages.length >= 5 ? (
        <>
          <label className="block font-medium mt-4">🚘 Ảnh biển số xe (qua camera)</label>
          <PlateCapture
            onCapture={(base64) => {
              setPlateBase64(base64);
              setPlatePreview(`data:image/jpeg;base64,${base64}`);
              setMessage("✅ Đã chụp ảnh biển số");
            }}
          />
          {platePreview && (
            <img
              src={platePreview}
              alt="plate"
              className="mt-2 max-h-40 rounded shadow"
            />
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-4">
          📷 Vui lòng chụp đủ 5 ảnh khuôn mặt trước khi chụp biển số.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={faceImages.length < 5 || !plateBase64}
        >
          Gửi xe
        </button>
        <button
          onClick={handleResetManual}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          🔁 Bắt đầu lại
        </button>
      </div>

      {askVehicleType && (
        <div className="mt-6 p-4 border rounded bg-yellow-50">
          <p className="mb-2 font-medium">🛵 Chọn loại xe cho khách vãng lai:</p>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="CAR">🚗 Ô tô</option>
            <option value="BIKE">🏍️ Xe máy</option>
          </select>
          <button
            onClick={handleSubmitVehicleType}
            className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
}
