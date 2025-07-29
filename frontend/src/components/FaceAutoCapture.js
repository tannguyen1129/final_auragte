"use client";
import { useEffect, useRef, useState } from "react";

export default function FaceAutoCapture({ onCapture, maxCaptures = 5 }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("🔄 Đang khởi động camera...");
  const [faceapiLoaded, setFaceapiLoaded] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Khởi động camera & load face-api
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") return;

      const faceapi = await import("@vladmandic/face-api");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setFaceapiLoaded(true);
      setStatus("🟢 Đã mở camera, đang chờ khuôn mặt...");
    };

    init();

    return () => {
      clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Detect khuôn mặt liên tục
  useEffect(() => {
    if (!faceapiLoaded || !videoRef.current) return;

    const runDetection = async () => {
      const faceapi = await import("@vladmandic/face-api");

      intervalRef.current = setInterval(async () => {
        if (capturedCount >= maxCaptures) {
          setStatus(`✅ Đã chụp đủ ${maxCaptures} ảnh.`);
          clearInterval(intervalRef.current);
          return;
        }

        const result = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (result) {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0);
          const base64 = canvas.toDataURL("image/jpeg").split(",")[1];

          onCapture(base64);
          setCapturedCount((prev) => prev + 1);
          setStatus(`📸 Đã chụp ${capturedCount + 1} / ${maxCaptures} ảnh`);
        }
      }, 1000);
    };

    runDetection();

    return () => clearInterval(intervalRef.current);
  }, [faceapiLoaded, capturedCount, maxCaptures]);

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
