function cosineSimilarity(vec1, vec2) {
  const dot = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  return dot / (norm1 * norm2);
}

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
  return vec.map((v) => v / norm);
}

function normalizePlate(plate) {
  return plate?.replace(/\s/g, "").toUpperCase();
}

// ✅ Tìm theo khuôn mặt
function findMatchingFace(users, inputEmbedding, threshold = 0.95) {
  const normalizedInput = normalize(inputEmbedding);

  for (let user of users) {
    if (!user || !Array.isArray(user.faceEmbeddings)) continue;

    for (let stored of user.faceEmbeddings) {
      if (!Array.isArray(stored)) continue;

      const score = cosineSimilarity(normalize(stored), normalizedInput);
      if (score > threshold) {
        console.log(`[✅ FACE MATCH] ${user.fullName} - score: ${score.toFixed(4)}`);
        return user;
      }
    }
  }

  console.warn("[❌ NO FACE MATCH]");
  return null;
}

// ✅ Tìm theo biển số
function findMatchingPlate(users, plateText) {
  const targetPlate = normalizePlate(plateText);

  for (let user of users) {
    if (!user || !Array.isArray(user.licensePlates)) continue;

    const match = user.licensePlates.some(
      (p) => normalizePlate(p) === targetPlate
    );

    if (match) {
      console.log(`[✅ PLATE MATCH] ${user.fullName} - plate: ${targetPlate}`);
      return user;
    }
  }

  console.warn("[❌ NO PLATE MATCH]");
  return null;
}

// ✅ Dùng nếu muốn xác minh đồng thời mặt & biển
function findBestMatchingUser(users, inputEmbedding, inputPlate, threshold = 0.95) {
  let bestUser = null;
  let bestScore = -1;
  const targetPlate = normalizePlate(inputPlate);
  const normalizedInput = normalize(inputEmbedding);

  for (let user of users) {
    if (!user || !Array.isArray(user.faceEmbeddings) || !Array.isArray(user.licensePlates)) continue;

    const plateMatch = user.licensePlates.some(
      (p) => normalizePlate(p) === targetPlate
    );
    if (!plateMatch) continue;

    for (let storedEmbedding of user.faceEmbeddings) {
      if (!Array.isArray(storedEmbedding)) continue;
      const normalizedStored = normalize(storedEmbedding);
      const score = cosineSimilarity(normalizedStored, normalizedInput);

      console.log(`[DEBUG] ${user.fullName} - score: ${score.toFixed(4)}`);
      if (score > threshold && score > bestScore) {
        bestUser = user;
        bestScore = score;
      }
    }
  }

  if (bestUser) {
    console.log(`[✅ FACE+PLATE MATCH] ${bestUser.fullName} - Score: ${bestScore}`);
  } else {
    console.warn("[❌ NO FACE+PLATE MATCH]");
  }

  return bestUser;
}

module.exports = {
  findMatchingFace,
  findMatchingPlate,
  findBestMatchingUser
};
