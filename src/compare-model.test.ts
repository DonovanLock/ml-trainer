/**
 * This test is called via "npm run test:compare".
 *
 * The intention is that upon updating the ML model, this
 * test will compare the new model's results to the original
 * model provided by Micro:bit. Specifically, this test
 * harness should still work correctly if the methods in
 * ml.ts have their internal functionalities edited (i.e.
 * everything except method names and input/return types).
 *
 * It runs tests on five datasets, ordered from worst to
 * best (in regards to the accuracy of the original model).
 * For each, it checks whether the current model performs
 * better with respect to three metrics: accuracy,
 * confidence, and correct confidence. These are explained
 * further in the accompanying log file, which is generated
 * everytime this file runs at comparisonLog.txt.
 *
 * The log file contains numeric information on each metric,
 * whereas the tests in this file simply state whether or not
 * the current model beats the metrics of the original model.
 * There appears to be some degree of variation, so feel free
 * to run this test file multiple times to gather a more
 * holistic view of the model's efficacy.
 *
 * The performance metrics of the original model are stored
 * in src/test-fixtures/comparison-data/original-stats.json,
 * and were derived from the average of ten separate executions
 * of get-metrics.test.ts.
 *
 * If a model passes all the checks, then it performs
 * unequivocally better than the original model, at least on
 * these datasets. In practice, I imagine there will be
 * certain trade-offs depending on how we change the ML
 * implementation.
 */

import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import { prepareFeaturesAndLabels, TrainingResult, trainModel } from "./ml";
import { ActionData } from "./model";
import { currentDataWindow, defaultModelOptions } from "./store";
import trainingData from "./test-fixtures/comparison-data/training-data.json";
import bestTestData from "./test-fixtures/comparison-data/test-data-best.json";
import goodTestData from "./test-fixtures/comparison-data/test-data-good.json";
import okTestData from "./test-fixtures/comparison-data/test-data-ok.json";
import poorTestData from "./test-fixtures/comparison-data/test-data-poor.json";
import worstTestData from "./test-fixtures/comparison-data/test-data-worst.json";
import {
  originalAccuracy,
  originalConfidence,
  originalCorrectConfidence,
} from "./test-fixtures/comparison-data/original-stats.json";
import { afterAll, beforeAll } from "vitest";

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
  fixUpTestData(worstTestData),
  fixUpTestData(poorTestData),
  fixUpTestData(okTestData),
  fixUpTestData(goodTestData),
  fixUpTestData(bestTestData),
];

const accuracyScores: number[] = [];
const meanConfidenceScores: number[] = [];
const meanCorrectConfidenceScores: number[] = [];

interface ModelMetrics {
  accuracy: number;
  meanConfidence: number;
  meanCorrectConfidence: number;
}

const calculateMetrics = (
  tensorFlowResultAccuracy: string,
  tensorflowPredictionResult: Float32Array | Int32Array | Uint8Array,
  labels: number[][]
): ModelMetrics => {
  const d = labels[0].length;
  let totalConfidence = 0;
  let totalCorrectConfidence = 0;
  let correctGuesses = 0;

  for (let i = 0, j = 0; i < tensorflowPredictionResult.length; i += d, j++) {
    const result = tensorflowPredictionResult.slice(i, i + d);
    const correctIndex = labels[j].indexOf(Math.max(...labels[j]));
    const predictedIndex = result.indexOf(Math.max(...result));
    
    // Add the confidence score for the correct class
    totalConfidence += result[correctIndex];

    // Check if prediction was correct
    if (predictedIndex === correctIndex) {
      totalCorrectConfidence += result[correctIndex];
      correctGuesses += 1;
    }
  }
  
  const accuracy = +tensorFlowResultAccuracy;
  const meanConfidence = totalConfidence / (tensorflowPredictionResult.length / d);
  const meanCorrectConfidence = correctGuesses !== 0 
    ? totalCorrectConfidence / correctGuesses 
    : 0;

  return { accuracy, meanConfidence, meanCorrectConfidence };
};

