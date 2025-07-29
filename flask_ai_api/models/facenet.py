import face_recognition
import numpy as np


def extract_face_embedding(image: np.ndarray) -> np.ndarray | None:
    """
    Detect face and extract 128-d embedding using face_recognition.
    """
    try:
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return None

        encodings = face_recognition.face_encodings(image, known_face_locations=face_locations)
        if not encodings:
            return None

        return encodings[0]
    except Exception as e:
        print(f"[ERROR] extract_face_embedding: {e}")
        return None
