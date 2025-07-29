"use client";
import Link from "next/link";
import { 
  HeartIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AuraGate
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Nền tảng quản lý hiện đại, mang đến trải nghiệm tốt nhất cho doanh nghiệp của bạn.
              </p>
              <div className="flex space-x-4">
                {/* Social Links */}
                {[1, 2, 3, 4].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Liên kết nhanh</h3>
              <nav className="space-y-3">
                {[
                  { label: "Trang chủ", href: "/" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Tính năng", href: "/features" },
                  { label: "Về chúng tôi", href: "/about" }
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Pháp lý</h3>
              <nav className="space-y-3">
                {[
                  { label: "Điều khoản sử dụng", href: "/terms", icon: DocumentTextIcon },
                  { label: "Chính sách bảo mật", href: "/privacy", icon: ShieldCheckIcon },
                  { label: "Cookies Policy", href: "/cookies", icon: GlobeAltIcon }
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Liên hệ</h3>
              <div className="space-y-4">
                {[
                  { icon: EnvelopeIcon, label: "support@auragate.com", href: "mailto:support@auragate.com" },
                  { icon: PhoneIcon, label: "+84 123 456 789", href: "tel:+84123456789" },
                  { icon: MapPinIcon, label: "Hà Nội, Việt Nam", href: "#" }
                ].map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={contact.label}
                      href={contact.href}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm group"
                    >
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{contact.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} AuraGate. All rights reserved.</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                <span>in Vietnam</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              
              <Link 
                href="/status" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Status Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 group"
        aria-label="Back to top"
      >
        <svg 
          className="w-6 h-6 mx-auto group-hover:-translate-y-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}
