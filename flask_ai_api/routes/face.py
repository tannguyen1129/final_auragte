from flask import Blueprint, request, jsonify
from models.facenet import extract_face_embedding
from utils.image import decode_base64_image

face_bp = Blueprint("face", __name__)

@face_bp.route("/predict/face", methods=["POST"])
def predict_face():
    try:
        base64_img = request.json.get("image")
        img = decode_base64_image(base64_img)
        embedding = extract_face_embedding(img)

        if embedding is None:
            return jsonify({"face_found": False}), 200

        return jsonify({
            "face_found": True,
            "embedding": embedding.tolist()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
