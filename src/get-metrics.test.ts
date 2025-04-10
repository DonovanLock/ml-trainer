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
  data.forEach((action) => (action.icon = "Heart"));
  return data as ActionData[];
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
    throw Error("No model returned");
  }

  const tensorFlowResult = trainingResult.model.evaluate(
    tf.tensor(features),
    tf.tensor(labels)
  );
  const tensorFlowResultAccuracy = (tensorFlowResult as tf.Scalar[])[1]
    .dataSync()[0]
    .toFixed(4);
  const tensorflowPredictionResult = (
    trainingResult.model.predict(tf.tensor(features)) as tf.Tensor
  ).dataSync();
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
  accuracy[dataset] += +tensorFlowResultAccuracy;
  const d = labels[0].length;
  let totalConfidence: number = 0;
  let totalCorrectConfidence: number = 0;
  let correctGuesses: number = 0;
  for (let i = 0, j = 0; i < tensorflowPredictionResult.length; i += d, j++) {
    const result = tensorflowPredictionResult.slice(i, i + d);
    totalConfidence += result[labels[j].indexOf(Math.max(...labels[j]))];
    if (
      result.indexOf(Math.max(...result)) ==
      labels[j].indexOf(Math.max(...labels[j]))
    ) {
      totalCorrectConfidence +=
        result[labels[j].indexOf(Math.max(...labels[j]))];
      correctGuesses += 1;
    }
  }
  meanConfidence[dataset] +=
    totalConfidence / (tensorflowPredictionResult.length / d);
  if (correctGuesses != 0)
    meanCorrectConfidence[dataset] += totalCorrectConfidence / correctGuesses;
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
