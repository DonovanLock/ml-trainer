/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 * Modifications (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import * as tf from "@tensorflow/tfjs";
import { SymbolicTensor } from "@tensorflow/tfjs";
import { getMlFilters, mlSettings } from "./mlConfig";
import { ActionData, XYZData } from "./model";
import { DataWindow, ModelOptions } from "./store";

export type TrainingResult =
  | { error: false; model: tf.LayersModel }
  | { error: true };

export const trainModel = async (
  data: ActionData[],
  dataWindow: DataWindow,
  modelOptions: ModelOptions,
  onProgress?: (progress: number) => void
): Promise<TrainingResult> => {
  const { features, labels } = prepareFeaturesAndLabels(
    data,
    dataWindow,
    modelOptions,
    true,
    true
  );
  const model: tf.LayersModel = createModel(data, modelOptions);

  try {
    await model.fit(tf.tensor(features), tf.tensor(labels), {
      epochs: modelOptions.epochs,
      batchSize: modelOptions.batchSize,
      shuffle: true,
      // We don't do anything with the validation data, so might
      // as well train using all of it.
      validationSplit: 0,
      callbacks: {
        onEpochEnd: (epoch: number) => {
          // Epochs indexed at 0
          onProgress && onProgress(epoch / (modelOptions.epochs - 1));
        },
      },
    });
  } catch (err) {
    return { error: true };
  }
  return { error: false, model };
};
function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// Generates rotCount new recordings for each recording passed
// By rotating the recording in random angles first about the x axis, then y and z
export const dataRotate = (
  origdata: ActionData[],
  rotCount: number = 3
): ActionData[] => {
  // maximum angle, in degrees, by which the data may be rotated in any axis, in degrees
  const maxRot = 5.0;

  return origdata.map((action) => ({
    ...action,
    recordings: action.recordings.flatMap((recording) => {
      // Keep original recording
      const out: (typeof recording)[] = [recording];
      const { x, y, z } = recording.data;

      for (let i = 0; i < rotCount; i++) {
        const len = x.length;
        const newX: number[] = [];
        const newY: number[] = [];
        const newZ: number[] = [];

        // Angles to rotate about each axis, uniformly random in [-maxRot, maxRot)
        const angX = (Math.random() - 0.5) * 2 * maxRot;
        const angY = (Math.random() - 0.5) * 2 * maxRot;
        const angZ = (Math.random() - 0.5) * 2 * maxRot;

        // Cosines and sines of each of these angles
        const radX = angX * (Math.PI / 180);
        const radY = angY * (Math.PI / 180);
        const radZ = angZ * (Math.PI / 180);

        const cX = Math.cos(radX),
          sX = Math.sin(radX);
        const cY = Math.cos(radY),
          sY = Math.sin(radY);
        const cZ = Math.cos(radZ),
          sZ = Math.sin(radZ);

        for (let j = 0; j < len; j++) {
          // Calculate new x, y, z values
          // First rotate about x axis
          const rotX_x = x[j];
          const rotX_y = cX * y[j] - sX * z[j];
          const rotX_z = sX * y[j] + cX * z[j];

          // Then about y
          const rotY_x = cY * rotX_x + sY * rotX_z;
          const rotY_y = rotX_y;
          const rotY_z = cY * rotX_z - sY * rotX_x;

          // Then about z
          const rotZ_x = cZ * rotY_x - sZ * rotY_y;
          const rotZ_y = sZ * rotY_x + cZ * rotY_y;
          const rotZ_z = rotY_z;

          newX.push(rotZ_x);
          newY.push(rotZ_y);
          newZ.push(rotZ_z);
        }

        out.push({
          ...recording,
          data: { x: newX, y: newY, z: newZ },
        });
      }

      return out;
    }),
  }));
};

export const dataSynthesize = (
  origdata: ActionData[],
  // whether to apply Gaussian noise
  dithering: boolean = true,
  // whether to apply sinusoidal distortion
  distortion: boolean = true,
  // how many noisy copies to make when dithering-only
  ditheringCount: number = 3,
  // how many distorted copies to make when distortion-only
  distortionCount: number = 3
): ActionData[] => {
  // tweak or pull these factors from modelOptions if you like
  const noiseFactor = 0.02;
  const distortionFactor = 0.1;

  return origdata.map((action) => ({
    ...action,
    recordings: action.recordings.flatMap((recording) => {
      // always keep the original
      const out: (typeof recording)[] = [recording];
      const { x, y, z } = recording.data;
      // helper to build one synthetic recording
      const makeSynthetic = (applyDither: boolean, applyDistort: boolean) => {
        const localdistortion = gaussianRandom() * distortionFactor + 1;
        const newX = x.map((v) => {
          let nv = v;
          if (applyDither) nv += gaussianRandom() * noiseFactor;
          if (applyDistort) nv *= localdistortion;
          return nv;
        });
        const newY = y.map((v) => {
          let nv = v;
          if (applyDither) nv += gaussianRandom() * noiseFactor;
          if (applyDistort) nv *= localdistortion;
          return nv;
        });
        const newZ = z.map((v) => {
          let nv = v;
          if (applyDither) nv += gaussianRandom() * noiseFactor;
          if (applyDistort) nv *= localdistortion;
          return nv;
        });

        return {
          ...recording,
          data: { x: newX, y: newY, z: newZ },
        };
      };

      if (dithering && !distortion) {
        for (let i = 0; i < ditheringCount; i++) {
          out.push(makeSynthetic(true, false));
        }
      } else if (!dithering && distortion) {
        for (let j = 0; j < distortionCount; j++) {
          out.push(makeSynthetic(false, true));
        }
      } else if (dithering && distortion) {
        for (let i = 0; i < ditheringCount; i++) {
          for (let j = 0; j < distortionCount; j++) {
            out.push(makeSynthetic(true, true));
          }
        }
      }
      // if both flags false, you’ll just get the original
      return out;
    }),
  }));
};

// Exported for testing
export const prepareFeaturesAndLabels = (
  actions: ActionData[],
  dataWindow: DataWindow,
  modelOptions: ModelOptions,
  synthesize: boolean = false,
  rotate: boolean = false
): { features: number[][]; labels: number[][] } => {
  const features: number[][] = [];
  const labels: number[][] = [];
  const numActions = actions.length;
  if (synthesize) actions = dataSynthesize(actions, true, true, 4, 4);
  if (rotate) actions = dataRotate(actions);
  actions.forEach((action, index) => {
    action.recordings.forEach((recording) => {
      // Prepare features
      features.push(
        Object.values(applyFilters(recording.data, dataWindow, modelOptions))
      );

      // Prepare labels
      const label: number[] = new Array(numActions) as number[];
      label.fill(0, 0, numActions);
      label[index] = 1;
      labels.push(label);
    });
  });
  return { features, labels };
};

const createModel = (
  actions: ActionData[],
  modelOptions: ModelOptions
): tf.LayersModel => {
  const numberOfClasses: number = actions.length;
  const inputShape = [
    modelOptions.featuresActive.size * mlSettings.includedAxes.length,
  ];

  const input = tf.input({ shape: inputShape });
  const normalizer = tf.layers.batchNormalization().apply(input);
  const dense = tf.layers
    .dense({ units: modelOptions.neuronNumber, activation: "relu" })
    .apply(normalizer);
  const dropout = tf.layers
    .dropout({ rate: modelOptions.dropoutRate })
    .apply(dense) as SymbolicTensor;
  const softmax = tf.layers
    .dense({ units: numberOfClasses, activation: "softmax" })
    .apply(dropout) as SymbolicTensor;
  const model = tf.model({ inputs: input, outputs: softmax });

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.sgd(modelOptions.learningRate),
    metrics: ["accuracy"],
  });

  return model;
};

