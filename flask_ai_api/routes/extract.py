from flask import Blueprint, request, jsonify
import base64
import cv2
import numpy as np
import traceback
import requests

from routes.face import extract_face_embedding

extract_bp = Blueprint("extract", __name__)

# --------------------------
# Tiện ích: decode base64
# --------------------------
def decode_base64_to_image(base64_str):
    try:
        img_bytes = base64.b64decode(base64_str)
        img_np = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        return image
    except Exception as err:
        print(f"[ERROR] decode_base64_to_image failed: {err}")
        return None

# --------------------------
# Gọi YOLO detect plate
# --------------------------
def call_yolo_service(base64_img: str):
    try:
        response = requests.post(
            "http://localhost:6000/predict_plate",
            json={"image": base64_img},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        print(f"[YOLO RESPONSE] {data}")

        plate_text = data.get("plate_text", "")
        plate_found = data.get("plate_found", bool(plate_text))

        return plate_text, plate_found
    except Exception as e:
        print(f"[ERROR] Failed to call YOLO service: {e}")
        return "", False

# --------------------------
# /extract_face
# --------------------------
@extract_bp.route("/extract_face", methods=["POST"])
def extract_face():
    try:
        print("[INFO] /extract_face called")
        data = request.get_json()

        face_data = data.get("face_image")
        if not face_data:
            return jsonify({"error": "Missing face image"}), 400

        face_img = decode_base64_to_image(face_data)
        if face_img is None:
            return jsonify({"error": "Invalid face image"}), 400

        face_embedding = extract_face_embedding(face_img)

        return jsonify({
            "face_found": face_embedding is not None,
            "embedding": face_embedding.tolist() if face_embedding is not None else [],
            "status": "success"
        })

    except Exception as e:
        print(f"[EXCEPTION] /extract_face failed: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# --------------------------
# /extract_plate
# --------------------------
@extract_bp.route("/extract_plate", methods=["POST"])
def extract_plate():
    try:
        print("[INFO] /extract_plate called")
        data = request.get_json()

        plate_data = data.get("plate_image")
        if not plate_data:
            return jsonify({"error": "Missing plate image"}), 400

        plate_text, found = call_yolo_service(plate_data)

        return jsonify({
            "plate_found": found,
            "plate_text": plate_text,
            "status": "success"
        })

    except Exception as e:
        print(f"[EXCEPTION] /extract_plate failed: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# --------------------------
# /extract_features
# --------------------------
@extract_bp.route("/extract_features", methods=["POST"])
def extract_features():
    try:
        print("[INFO] /extract_features called")
        data = request.get_json()

        face_images = data.get("face_images")
        plate_data = data.get("plate_image")

        if not face_images or not isinstance(face_images, list) or len(face_images) == 0:
            return jsonify({"error": "Missing or invalid face_images list"}), 400
        if not plate_data:
            return jsonify({"error": "Missing plate image"}), 400

        all_embeddings = []
        for idx, face_base64 in enumerate(face_images):
            face_img = decode_base64_to_image(face_base64)
            if face_img is None:
                print(f"[WARNING] Skipping face image {idx} (decode failed)")
                continue
            embedding = extract_face_embedding(face_img)
            if embedding is not None:
                all_embeddings.append(embedding)
            else:
                print(f"[WARNING] No embedding found for image {idx}")

        if not all_embeddings:
            return jsonify({
                "face_found": False,
                "embeddings": [],
                "plate_found": False,
                "plate_text": "",
                "status": "failed"
            }), 200

        plate_text, plate_found = call_yolo_service(plate_data)

        return jsonify({
            "face_found": True,
            "embeddings": [vec.tolist() for vec in all_embeddings],
            "plate_found": plate_found,
            "plate_text": plate_text,
            "status": "success"
        })

    except Exception as e:
        print(f"[EXCEPTION] /extract_features failed: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
