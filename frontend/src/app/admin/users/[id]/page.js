"use client";
import { useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      fullName
      email
      licensePlate
      role
    }
  }
`;

const GET_USER_HISTORY = gql`
  query GetUserHistory($userId: ID!) {
    getUserHistory(userId: $userId) {
      id
      licensePlate
      faceIdentity
      checkinTime
      checkoutTime
      status
    }
  }
`;

export default function UserDetailPage() {
  const { id } = useParams();

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { id },
  });

  const { data: historyData, loading: historyLoading } = useQuery(GET_USER_HISTORY, {
    variables: { userId: id },
  });

  if (userLoading || historyLoading) return <p className="p-8">Đang tải...</p>;

  const user = userData?.getUser;
  const sessions = historyData?.getUserHistory || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Chi tiết nhân viên</h1>
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <p><strong>Họ tên:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Biển số:</strong> {user.licensePlate || "–"}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">📜 Lịch sử gửi xe</h2>
      {sessions.length === 0 ? (
        <p>Không có lượt gửi xe nào.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Biển số</th>
              <th className="p-2 border">Khuôn mặt</th>
              <th className="p-2 border">Vào</th>
              <th className="p-2 border">Ra</th>
              <th className="p-2 border">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="p-2 border">{s.licensePlate}</td>
                <td className="p-2 border">{s.faceIdentity}</td>
                <td className="p-2 border">
                  {s.checkinTime ? new Date(s.checkinTime).toLocaleString() : "–"}
                </td>
                <td className="p-2 border">
                  {s.checkoutTime ? new Date(s.checkoutTime).toLocaleString() : "–"}
                </td>
                <td className="p-2 border">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
