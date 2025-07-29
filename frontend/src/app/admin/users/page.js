"use client";
import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon
} from "@heroicons/react/24/outline";

// GraphQL
const GET_ALL_USERS = gql`
  query GetAllUsers {
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

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Đang tải...</span>
  </div>
);

const EmptyState = ({ searchTerm }) => (
  <div className="text-center py-12 text-gray-500">
    <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-medium mb-2">
      {searchTerm ? "Không tìm thấy nhân viên" : "Chưa có nhân viên"}
    </h3>
    <p className="text-sm">
      {searchTerm 
        ? `Không có kết quả cho "${searchTerm}"`
        : "Hãy thêm nhân viên đầu tiên"
      }
    </p>
  </div>
);

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: "bg-red-100 text-red-700 border border-red-200",
    EMPLOYEE: "bg-blue-100 text-blue-700 border border-blue-200",
    GUEST: "bg-gray-100 text-gray-700 border border-gray-200"
  };
  
  const icons = {
    ADMIN: <ShieldCheckIcon className="w-3 h-3 mr-1" />,
    EMPLOYEE: <UserIcon className="w-3 h-3 mr-1" />,
    GUEST: <UserIcon className="w-3 h-3 mr-1" />
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
      {icons[role]}
      {role}
    </span>
  );
};

const DeleteModal = ({ show, onClose, onConfirm, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa nhân viên này? 
          <br />
          <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function AdminUserListPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);
  const [deleteUser] = useMutation(DELETE_USER);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  const [deleting, setDeleting] = useState(false);

  // Auth check
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  // Data processing
  const users = data?.getAllUsers?.filter(u => u.role !== "GUEST") || [];
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleDeleteClick = (userId) => {
    setDeleteModal({ show: true, userId });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteUser({ variables: { id: deleteModal.userId } });
      await refetch();
      setDeleteModal({ show: false, userId: null });
    } catch (err) {
      alert(`Lỗi khi xóa: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, userId: null });
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Tổng cộng {users.length} nhân viên
                </p>
              </div>
            </div>
            
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:scale-105 transition-transform shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm nhân viên
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Biển số xe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quyền
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.licensePlates?.length ? (
                          <div className="space-y-1">
                            {user.licensePlates.map((plate, index) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-mono">
                                {plate}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <Link
                          href={`/admin/users/edit/${user.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
