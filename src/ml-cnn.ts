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
    modelOptions
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
              onEpochEnd: (epoch: number, logs?: tf.Logs) => {
                const loss = logs?.loss?.toFixed(4);
                const acc = (logs?.acc ?? logs?.accuracy)?.toFixed(4);
                //console.log(
                //  `Epoch ${epoch + 1}/${modelOptions.epochs} — loss=${loss}, accuracy=${acc}`
                //);
                if (onProgress) {
                  onProgress(epoch / (modelOptions.epochs - 1));
                }
              },
            },
    });
  } catch (err) {
    return { error: true };
  }
  return { error: false, model };
};

// Exported for testing
export const prepareFeaturesAndLabels = (
  actions: ActionData[],
  dataWindow: DataWindow,
  modelOptions: ModelOptions
): { features: number[][]; labels: number[][] } => {
  const features: number[][] = [];
  const labels: number[][] = [];
  const numActions = actions.length;

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
  const numberOfClasses = actions.length;
  // same flattened feature count as before
  const flatDim =
    modelOptions.featuresActive.size * mlSettings.includedAxes.length;

  // keep the original 1D input
  const input = tf.input({ shape: [flatDim] });

  // reshape into [timeSteps, 1] so conv1d can run along your feature “sequence”
  const seq = tf.layers
    .reshape({ targetShape: [flatDim, 1] })
    .apply(input) as SymbolicTensor;

  // 1D conv + pool
  const filters = modelOptions.filterSize;
  const kernel = modelOptions.kernelSize;
  const poolSize = modelOptions.poolSize;
  const conv = tf.layers
    .conv1d({
      filters,
      kernelSize: kernel,
      activation: "relu",
      padding: "same",
    })
    .apply(seq) as SymbolicTensor;

  const pool = tf.layers
    .maxPooling1d({ poolSize })
    .apply(conv) as SymbolicTensor;

  // flatten back out to feed into your dense block
  const flat = tf.layers.flatten().apply(pool) as SymbolicTensor;

  const dense = tf.layers
    .dense({ units: modelOptions.neuronNumber, activation: "relu" })
    .apply(flat) as SymbolicTensor;

  const drop = tf.layers
    .dropout({ rate: modelOptions.dropoutRate })
    .apply(dense) as SymbolicTensor;

  const output = tf.layers
    .dense({ units: numberOfClasses, activation: "softmax" })
    .apply(drop) as SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: output });

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
