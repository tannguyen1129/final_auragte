import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask
from flask_cors import CORS

# ✅ Import các blueprint
from routes.extract import extract_bp
from routes.face import face_bp  # giữ nếu bạn có route riêng cho nhận diện khuôn mặt

# ✅ Khởi tạo Flask app
app = Flask(__name__)
CORS(app)

# ✅ Đăng ký các route
app.register_blueprint(extract_bp)  # chứa: /extract_face, /extract_plate, /extract_features
app.register_blueprint(face_bp)     # (tuỳ chọn) nếu bạn vẫn cần

# ✅ Chạy server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
