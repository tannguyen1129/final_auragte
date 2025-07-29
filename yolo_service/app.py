from flask import Flask, request, jsonify
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import os
import easyocr

app = Flask(__name__)
model = YOLO("yolov8_lpr_best.pt")  # Load mô hình nhận diện biển số

# Khởi tạo OCR
ocr_reader = easyocr.Reader(['en'], gpu=False)

# Tạo thư mục debug crop
DEBUG_DIR = "debug_crops"
os.makedirs(DEBUG_DIR, exist_ok=True)

def decode_base64_to_image(base64_str):
    try:
        img_bytes = base64.b64decode(base64_str)
        img_np = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"[Decode] Error decoding base64: {e}")
        return None

def preprocess_for_ocr(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def clean_text(text):
    cleaned = text.strip().replace(" ", "").replace("-", "").replace(".", "").replace("\n", "").upper()
    return cleaned.replace("O", "0")  # ✅ sửa O thành 0

def run_easyocr(image):
    results = ocr_reader.readtext(image, detail=0)
    raw = " ".join(results)
    cleaned = clean_text(raw)
    return raw, cleaned

@app.route("/predict_plate", methods=["POST"])
def predict_plate():
    try:
        base64_img = request.json.get("image")
        img = decode_base64_to_image(base64_img)
        if img is None:
            return jsonify({"plate_found": False, "plate_text": "", "status": "error"}), 400

        results = model(img)
        plates = []

        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                if conf < 0.5:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                plate_img = img[y1:y2, x1:x2]

                if plate_img.size == 0:
                    continue

                # Save crop debug
                crop_path = os.path.join(DEBUG_DIR, f"plate_{x1}_{y1}_{x2}_{y2}.jpg")
                cv2.imwrite(crop_path, plate_img)
                print(f"[DEBUG] Saved crop: {crop_path}")

                gray = preprocess_for_ocr(plate_img)
                h, w = gray.shape

                # Phân loại: biển 2 hàng hay 1 hàng
                if h / w > 0.35:
                    print("[INFO] Likely 2-line plate → split top/bottom")
                    top_img = gray[0:h//2, :]
                    bottom_img = gray[h//2:, :]

                    top_raw, top_text = run_easyocr(top_img)
                    bottom_raw, bottom_text = run_easyocr(bottom_img)

                    print(f"[OCR] Top: '{top_raw}' → '{top_text}'")
                    print(f"[OCR] Bottom: '{bottom_raw}' → '{bottom_text}'")

                    full_plate = top_text + bottom_text
                else:
                    print("[INFO] Likely 1-line plate → OCR full")
                    full_raw, full_plate = run_easyocr(gray)
                    print(f"[OCR] Full: '{full_raw}' → '{full_plate}'")

                print(f"[POSTPROC] Final plate: {full_plate}")
                if full_plate:
                    plates.append(full_plate)

        return jsonify({
            "plate_found": bool(plates),
            "plate_text": plates[0] if plates else "",
            "plates": plates,
            "status": "success"
        }), 200

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({
            "plate_found": False,
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)
