/**
 * This file is simply used to get accuracy/confidence
 * data for our model. We use these to provide the basis
 * for the compare-model.test.ts file.
 *
 * It's not pretty, but writing this as a test was the
 * only way I could get it to work for the time being :)
 */

import * as tf from "@tensorflow/tfjs";
import trainingData from "./test-fixtures/comparison-data/training-data.json";
import bestTestData from "./test-fixtures/comparison-data/test-data-best.json";
import goodTestData from "./test-fixtures/comparison-data/test-data-good.json";
import okTestData from "./test-fixtures/comparison-data/test-data-ok.json";
import poorTestData from "./test-fixtures/comparison-data/test-data-poor.json";
import worstTestData from "./test-fixtures/comparison-data/test-data-worst.json";
import { prepareFeaturesAndLabels, TrainingResult, trainModel } from "./ml";
import { currentDataWindow, defaultModelOptions } from "./store";
import { ActionData } from "./model";

const fixUpTestData = (data: Partial<ActionData>[]): ActionData[] => {
  // Create a copy of data instead of modifying the original
  return data.map(action => ({
    ...action,
    icon: "Heart"
  })) as ActionData[];
};

let trainingResult: TrainingResult;
beforeAll(async () => {
  await tf.setBackend("cpu");
  trainingResult = await trainModel(
    fixUpTestData(trainingData),
    currentDataWindow,
    defaultModelOptions
  );
});

const getModelResults = (data: ActionData[]) => {
  const { features, labels } = prepareFeaturesAndLabels(
    data,
    currentDataWindow,
    defaultModelOptions
  );

  if (trainingResult.error) {
    throw new Error(`Training model returned error: ${trainingResult.error}`);
  }

  if (!trainingResult.model) {
    throw new Error("No model returned");
  }

  // Use feature data to predict and evaluate
  const tensorFeatures = tf.tensor(features);
  const tensorLabels = tf.tensor(labels);

  const tensorFlowResult = trainingResult.model.evaluate(
    tensorFeatures,
    tensorLabels
  );
  const tensorFlowResultAccuracy = (tensorFlowResult as tf.Scalar[])[1]
    .dataSync()[0]
    .toFixed(4);
  const tensorflowPredictionResult = (
    trainingResult.model.predict(tensorFeatures) as tf.Tensor
  ).dataSync();

  // Clean up tensors to prevent memory leaks
  tensorFeatures.dispose();
  tensorLabels.dispose();

  return {
    tensorFlowResultAccuracy,
    tensorflowPredictionResult,
    labels,
  };
};

const testData = [
  fixUpTestData(bestTestData),
  fixUpTestData(goodTestData),
  fixUpTestData(okTestData),
  fixUpTestData(poorTestData),
  fixUpTestData(worstTestData),
];

let accuracy: number[] = [0, 0, 0, 0, 0];
let meanConfidence: number[] = [0, 0, 0, 0, 0];
let meanCorrectConfidence: number[] = [0, 0, 0, 0, 0];

const getMetrics = (dataset: number) => {
  const { tensorFlowResultAccuracy, tensorflowPredictionResult, labels } =
    getModelResults(testData[dataset]);
    
  // Update accuracy
  accuracy[dataset] += +tensorFlowResultAccuracy;
  
  const dimensionSize = labels[0].length;
  let totalConfidence = 0;
  let totalCorrectConfidence = 0;
  let correctGuesses = 0;
  
  // Iterate through results to calculate confidence
  for (let i = 0, j = 0; i < tensorflowPredictionResult.length; i += dimensionSize, j++) {
    const predictionSlice = tensorflowPredictionResult.slice(i, i + dimensionSize);
    const actualLabel = labels[j].indexOf(Math.max(...labels[j]));
    const predictedLabel = predictionSlice.indexOf(Math.max(...predictionSlice));
    const confidence = predictionSlice[actualLabel];
    
    // Add to total confidence
    totalConfidence += confidence;
    
    // If prediction is correct, add to correct prediction confidence
    if (predictedLabel === actualLabel) {
      totalCorrectConfidence += confidence;
      correctGuesses += 1;
    }
  }
  
  // Calculate average confidence
  const totalSamples = tensorflowPredictionResult.length / dimensionSize;
  meanConfidence[dataset] += totalConfidence / totalSamples;
  
  // Calculate average confidence for correct predictions (avoid division by zero)
  if (correctGuesses > 0) {
    meanCorrectConfidence[dataset] += totalCorrectConfidence / correctGuesses;
  }
};

const runs = 10;

for (let i = 0; i < runs; i++) {
  test("", () => getMetrics(0));
  test("", () => getMetrics(1));
  test("", () => getMetrics(2));
  test("", () => getMetrics(3));
  test("", () => getMetrics(4));
}

afterAll(() => {
  accuracy = accuracy.map((x) => +(x / runs).toFixed(4));
  meanConfidence = meanConfidence.map((x) => +(x / runs).toFixed(4));
  meanCorrectConfidence = meanCorrectConfidence.map(
    (x) => +(x / runs).toFixed(4)
  );
  console.log(accuracy);
  console.log(meanConfidence);
  console.log(meanCorrectConfidence);
});
