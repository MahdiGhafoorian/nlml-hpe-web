// main.js (ONNX version)
import { normalizeLandmarksIPD } from "./feature_extractor.js";
import { visualizeAxesOnFace } from "./draw_pose_axes.js";

let videoElement = document.getElementById("video");
let canvasElement = document.getElementById("output");
let canvasCtx = canvasElement.getContext("2d");

let model, faceMesh;
let prevCenter = null;

async function setup() {
  // Load ONNX model
  model = await ort.InferenceSession.create("model.onnx");

  // Load MediaPipe FaceMesh
  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,  // Still allows better face detail
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  faceMesh.onResults(onResults);

  // Start webcam
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

async function onResults(results) {
  console.log("⏱ Frame received");

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    console.log("😢 No face detected");
    canvasCtx.restore();
    return;
  }

  // ✅ Truncate to first 468 landmarks
  const landmarks = results.multiFaceLandmarks[0].slice(0, 468);
  console.log("🎯 Landmarks extracted");

  // Normalize and flatten landmarks
  const inputVector = normalizeLandmarksIPD(landmarks); // [1404]
  const inputTensor = new ort.Tensor("float32", new Float32Array(inputVector), [1, 1404]);

  try {
    const output = await model.run({ input: inputTensor });
    //console.log("🧠 Raw ONNX output:", output);
    const yawRad = output.output.data[0];
    const pitchRad = output.pitch_output.data[0];
    const rollRad = output.roll_output.data[0];

    const yaw = yawRad * (180 / Math.PI);
    const pitch = pitchRad * (180 / Math.PI);
    const roll = rollRad * (180 / Math.PI);

    console.log("✅ Pose:", { yaw, pitch, roll });

    // Draw pose axes
    prevCenter = visualizeAxesOnFace(canvasCtx, landmarks, yaw, pitch, roll, prevCenter);
  } catch (err) {
    console.error("🚨 ONNX Inference failed:", err);
  }

  canvasCtx.restore();
}

setup();
