"use client";
import { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      fullName
      email
      licensePlates
      vehicleType
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
    }
  }
`;

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading } = useQuery(GET_USER, { variables: { id } });
  const [updateUser] = useMutation(UPDATE_USER);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    licensePlates: [],
    vehicleType: "CAR",
  });

  const [newPlate, setNewPlate] = useState("");
  const [newType, setNewType] = useState("CAR");

  useEffect(() => {
    if (data?.getUser) {
      setForm({
        fullName: data.getUser.fullName,
        email: data.getUser.email,
        licensePlates: data.getUser.licensePlates || [],
        vehicleType: data.getUser.vehicleType || "CAR",
      });
    }
  }, [data]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddPlate = () => {
    const plate = newPlate.trim().toUpperCase();
    if (plate && !form.licensePlates.includes(plate)) {
      setForm({
        ...form,
        licensePlates: [...form.licensePlates, plate],
      });
      setNewPlate("");
    }
  };

  const handleRemovePlate = (plate) => {
    setForm({
      ...form,
      licensePlates: form.licensePlates.filter((p) => p !== plate),
    });
  };

  const handleSubmit = async () => {
    try {
      await updateUser({
        variables: {
          id,
          input: {
            fullName: form.fullName,
            email: form.email,
            licensePlates: form.licensePlates,
            vehicleType: form.vehicleType,
          },
        },
      });
      alert("✅ Cập nhật thành công");
      router.push("/users");
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật thất bại");
    }
  };

  if (loading) return <p className="p-8">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">📝 Chỉnh sửa nhân viên</h1>

      <input
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        placeholder="Họ tên"
        className="w-full p-2 border mb-3 rounded"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border mb-3 rounded"
      />

      <div className="mb-4">
        <label className="block font-medium mb-1">Biển số xe</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
            placeholder="VD: 51A-12345"
            className="flex-1 p-2 border rounded"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="CAR">🚗 Ô tô</option>
            <option value="BIKE">🏍️ Xe máy</option>
          </select>
          <button
            onClick={handleAddPlate}
            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
          >
            Thêm
          </button>
        </div>

        <ul className="mt-2">
          {form.licensePlates.map((plate, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-gray-100 px-2 py-1 mt-1 rounded"
            >
              {plate}
              <button
                onClick={() => handleRemovePlate(plate)}
                className="text-red-500 hover:underline"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-1">Loại xe mặc định</label>
        <select
          name="vehicleType"
          value={form.vehicleType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="CAR">🚗 Ô tô</option>
          <option value="BIKE">🏍️ Xe máy</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Lưu thay đổi
      </button>
    </div>
  );
}
