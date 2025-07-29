"use client";
import { useEffect, useRef, useState } from "react";

export default function PlateCapture({ onCapture, autoDelay = 3000 }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("🔄 Đang khởi động camera...");
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        setStatus("🟢 Đã mở camera, sẽ tự chụp ảnh sau vài giây...");
        setTimeout(handleAutoCapture, autoDelay); // ✅ tự động chụp
      } catch (err) {
        console.error("Không thể mở camera:", err);
        setStatus("❌ Lỗi mở camera");
      }
    };
    init();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleAutoCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
    onCapture(base64);
    setCaptured(true);
    setStatus("📸 Đã chụp ảnh biển số");
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-h-48 rounded shadow mb-2"
      />
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
}
