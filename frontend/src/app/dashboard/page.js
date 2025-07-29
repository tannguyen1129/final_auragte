"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import EntryForm from "@/components/EntryForm";
import ExitForm from "@/components/ExitForm";
import { gql, useQuery } from "@apollo/client";

const PARKING_STATS = gql`
  query {
    parkingStats {
      carIn
      bikeIn
      totalCarSlots
      totalBikeSlots
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // 'entry' | 'exit'
  const [exitFace, setExitFace] = useState("");
  const [message, setMessage] = useState("");

  // 📦 Query số lượng slot
  const { data, loading, error, refetch } = useQuery(PARKING_STATS);

  // 🧠 Tính số slot còn lại
  const carRemaining = data
    ? data.parkingStats.totalCarSlots - data.parkingStats.carIn
    : 0;
  const bikeRemaining = data
    ? data.parkingStats.totalBikeSlots - data.parkingStats.bikeIn
    : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chào {user?.fullName} 👋</h1>

      {/* 🅿️ Hiển thị trạng thái bãi xe */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">📊 Trạng thái bãi xe</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">❌ Lỗi tải dữ liệu bãi xe</p>
        ) : (
          <ul className="text-sm space-y-1">
            <li>🚗 Ô tô còn lại: <strong>{carRemaining}</strong> / {data.parkingStats.totalCarSlots}</li>
            <li>🏍️ Xe máy còn lại: <strong>{bikeRemaining}</strong> / {data.parkingStats.totalBikeSlots}</li>
          </ul>
        )}
      </div>

      {/* Nút chọn mode */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            setMessage("");
            setMode("entry");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🚗 Gửi xe
        </button>
        <button
          onClick={() => {
            setMessage("");
            setMode("exit");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          🏁 Lấy xe
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div className="p-3 border rounded bg-gray-100 text-sm mb-6">
          {message}
        </div>
      )}

      {/* Form gửi hoặc lấy */}
      {mode === "entry" && (
        <EntryForm
          setMessage={setMessage}
          onSuccess={() => {
            setMode(null);
            refetch(); // 🔄 reload trạng thái bãi xe
          }}
        />
      )}

      {mode === "exit" && (
        <ExitForm
          faceImage={exitFace}
          setFaceImage={setExitFace}
          setMessage={setMessage}
          onSuccess={() => {
            setMode(null);
            refetch(); // 🔄 reload trạng thái bãi xe
          }}
        />
      )}
    </div>
  );
}
