"use client";
import { gql, useQuery } from "@apollo/client";
import { useAuth } from "@/store/auth";

const GET_ALL_SESSIONS = gql`
  query GetAllSessions {
    getAllSessions {
      id
      user {
        fullName
        email
      }
      licensePlate
      faceIdentity
      checkinTime
      checkoutTime
      status
    }
  }
`;

export default function AdminSessionsPage() {
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_ALL_SESSIONS);

  if (!user || user.role !== "ADMIN") {
    return <p className="p-8">⛔ Bạn không có quyền truy cập trang này.</p>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Quản lý lịch sử gửi xe</h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p>❌ Có lỗi xảy ra: {error.message}</p>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Người gửi</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Biển số</th>
              <th className="p-2 border">Face</th>
              <th className="p-2 border">Vào</th>
              <th className="p-2 border">Ra</th>
              <th className="p-2 border">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data?.getAllSessions.map((session) => (
              <tr key={session.id}>
                <td className="p-2 border">{session.user.fullName}</td>
                <td className="p-2 border">{session.user.email}</td>
                <td className="p-2 border">{session.licensePlate}</td>
                <td className="p-2 border">{session.faceIdentity}</td>
                <td className="p-2 border">{session.checkinTime ? new Date(session.checkinTime).toLocaleString() : "-"}</td>
                <td className="p-2 border">{session.checkoutTime ? new Date(session.checkoutTime).toLocaleString() : "-"}</td>
                <td className="p-2 border">{session.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
