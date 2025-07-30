// draw_pose_axes.js

export function visualizeAxesOnFace(ctx, landmarks, yaw, pitch, roll, prevCenter, maxJump=100, size=80) {
    const toRadians = angle => angle * Math.PI / 180;

    pitch = toRadians(pitch);
    yaw = -toRadians(yaw);
    roll = toRadians(roll);

    const noseIdx = 1;
    const leftEyeIdx = 33;
    const rightEyeIdx = 263;

    const imageWidth = ctx.canvas.width;
    const imageHeight = ctx.canvas.height;

    const nose = landmarks[noseIdx];
    const leftEye = landmarks[leftEyeIdx];
    const rightEye = landmarks[rightEyeIdx];

    const newX = (nose.x + leftEye.x + rightEye.x) * imageWidth / 3;
    const newY = (nose.y + leftEye.y + rightEye.y) * imageHeight / 3;

    let tdx, tdy;
    if (!prevCenter) {
        [tdx, tdy] = [newX, newY];
    } else {
        const dist = Math.hypot(newX - prevCenter[0], newY - prevCenter[1]);
        [tdx, tdy] = dist > maxJump ? prevCenter : [newX, newY];
    }

    // X-axis (Red)
    const x1 = size * (Math.cos(yaw) * Math.cos(roll)) + tdx;
    const y1 = size * (Math.cos(pitch) * Math.sin(roll) + Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw)) + tdy;

    // Y-axis (Green)
    const x2 = size * (-Math.cos(yaw) * Math.sin(roll)) + tdx;
    const y2 = size * (Math.cos(pitch) * Math.cos(roll) - Math.sin(pitch) * Math.sin(yaw) * Math.sin(roll)) + tdy;

    // Z-axis (Blue)
    const x3 = size * (Math.sin(yaw)) + tdx;
    const y3 = size * (-Math.cos(yaw) * Math.sin(pitch)) + tdy;

    ctx.lineWidth = 5;

    // Draw axes
    ctx.strokeStyle = "red"; // X-axis
    ctx.beginPath(); ctx.moveTo(tdx, tdy); ctx.lineTo(x1, y1); ctx.stroke();

    ctx.strokeStyle = "green"; // Y-axis
    ctx.beginPath(); ctx.moveTo(tdx, tdy); ctx.lineTo(x2, y2); ctx.stroke();

    ctx.strokeStyle = "blue"; // Z-axis
    ctx.beginPath(); ctx.moveTo(tdx, tdy); ctx.lineTo(x3, y3); ctx.stroke();

    // Draw pose values
    /*
    ctx.fillStyle = "#00FFFF";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Yaw: ${(-yaw * 180 / Math.PI).toFixed(2)}`, 10, 30);
    ctx.fillText(`Pitch: ${(pitch * 180 / Math.PI).toFixed(2)}`, 10, 60);
    ctx.fillText(`Roll: ${(roll * 180 / Math.PI).toFixed(2)}`, 10, 90);
    */
    
   
    ctx.font = "16px Roboto, sans-serif";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "#00FFFF";  // Bright yellow
    
    const texts = [
        `Yaw: ${(-yaw * 180 / Math.PI).toFixed(2)}`,
        `Pitch: ${(pitch * 180 / Math.PI).toFixed(2)}`,
        `Roll: ${(roll * 180 / Math.PI).toFixed(2)}`
    ];
    
    texts.forEach((text, i) => {
        const y = 30 + i * 30;
        ctx.strokeText(text, 10, y);  // Outline for contrast
        ctx.fillText(text, 10, y);    // Fill text
    });
    

    return [tdx, tdy];
}
