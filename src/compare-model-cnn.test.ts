/**
 * ml-lstm.test.ts
 * (c) 2023‑2024...
 * SPDX-License-Identifier: MIT
 */

/////////////////////
// TESTING SETUP
/////////////////////
import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import { beforeAll, afterAll, describe, test, expect } from "vitest";

import { prepareFeaturesAndLabels, trainModel } from "./ml-cnn";
import { ActionData } from "./model";
import { currentDataWindow, cnnModelOptions } from "./store";

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

import { generateDate } from "./utils/date-time-generator";

// ensure each ActionData has an icon
const fixUpTestData = (data: Partial<ActionData>[]): ActionData[] => {
  data.forEach((action) => (action.icon = "Heart"));
  return data as ActionData[];
};

let trainingResult: Awaited<ReturnType<typeof trainModel>>;

beforeAll(async () => {
  await tf.setBackend("cpu");
  trainingResult = await trainModel(
    fixUpTestData(trainingData),
    currentDataWindow,
    cnnModelOptions
  );
}, 1000000);

const getModelResults = (data: ActionData[]) => {
  // prepare 3D sequences & one‑hot labels
  const { features, labels } = prepareFeaturesAndLabels(
    data,
    currentDataWindow,
    cnnModelOptions
  );

  if (trainingResult.error) {
    throw new Error("No model returned");
  }

  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);

  const accT = (trainingResult.model.evaluate(xs, ys) as tf.Scalar[])[1];
  const tensorFlowResultAccuracy = accT.dataSync()[0].toFixed(4);

  const predT = trainingResult.model.predict(xs) as tf.Tensor;
  const tensorflowPredictionResult = Array.from(predT.dataSync());

  xs.dispose();
  ys.dispose();
  predT.dispose();

  return { tensorFlowResultAccuracy, tensorflowPredictionResult, labels };
};

const testDataSets = [
  fixUpTestData(worstTestData),
  fixUpTestData(poorTestData),
  fixUpTestData(okTestData),
  fixUpTestData(goodTestData),
  fixUpTestData(bestTestData),
];

const accuracyScores: number[] = [];
const meanConfidenceScores: number[] = [];
const meanCorrectConfidenceScores: number[] = [];

const compareModel = (message: string, idx: number) => {
  describe(message, () => {
    let accuracy = 0;
    let meanConf = 0;
    let meanCorrConf = 0;

    test("Running model", () => {
      const { tensorFlowResultAccuracy, tensorflowPredictionResult, labels } =
        getModelResults(testDataSets[idx]);

      accuracy = parseFloat(tensorFlowResultAccuracy);
      const d = labels[0].length;

      let totalConf = 0;
      let totalCorrConf = 0;
      let correctCount = 0;

      for (
        let i = 0, j = 0;
        i < tensorflowPredictionResult.length;
        i += d, j++
      ) {
        const probs = tensorflowPredictionResult.slice(i, i + d);
        const trueIdx = labels[j].indexOf(1);
        totalConf += probs[trueIdx];
        const predIdx = probs.indexOf(Math.max(...probs));
        if (predIdx === trueIdx) {
          totalCorrConf += probs[trueIdx];
          correctCount++;
        }
      }

      meanConf = totalConf / (tensorflowPredictionResult.length / d);
      meanCorrConf = correctCount > 0 ? totalCorrConf / correctCount : 0;
      meanConfidenceScores.push(meanConf);
      meanCorrectConfidenceScores.push(meanCorrConf);
    });

    test("Accuracy check", () => {
      accuracyScores.push(accuracy);
      expect(accuracy).toBeGreaterThanOrEqual(originalAccuracy[idx]);
    });

    test("Confidence check", () => {
      expect(meanConfidenceScores[idx]).toBeGreaterThanOrEqual(
        originalConfidence[idx]
      );
    });

    test("Correct confidence check", () => {
      expect(meanCorrectConfidenceScores[idx]).toBeGreaterThanOrEqual(
        originalCorrectConfidence[idx]
      );
    });
  });
};

compareModel("Testing on the worst dataset", 0);
compareModel("Testing on the poor dataset", 1);
compareModel("Testing on the OK dataset", 2);
compareModel("Testing on the good dataset", 3);
compareModel("Testing on the best dataset", 4);

afterAll(() => {
  const lines: string[] = [];
  lines.push(`Log generated at ${generateDate()}\n`);
  lines.push("ACCURACY RESULTS:");
  lines.push("Dataset:  Worst     Poor      OK        Good      Best");
  lines.push(
    "Current:  " +
      accuracyScores.map((x) => x.toFixed(4).padEnd(10, " ")).join("")
  );
  lines.push(
    "Original: " +
      originalAccuracy.map((x) => x.toFixed(4).padEnd(10, " ")).join("")
  );
  // … confidence and correct confidence sections …

  fs.writeFileSync("comparisonLog.txt", lines.join("\n"));
  console.log("comparisonLog.txt written");
});