const normalize = (value: number, min: number, max: number) => {
  const newMin = 0;
  const newMax = 1;
  return ((newMax - newMin) * (value - min)) / (max - min) + newMin;
};

// Used for training model and producing fingerprints
// applyFilters reduces array of x, y and z inputs to a single number array with values.
export const applyFilters = (
  { x, y, z }: XYZData,
  dataWindow: DataWindow,
  modelOptions: ModelOptions,
  opts: { normalize?: boolean } = {}
): Record<string, number> => {
  if (x.length === 0 || y.length === 0 || z.length === 0) {
    throw new Error("Empty x/y/z data");
  }
  const filters = getMlFilters(dataWindow);
  return Array.from(modelOptions.featuresActive).reduce((acc, filter) => {
    const { strategy, min, max } = filters[filter];
    const applyFilter = (vs: number[]) =>
      opts.normalize
        ? normalize(strategy(vs, dataWindow), min, max)
        : strategy(vs, dataWindow);
    return {
      ...acc,
      [`${filter}-x`]: applyFilter(x),
      [`${filter}-y`]: applyFilter(y),
      [`${filter}-z`]: applyFilter(z),
    };
  }, {} as Record<string, number>);
};

interface PredictInput {
  model: tf.LayersModel;
  data: XYZData;
  classificationIds: number[];
}

export type Confidences = Record<ActionData["ID"], number>;

export type ConfidencesResult =
  | { error: true; detail: unknown }
  | { error: false; confidences: Confidences };

// For predicting
export const predict = (
  { model, data, classificationIds }: PredictInput,
  dataWindow: DataWindow,
  modelOptions: ModelOptions
): ConfidencesResult => {
  const input = Object.values(applyFilters(data, dataWindow, modelOptions));
  const prediction = model.predict(tf.tensor([input])) as tf.Tensor;
  try {
    const confidences = prediction.dataSync() as Float32Array;
    return {
      error: false,
      confidences: classificationIds.reduce(
        (acc, id, idx) => ({ ...acc, [id]: confidences[idx] }),
        {}
      ),
    };
  } catch (e) {
    return { error: true, detail: e };
  }
};