const compareModel = (message: string, dataset: number) => {
  describe(message, () => {
    let metrics: ModelMetrics;

    test("Running model", () => {
      const { tensorFlowResultAccuracy, tensorflowPredictionResult, labels } =
        getModelResults(testData[dataset]);

      metrics = calculateMetrics(
        tensorFlowResultAccuracy,
        tensorflowPredictionResult,
        labels
      );
    });

    test("Accuracy check", () => {
      accuracyScores.push(metrics.accuracy);
      expect(metrics.accuracy).toBeGreaterThanOrEqual(originalAccuracy[dataset]);
    });

    test("Confidence check", () => {
      meanConfidenceScores.push(metrics.meanConfidence);
      expect(metrics.meanConfidence).toBeGreaterThanOrEqual(
        originalConfidence[dataset]
      );
    });

    test("Correct confidence check", () => {
      meanCorrectConfidenceScores.push(metrics.meanCorrectConfidence);
      expect(metrics.meanCorrectConfidence).toBeGreaterThanOrEqual(
        originalCorrectConfidence[dataset]
      );
    });
  });
};

compareModel("Testing on the worst dataset", 0);
compareModel("Testing on the poor dataset", 1);
compareModel("Testing on the OK dataset", 2);
compareModel("Testing on the good dataset", 3);
compareModel("Testing on the best dataset", 4);

// Generating and formatting log file contents
afterAll(() => {
  const lines: string[] = [];
  const now = new Date();
  const padZero = (n: number): string => {
    let x = n.toString();
    if (x.length < 2) x = "0" + x;
    return x;
  };
  const time =
    padZero(now.getHours()) +
    ":" +
    padZero(now.getMinutes()) +
    ":" +
    padZero(now.getSeconds());
  const date =
    padZero(now.getDate()) +
    "/" +
    padZero(now.getMonth() + 1) +
    "/" +
    padZero(now.getFullYear());
  lines.push("This log file was generated at " + time + ", on " + date + ".\n");

  lines.push("ACCURACY RESULTS:");
  lines.push("Dataset:  Worst     Poor      OK        Good      Best      ");
  lines.push(
    "Current:  " +
      accuracyScores.map((x) => x.toString().padEnd(10, " ")).join("")
  );
  lines.push(
    "Original: " +
      originalAccuracy.map((x) => x.toString().padEnd(10, " ")).join("")
  );
  lines.push("\nCONFIDENCE RESULTS:");
  lines.push("Dataset:  Worst     Poor      OK        Good      Best      ");
  lines.push(
    "Current:  " +
      meanConfidenceScores
        .map((x) => parseFloat(x.toFixed(5)).toString().padEnd(10, " "))
        .join("")
  );
  lines.push(
    "Original: " +
      originalConfidence
        .map((x) => parseFloat(x.toFixed(5)).toString().padEnd(10, " "))
        .join("")
  );
  lines.push("\nCORRECT CONFIDENCE RESULTS:");
  lines.push("Dataset:  Worst     Poor      OK        Good      Best      ");
  lines.push(
    "Current:  " +
      meanCorrectConfidenceScores
        .map((x) => parseFloat(x.toFixed(5)).toString().padEnd(10, " "))
        .join("")
  );
  lines.push(
    "Original: " +
      originalCorrectConfidence
        .map((x) => parseFloat(x.toFixed(5)).toString().padEnd(10, " "))
        .join("")
  );

  lines.push("\nDEFINITIONS:");
  lines.push(
    "Accuracy is simply the proportion of classifications which are correct. It is directly"
  );
  lines.push(
    'provided by the "getModelResults" function, as the "tensorflowResultAccuracy" value.'
  );
  lines.push(
    "\nConfidence is the average predictive strength of the model towards the correct category"
  );
  lines.push(
    "for each test recording, regardless of whether or not the model actually selected this"
  );
  lines.push(
    'category. It is derived from the "tensorflowPredictionResult" value, also provided by the'
  );
  lines.push('"getModelResults" function.');
  lines.push(
    "\nCorrect Confidence is the model's average predictive strength across classifications which"
  );
  lines.push(
    "turned out to be correctly chosen. For this reason, note that the Correct Confidence score"
  );
  lines.push(
    "is necessarily greater than the Confidence score for any given dataset or model."
  );

  fs.writeFile("comparisonLog.txt", lines.join("\n"), (err) => {
    if (err) {
      return console.error("Error writing to comparisonLog.txt: ", err);
    }
    console.log("Details written to comparisonLog.txt.");
  });
});
