/**
 * Rotation utility that generates rotated samples around the X, Y, and Z axes.
 *
 * When recording samples using the micro:bit wearable strap, if the device is loose on the wrist, it can rotate (around the Y axis), which can make samples harder to classify. To help with this, we can generate rotated samples around the X, Y, and Z axes, which can be used to augment the training data.
 * 
 * For ease of use, the angles in the constructor are in degrees, but they are converted to radians internally.
 * 
 * (Add your names here when you add your code)
 * - Dominic
 */

export interface XYZSample {
  x: number;
  y: number;
  z: number;
}

export class RotationGenerator {
  rotateAroundX(data: XYZSample, theta: number): XYZSample {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    return {
      x: data.x,
      y: data.y * cosT - data.z * sinT,
      z: data.y * sinT + data.z * cosT,
    };
  }

  rotateAroundY(data: XYZSample, theta: number): XYZSample {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    return {
      x: data.x * cosT + data.z * sinT,
      y: data.y,
      z: -data.x * sinT + data.z * cosT,
    };
  }

  rotateAroundZ(data: XYZSample, theta: number): XYZSample {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    return {
      x: data.x * cosT - data.y * sinT,
      y: data.x * sinT + data.y * cosT,
      z: data.z,
    };
  }
}