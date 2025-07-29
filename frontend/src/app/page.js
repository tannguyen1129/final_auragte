"use client";
import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useAuth } from "@/store/auth";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend, 
  Tooltip,
  LineElement,
  PointElement,
  ArcElement
} from "chart.js";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  ArrowPathIcon,
  SparklesIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  UserPlusIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

ChartJS.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend, 
  Tooltip,
  LineElement,
  PointElement,
  ArcElement
);

const GET_STATS = gql`
  query GetStats($period: PeriodType!) {
    statsLogsByPeriod(period: $period) {
      label
      totalIn
      totalOut
    }
  }
`;

export default function Home() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("DAY");
  const [chartType, setChartType] = useState("bar");
  const [isAnimating, setIsAnimating] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_STATS, {
    variables: { period },
    skip: !user
  });

  const handlePeriodChange = async (newPeriod) => {
    if (!user) return;
    setIsAnimating(true);
    setPeriod(newPeriod);
    await refetch({ period: newPeriod });
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Calculate statistics
  const stats = data?.statsLogsByPeriod || [];
  const totalIn = stats.reduce((sum, item) => sum + (item.totalIn || 0), 0);
  const totalOut = stats.reduce((sum, item) => sum + (item.totalOut || 0), 0);
  const difference = totalIn - totalOut;
  const trend = difference > 0 ? 'up' : 'down';

  // Chart data configuration
  const chartData = {
    labels: stats.map(d => d.label) || [],
    datasets: [
      {
        label: "Lượt Gửi (IN)",
        data: stats.map(d => d.totalIn || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Lượt Lấy (OUT)",
        data: stats.map(d => d.totalOut || 0),
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const lineChartData = {
    ...chartData,
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      backgroundColor: dataset.backgroundColor.replace('0.8', '0.1'),
      tension: 0.4,
    }))
  };

  const doughnutData = {
    labels: ['Lượt Gửi', 'Lượt Lấy'],
    datasets: [{
      data: [totalIn, totalOut],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 3,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top",
        labels: {
          usePointStyle: true,
          font: { size: 12, weight: '500' },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: { size: 11 }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const periodOptions = [
    { value: "DAY", label: "Theo ngày", icon: ClockIcon },
    { value: "MONTH", label: "Theo tháng", icon: CalendarDaysIcon },
    { value: "YEAR", label: "Theo năm", icon: ChartBarIcon }
  ];

  const chartTypeOptions = [
    { value: "bar", label: "Cột", icon: ChartBarIcon },
    { value: "line", label: "Đường", icon: ArrowTrendingUpIcon },
    { value: "doughnut", label: "Tròn", icon: EyeIcon }
  ];

  const renderChart = () => {
    if (!user) return null;
    
    const chartProps = {
      data: chartType === 'doughnut' ? doughnutData : (chartType === 'line' ? lineChartData : chartData),
      options: chartType === 'doughnut' ? { ...chartOptions, scales: undefined } : chartOptions
    };

    switch (chartType) {
      case 'line':
        return <Line {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              Welcome to AuraGate
            </h1>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
                Smart Parking System powered by AI
              </p>
              
              {user && (
                <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">
                      {user.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Xin chào, <span className="text-blue-600">{user.fullName}</span>
                  </span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full uppercase">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-4 h-4" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
        {user ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Total In */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng lượt gửi</p>
                    <p className="text-3xl font-bold text-blue-600">{totalIn.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Out */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng lượt lấy</p>
                    <p className="text-3xl font-bold text-purple-600">{totalOut.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ArrowTrendingDownIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Difference */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chênh lệch</p>
                    <p className={`text-3xl font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(difference).toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {trend === 'up' ? (
                      <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Chart Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Thống kê gửi/lấy xe</h3>
                    <p className="text-gray-600 mt-1">Phân tích dữ liệu theo thời gian thực</p>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Period Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      {periodOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handlePeriodChange(option.value)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              period === option.value
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Chart Type Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      {chartTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setChartType(option.value)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              chartType === option.value
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                      </div>
                      <p className="text-red-600 font-medium">Lỗi khi tải thống kê</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`h-96 transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    {renderChart()}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Login CTA Section */
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <LockClosedIcon className="w-12 h-12 text-blue-600" />
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Đăng nhập để truy cập Dashboard
              </h3>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Đăng nhập để xem thống kê chi tiết, phân tích dữ liệu theo thời gian thực và quản lý hệ thống bãi đỗ xe thông minh.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/login"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>

              {/* Feature Preview */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: ChartBarIcon,
                    title: "Thống kê chi tiết",
                    description: "Xem báo cáo theo ngày, tháng, năm"
                  },
                  {
                    icon: ArrowPathIcon,
                    title: "Dữ liệu thời gian thực",
                    description: "Cập nhật liên tục 24/7"
                  },
                  {
                    icon: ShieldCheckIcon,
                    title: "Bảo mật cao",
                    description: "Dữ liệu được mã hóa an toàn"
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
