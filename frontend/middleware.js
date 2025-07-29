import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode"; // npm i jwt-decode

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  // ❌ Nếu không có token → về trang đăng nhập
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    // ❌ Nếu là user thường → chặn vào /admin/*
    if (request.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next(); // ✅ Cho đi tiếp
  } catch (err) {
    console.error("Middleware decode error:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
