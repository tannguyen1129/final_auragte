# utils/image.py
import base64
import numpy as np
import cv2

def decode_base64_image(base64_str):
    try:
        img_bytes = base64.b64decode(base64_str)
        img_np = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if image is None or image.size == 0 or image.shape[0] == 0 or image.shape[1] == 0:
            raise ValueError("Invalid image")

        return image.copy()  # 💥 BẮT BUỘC để tránh lỗi double free
    except Exception as err:
        print(f"[ERROR] decode_base64_image: {err}")
        return None
