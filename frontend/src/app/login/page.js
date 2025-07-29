"use client";

import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        fullName
        role
      }
    }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION);
  const { login } = useAuth();
  const router = useRouter();

  // Form validation
  const emailError = isSubmitted && !email ? "Email không được để trống" : 
                    isSubmitted && !/\S+@\S+\.\S+/.test(email) ? "Email không hợp lệ" : null;
  const passwordError = isSubmitted && !password ? "Mật khẩu không được để trống" : 
                       isSubmitted && password.length < 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError(null);

    // Validate form
    if (!email || !password || emailError || passwordError) {
      return;
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });
      const { token, user } = data.loginUser;
      login(token, user);

      // Show success state
      setIsSuccess(true);

      // Redirect to home page after brief delay
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      console.error("Login error:", err);
    }
  };

  // Auto-clear error when user types
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                  isSuccess 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600'
                }`}>
                  {isSuccess ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <SparklesIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full transition-all duration-500 ${
                  isSuccess ? 'bg-green-400 animate-ping' : 'bg-green-500 animate-pulse'
                }`}></div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              {isSuccess ? "Đăng nhập thành công!" : "Đăng nhập"}
            </h1>
            <p className="text-gray-600">
              {isSuccess ? (
                "Đang chuyển hướng về trang chủ..."
              ) : (
                <>
                  Chào mừng trở lại với <span className="font-semibold text-blue-600">AuraGate</span>
                </>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    emailError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  } ${isSuccess ? 'opacity-50' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={loading || isSuccess}
                />
              </div>
              {emailError && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  } ${isSuccess ? 'opacity-50' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={loading || isSuccess}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isSuccess}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 text-sm font-medium">
                    Đăng nhập thành công! Đang chuyển về trang chủ...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !isSuccess && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSuccess}
              className={`w-full group relative overflow-hidden font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              } ${
                loading || isSuccess
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Thành công!</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
              
              {!loading && !isSuccess && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>

            {/* Forgot Password */}
            {!isSuccess && (
              <div className="text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Sign Up Link */}
        {!isSuccess && (
          <div className="mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Bảo mật cao</p>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
            <UserIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Dễ sử dụng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
