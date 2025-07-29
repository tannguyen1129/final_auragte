"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import FaceAutoCapture from "@/components/FaceAutoCapture";
import PlateCapture from "@/components/PlateCapture";

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

export default function ExitForm({ faceImage, setFaceImage, setMessage, onSuccess }) {
  const [plateBase64, setPlateBase64] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [logExit] = useMutation(LOG_EXIT);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const formatTime = (t) =>
    new Date(t).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

  const handleSubmit = async () => {
    if (!faceImage || !plateBase64) {
      alert("Vui lòng chụp ảnh mặt và ảnh biển số.");
      return;
    }
    try {
      const { data, errors } = await logExit({
        variables: { faceImage, plateImage: plateBase64 }
      });

      if (errors?.length || !data) {
        throw new Error(errors?.[0]?.message || "Không nhận diện được.");
      }

      const session = data.logExit;
      const role = session.user.role;
      const type = session.vehicleType; // ✅ lấy từ session, không từ user
      const time = session.checkoutTime;

      const roleLabel = role === "GUEST" ? "Vãng lai" : "Nhân viên";
      const typeLabel = type === "CAR" ? "CAR" : type === "BIKE" ? "BIKE" : "Khác";

      setMessage(
        `✅ Ra lúc ${formatTime(time)} - ${session.licensePlate} (${roleLabel} - ${typeLabel})`
      );

      // Reset
      setPlateBase64(null);
      setPlatePreview(null);
      setFaceImage("");
      setCameraEnabled(true);
      onSuccess();
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage(`❌ ${err.message || "Lỗi không xác định."}`);
    }
  };

  return (
    <div className="mb-8 p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">🏁 Lấy xe (Ra)</h2>

      <label className="block font-medium mb-1">🧑 Khuôn mặt (Camera - 1 ảnh)</label>
      {cameraEnabled ? (
        <FaceAutoCapture
          onCapture={(base64) => {
            setFaceImage(base64);
            setMessage("✅ Đã chụp ảnh khuôn mặt");
            setCameraEnabled(false);
          }}
        />
      ) : (
        <button
          onClick={() => {
            setFaceImage("");
            setCameraEnabled(true);
            setMessage("🔁 Mở lại camera, vui lòng chụp lại");
          }}
          className="mt-2 px-3 py-1 rounded bg-gray-300 text-black text-sm"
        >
          Mở lại camera
        </button>
      )}

      {faceImage ? (
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
            <img src={platePreview} alt="plate" className="mt-2 max-h-40 rounded shadow" />
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-4">
          📷 Vui lòng chụp ảnh khuôn mặt trước khi chụp biển số.
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        disabled={!faceImage || !plateBase64}
      >
        Lấy xe
      </button>
    </div>
  );
}
