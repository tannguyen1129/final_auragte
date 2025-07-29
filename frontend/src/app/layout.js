"use client";
import "./globals.css";
import { useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apollo-client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/store/auth";

export default function RootLayout({ children }) {
  const { loadUser } = useAuth();

  // ✅ Tự động gọi loadUser khi app khởi động
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <ApolloProvider client={client}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ApolloProvider>
      </body>
    </html>
  );
}
