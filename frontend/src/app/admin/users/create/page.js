"use client";
import { useState, useRef, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      id
    }
  }
`;

export default function CreateUserPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    vehicleType: "CAR", // ✅ mặc định là CAR
  });

  const [faceImages, setFaceImages] = useState([]);
  const [plateImageFile, setPlateImageFile] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [registerUser] = useMutation(REGISTER_USER);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      setStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const captureFaceImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
    setFaceImages((prev) => [...prev, base64]);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlateChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPlatePreview(url);
    setPlateImageFile(file);
  };

  const handleSubmit = async () => {
    if (faceImages.length < 5) {
      alert("Cần chụp ít nhất 5 ảnh khuôn mặt.");
      return;
    }

    if (!plateImageFile) {
      alert("Vui lòng chọn ảnh biển số.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const plateBase64 = reader.result.split(",")[1];

      try {
        await registerUser({
          variables: {
            input: {
              ...form,
              faceImages,
              plateImage: plateBase64,
            },
          },
        });
        setMessage("✅ Tạo nhân viên thành công");
        setTimeout(() => router.push("/admin/users"), 1500);
      } catch (err) {
        console.error(err);
        setMessage("❌ Lỗi khi tạo nhân viên");
      }
    };

    reader.readAsDataURL(plateImageFile);
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">📷 Đăng ký nhân viên mới</h1>

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
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mật khẩu"
        className="w-full p-2 border mb-3 rounded"
      />

      {/* ✅ Chọn loại xe */}
      <label className="block font-medium mt-2 mb-1">🚘 Loại xe</label>
      <select
        name="vehicleType"
        value={form.vehicleType}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded"
      >
        <option value="CAR">🚗 Ô tô</option>
        <option value="BIKE">🏍️ Xe máy</option>
      </select>

      <label className="block font-medium mb-1">
        📷 Khuôn mặt (Chụp ≥ 5 ảnh)
      </label>

      {stream ? (
        <>
          <video ref={videoRef} autoPlay className="w-full rounded mb-2" />
          <div className="flex gap-2 mb-2">
            <button
              onClick={captureFaceImage}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              📸 Chụp ảnh
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ❌ Tắt camera
            </button>
          </div>
        </>
      ) : (
        <div className="mb-3">
          <div className="text-gray-500 italic mb-2">Camera đã tắt</div>
          <button
            onClick={startCamera}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            🔄 Mở lại camera
          </button>
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        Đã chụp: {faceImages.length} ảnh
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <label className="block font-medium mb-1">📸 Ảnh biển số xe</label>
      <input
        type="file"
        accept="image/*"
        onChange={handlePlateChange}
        className="mb-2"
      />
      {platePreview && (
        <img
          src={platePreview}
          className="w-32 h-32 rounded object-cover mb-4"
        />
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Tạo nhân viên
      </button>

      {message && (
        <div className="mt-4 p-2 bg-gray-100 border text-sm">{message}</div>
      )}
    </div>
  );
}
