"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import EntryForm from "@/components/EntryForm";
import ExitForm from "@/components/ExitForm";
import { gql, useQuery } from "@apollo/client";
import {
  TruckIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon, // Sử dụng icon này thay cho RefreshIcon!
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

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
  const [messageType, setMessageType] = useState("info"); // 'success' | 'error' | 'info'

  const { data, loading, error, refetch } = useQuery(PARKING_STATS, {
    pollInterval: 30000,
  });

  // Tính slot còn lại
  const carRemaining = data
    ? data.parkingStats.totalCarSlots - data.parkingStats.carIn
    : 0;
  const bikeRemaining = data
    ? data.parkingStats.totalBikeSlots - data.parkingStats.bikeIn
    : 0;

  // Phần trăm sử dụng
  const carUsagePercent = data
    ? Math.round((data.parkingStats.carIn / data.parkingStats.totalCarSlots) * 100)
    : 0;
  const bikeUsagePercent = data
    ? Math.round((data.parkingStats.bikeIn / data.parkingStats.totalBikeSlots) * 100)
    : 0;

  // Giao diện message alert
  const setSuccessMessage = (msg) => {
    setMessage(msg);
    setMessageType("success");
  };
  const setErrorMessage = (msg) => {
    setMessage(msg);
    setMessageType("error");
  };
  const setInfoMessage = (msg) => {
    setMessage(msg);
    setMessageType("info");
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const getMessageIcon = () => {
    switch (messageType) {
      case "success": return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "error": return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
    }
  };
  const getMessageBgColor = () => {
    switch (messageType) {
      case "success": return "bg-green-50 border-green-200 text-green-800";
      case "error": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chào mừng,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {user?.fullName}
                  </span>{" "}
                  👋
                </h1>
                <p className="text-gray-600 mt-1">Quản lý bãi đỗ xe thông minh</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">Hoạt động</span>
              </div>
              <button
                onClick={() => refetch()}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white transition-all duration-200 group"
                title="Làm mới dữ liệu"
              >
                {/* Đổi RefreshIcon -> ArrowPathIcon */}
                <ArrowPathIcon className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Parking Stats */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Trạng thái bãi xe</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Cập nhật real-time</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium mb-3">❌ Lỗi tải dữ liệu bãi xe</p>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ô tô */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <TruckIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Ô tô</h3>
                          <p className="text-sm text-gray-600">Chỗ đỗ xe ô tô</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{carRemaining}</p>
                        <p className="text-sm text-gray-500">còn lại</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Sử dụng: {data?.parkingStats.carIn} / {data?.parkingStats.totalCarSlots}
                        </span>
                        <span className="font-medium text-gray-900">{carUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${carUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {/* Xe máy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          {/* Bike icon có thể tuỳ biến */}
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 5a2 2 0 012-2h1a1 1 0 000 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 100-2h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Xe máy</h3>
                          <p className="text-sm text-gray-600">Chỗ đỗ xe máy</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{bikeRemaining}</p>
                        <p className="text-sm text-gray-500">còn lại</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Sử dụng: {data?.parkingStats.bikeIn} / {data?.parkingStats.totalBikeSlots}
                        </span>
                        <span className="font-medium text-gray-900">{bikeUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${bikeUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setMessage("");
                setMode("entry");
              }}
              className={`flex-1 group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 ${
                mode === "entry"
                  ? "ring-4 ring-green-200 scale-105"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <ArrowRightOnRectangleIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Gửi xe</span>
              </div>
            </button>
            <button
              onClick={() => {
                setMessage("");
                setMode("exit");
              }}
              className={`flex-1 group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 ${
                mode === "exit"
                  ? "ring-4 ring-red-200 scale-105"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <ArrowLeftOnRectangleIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Lấy xe</span>
              </div>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-8 border rounded-2xl p-4 ${getMessageBgColor()}`}>
            <div className="flex items-start space-x-3">
              {getMessageIcon()}
              <div className="flex-1">
                <p className="font-medium">{message}</p>
              </div>
              <button
                onClick={() => setMessage("")}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Forms Section */}
        {(mode === "entry" || mode === "exit") && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                {mode === "entry" ? (
                  <>
                    <ArrowRightOnRectangleIcon className="w-6 h-6 text-green-600" />
                    <span>Gửi xe</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftOnRectangleIcon className="w-6 h-6 text-red-600" />
                    <span>Lấy xe</span>
                  </>
                )}
              </h3>
            </div>
            <div className="p-6">
              {mode === "entry" && (
                <EntryForm
                  setMessage={setSuccessMessage}
                  onSuccess={() => {
                    setMode(null);
                    refetch();
                  }}
                />
              )}
              {mode === "exit" && (
                <ExitForm
                  faceImage={exitFace}
                  setFaceImage={setExitFace}
                  setMessage={setErrorMessage}
                  onSuccess={() => {
                    setMode(null);
                    refetch();
                  }}
                />
              )}
              {/* Cancel Button */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMode(null);
                    setMessage("");
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
