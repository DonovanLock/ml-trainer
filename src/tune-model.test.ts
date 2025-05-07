// This test is called via "npm run test:tune".

import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import { prepareFeaturesAndLabels, trainModel } from "./ml";
import { ActionData } from "./model";
import { currentDataWindow, ModelOptions, ModelTypes } from "./store";
import { mlSettings } from "./mlConfig";
import trainingData from "./test-fixtures/comparison-data/training-data.json";
import bestTestData from "./test-fixtures/comparison-data/test-data-best.json";
import goodTestData from "./test-fixtures/comparison-data/test-data-good.json";
import okTestData from "./test-fixtures/comparison-data/test-data-ok.json";
import poorTestData from "./test-fixtures/comparison-data/test-data-poor.json";
import worstTestData from "./test-fixtures/comparison-data/test-data-worst.json";
import { generateDate } from "./utils/date-time-generator";

const maxRunTime = 60 * 60 * 1000; // 1 hour

let sortedResults: string[] = [];

const fixUpTestData = (data: Partial<ActionData>[]): ActionData[] => {
  data.forEach((action) => (action.icon = "Heart"));
  return data as ActionData[];
};

const testData = [
  fixUpTestData(worstTestData),
  fixUpTestData(poorTestData),
  fixUpTestData(okTestData),
  fixUpTestData(goodTestData),
  fixUpTestData(bestTestData),
];

/**
 * Gets the average accuracy of the model on the test data.
 *
 * @param options - The ModelOptions to use for training.
 * @returns {Promise<number>} - The average accuracy of the model on the test data.
 */
const getAverageAccuracy = async (options: ModelOptions) => {
  const train = await trainModel(
    fixUpTestData(trainingData),
    currentDataWindow,
    options
  );

  if (train.error) return 0;

  let totalAccuracy = 0;
  let validDatasets = 0;

  for (const data of testData) {
    const { features, labels } = prepareFeaturesAndLabels(
      data,
      currentDataWindow,
      options
    );

    const tensorFlowResult = train.model.evaluate(
      tf.tensor(features),
      tf.tensor(labels)
    );
    const acc = (tensorFlowResult as tf.Scalar[])[1].dataSync()[0];
    if (!isNaN(acc)) {
      totalAccuracy += acc;
      validDatasets++;
    }
  }

  return totalAccuracy / validDatasets;
};

/**
 * Performs a grid search over the hyperparameters of the model.
 * It tests different combinations of epochs, batch size, learning rate, and neuron number.
 *
 * @returns {Promise<void>} - A promise that resolves when the search is complete.
 * The results are saved to a file named "tuningResults.txt".
 */
const searchGrid = async () => {
  const results: { [key: string]: number } = {};

  const epochOptions = [80, 120, 160, 200];
  const batchSizes = [32];
  const learningRates = [0.1, 0.2, 0.4];
  const neuronCounts = [16, 32, 64];
  const dropoutRates = [0, 0.1, 0.2];
  const filterSizes = [32];
  const kernelSizes = [3];
  const poolSizes = [2];
  let i = 0;

  for (const epochs of epochOptions) {
    for (const batchSize of batchSizes) {
      for (const learningRate of learningRates) {
        for (const neuronNumber of neuronCounts) {
          for (const dropoutRate of dropoutRates) {
            for (const filterSize of filterSizes) {
              for (const kernelSize of kernelSizes) {
                for (const poolSize of poolSizes) {
                  const config: ModelOptions = {
                    epochs,
                    batchSize,
                    learningRate,
                    neuronNumber,
                    testNumber: 0,
                    dropoutRate,
                    recurrentDropout: 0,
                    filterSize,
                    kernelSize,
                    poolSize,
                    featuresActive: mlSettings.includedFilters,
                    modelType: ModelTypes.DEFAULT,
                  };

                  const key = `epochs=${epochs},batchSize=${batchSize},lr=${learningRate},neurons=${neuronNumber},dropout=${dropoutRate}`;
                  console.log(`[${++i}] Testing ${key}`);
                  const avgAccuracy = await getAverageAccuracy(config);
                  results[key] = avgAccuracy;
                }
              }
            }
          }
        }
      }
    }
  }

  // Display results in descending order of accuracy
  sortedResults = Object.entries(results)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} => Accuracy: ${(v * 100).toFixed(2)}%`);

  console.log("Tuning complete. Results saving to tuningResults.txt.");
};

beforeAll(async () => {
  await tf.setBackend("cpu");
});

describe("Hyperparameter tuning", () => {
  test(
    "Running tuning grid",
    async () => {
      await searchGrid();
    },
    maxRunTime
  );
});

afterAll(() => {
  const lines: string[] = [];

  lines.push("Tuning completed at " + generateDate());
  lines.push("");

  for (const result of sortedResults) {
    lines.push(result);
  }

  fs.writeFile("tuningResults.txt", lines.join("\n"), (err) => {
    if (err) {
      return console.error("Error writing to comparisonLog.txt: ", err);
    }
    console.log("Details written to comparisonLog.txt.");
  });
});