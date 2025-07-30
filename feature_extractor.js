// feature_extractor.js

export function normalizeLandmarksIPD(landmarks, normalize=true) {
    const leftEyeIdx = 33;
    const rightEyeIdx = 263;
    const noseIdx = 1;

    const leftEye = landmarks[leftEyeIdx];
    const rightEye = landmarks[rightEyeIdx];
    const nose = landmarks[noseIdx];

    // Compute IPD (interpupillary distance)
    const ipd = Math.sqrt(
        (leftEye.x - rightEye.x)**2 +
        (leftEye.y - rightEye.y)**2 +
        (leftEye.z - rightEye.z)**2
    ) || 1e-6;  // avoid division by zero

    const refX = nose.x;
    const refY = nose.y;
    const refZ = nose.z;

    const normalizedLandmarks = [];

    landmarks.forEach(point => {
        let x = point.x;
        let y = point.y;
        let z = point.z;

        if (normalize) {
            x = (x - refX) / ipd;
            y = (y - refY) / ipd;
            z = (z - refZ) / ipd;
        }

        normalizedLandmarks.push(x, y, z);
    });

    return normalizedLandmarks; // returns an array of length 1404 (468 points * 3 coords)
}
