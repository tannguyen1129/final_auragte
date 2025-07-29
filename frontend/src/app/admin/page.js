"use client";
import { useAuth } from "@/store/auth";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard - {user?.fullName}</h1>
    </div>
  );
}
