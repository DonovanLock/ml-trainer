import * as tf from "@tensorflow/tfjs";
import { SymbolicTensor } from "@tensorflow/tfjs";
import { getMlFilters, mlSettings } from "./mlConfig";
import { ActionData, XYZData } from "./model";
import { DataWindow, ModelOptions } from "./store";

export type TrainingResult =
  | { error: false; model: tf.LayersModel }
  | { error: true };

// fixed sequence length for GRU input
const SEQ_LEN = 49;
const NUM_AXES = 3;

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

  console.log(
    `Features: ${features.length} sequences of ${features[0].length} timesteps × ${features[0][0].length} axes`
  );
  console.log(`Labels: ${labels.length} one-hot vectors of length ${labels[0].length}`);

  // Create the model
  const model: tf.LayersModel = createModel(data, modelOptions);

  // Prepare tensors and log shapes/dtypes
  const xTensor = tf.tensor3d(features, [features.length, SEQ_LEN, NUM_AXES], 'float32');
  const yTensor = tf.tensor2d(labels, [labels.length, labels[0].length], 'float32');
  console.log('xTensor shape:', xTensor.shape, 'dtype:', xTensor.dtype);
  console.log('yTensor shape:', yTensor.shape, 'dtype:', yTensor.dtype);

  try {
    await model.fit(xTensor, yTensor, {
      epochs: modelOptions.epochs,
      batchSize: modelOptions.batchSize,
      shuffle: true,
      validationSplit: 0,
      callbacks: {
        onEpochEnd: (epoch: number, logs?: tf.Logs) => {
          const loss = logs?.loss?.toFixed(4);
          const acc = (logs?.acc ?? logs?.accuracy)?.toFixed(4);
          console.log(
            `Epoch ${epoch + 1}/${modelOptions.epochs} — loss=${loss}, accuracy=${acc}`
          );
          if (onProgress) {
            onProgress(epoch / (modelOptions.epochs - 1));
          }
        },
      },
    });
  } catch (err) {
    console.error('Training failed:', err);
    return { error: true };
  }

  return { error: false, model };
};

export const prepareFeaturesAndLabels = (
  actions: ActionData[],
  dataWindow: DataWindow,
  modelOptions: ModelOptions
): { features: number[][][]; labels: number[][] } => {
  const features: number[][][] = [];
  const labels: number[][] = [];
  const numActions = actions.length;

  actions.forEach((action, idx) => {
    action.recordings.forEach((rec) => {
      const seq = trimAndNormalize(rec.data);
      features.push(seq);

      const label = new Array<number>(numActions).fill(0);
      label[idx] = 1;
      labels.push(label);
    });
  });

  return { features, labels };
};

/**
 * Take raw x,y,z arrays, pad or trim each to SEQ_LEN,
 * then normalize each axis per-recording to [0,1].
 * Returns a [SEQ_LEN][3] array.
 */
function trimAndNormalize({ x, y, z }: XYZData): number[][] {
  // helper to pad/trim, using last value or zero for padding
  const fixLen = (arr: number[]): number[] => {
    const result = arr.slice();
    while (result.length < SEQ_LEN) {
      const last = result.length > 0 ? result[result.length - 1] : 0;
      result.push(last);
    }
    return result.slice(0, SEQ_LEN);
  };

  // pad/trim first, then compute mins/maxs to avoid empty-array issues
  const xs = fixLen(x);
  const ys = fixLen(y);
  const zs = fixLen(z);

  const mins = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    z: Math.min(...zs),
  };
  const maxs = {
    x: Math.max(...xs),
    y: Math.max(...ys),
    z: Math.max(...zs),
  };

  const normalizeValue = (value: number, min: number, max: number): number => {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  };

  const seq: number[][] = [];
  for (let i = 0; i < SEQ_LEN; i++) {
    seq.push([
      normalizeValue(xs[i], mins.x, maxs.x),
      normalizeValue(ys[i], mins.y, maxs.y),
      normalizeValue(zs[i], mins.z, maxs.z),
    ]);
  }

  return seq;
}

const createModel = (
  actions: ActionData[],
  modelOptions: ModelOptions
): tf.LayersModel => {
  const numClasses = actions.length;

  console.log('Building model: GRU units=', modelOptions.neuronNumber,
              'dropoutRate=', modelOptions.dropoutRate, 'optimizer=Adam lr=', modelOptions.learningRate);

  const input = tf.input({ shape: [SEQ_LEN, NUM_AXES] });

  // stacked GRUs
  const gru1 = tf.layers.gru({ units: modelOptions.neuronNumber, returnSequences: true }).apply(input) as SymbolicTensor;
  const drop1 = tf.layers.dropout({ rate: modelOptions.dropoutRate }).apply(gru1) as SymbolicTensor;
  const gru2 = tf.layers.gru({ units: modelOptions.neuronNumber }).apply(drop1) as SymbolicTensor;
  const drop2 = tf.layers.dropout({ rate: modelOptions.dropoutRate }).apply(gru2) as SymbolicTensor;

  // optional hidden dense
  const hidden = tf.layers.dense({ units: modelOptions.neuronNumber, activation: 'relu' }).apply(drop2) as SymbolicTensor;

  const output = tf.layers.dense({ units: numClasses, activation: 'softmax' }).apply(hidden) as SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: output });
  model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam(modelOptions.learningRate),
    metrics: ['accuracy'],
  });

  model.summary();
  return model;
};
