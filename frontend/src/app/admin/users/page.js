"use client";
import { gql, useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import { useAuth } from "@/store/auth";

const GET_ALL_USERS = gql`
  query {
    getAllUsers {
      id
      fullName
      email
      licensePlates  
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export default function AdminUserListPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);
  const [deleteUser] = useMutation(DELETE_USER);

  if (!user || user.role !== "ADMIN") {
    return <p className="p-8">⛔ Không có quyền truy cập.</p>;
  }

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá nhân viên này?")) return;
    try {
      await deleteUser({ variables: { id } });
      await refetch();
    } catch (err) {
      alert("❌ Lỗi khi xoá");
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👥 Quản lý nhân viên</h1>
        <Link
          href="/admin/users/create"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Thêm nhân viên
        </Link>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p>❌ Lỗi: {error.message}</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Họ tên</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Biển số</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.getAllUsers.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.fullName}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  {u.licensePlates?.length ? u.licensePlates.join(", ") : "–"}
                </td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border space-x-2">
                  <Link
                    href={`/admin/users/edit/${u.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    📝 Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
