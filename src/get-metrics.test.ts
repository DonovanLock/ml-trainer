/**
 * This test is called via "npm run test:get-metrics".
 *
 * The intention is simply used to get accuracy/confidence
 * data for our model. We use these to provide the basis
 * for the compare-model.test.ts file.
 */

import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import trainingData from "./test-fixtures/comparison-data/training-data.json";
import bestTestData from "./test-fixtures/comparison-data/test-data-best.json";
import goodTestData from "./test-fixtures/comparison-data/test-data-good.json";
import okTestData from "./test-fixtures/comparison-data/test-data-ok.json";
import poorTestData from "./test-fixtures/comparison-data/test-data-poor.json";
import worstTestData from "./test-fixtures/comparison-data/test-data-worst.json";
import { prepareFeaturesAndLabels, TrainingResult, trainModel } from "./ml";
import { currentDataWindow, defaultModelOptions } from "./store";
import { ActionData } from "./model";
import { generateDate } from "./utils/date-time-generator";

const maxRunTime = 60 * 60 * 1000; // 1 hour

// The number of times we retrain our model. A higher value here ensures
// lower variation in our metric results.
const runs = 10;

const fixUpTestData = (data: Partial<ActionData>[]): ActionData[] => {
  data.forEach((action) => (action.icon = "Heart"));
  return data as ActionData[];
};

const retrainModel = async (): Promise<TrainingResult> => {
  await tf.setBackend("cpu");
  const trainingResult = await trainModel(
    fixUpTestData(trainingData),
    currentDataWindow,
    defaultModelOptions
  );
  return trainingResult;
};

const getModelResults = (data: ActionData[], trainedModel: TrainingResult) => {
  const { features, labels } = prepareFeaturesAndLabels(
    data,
    currentDataWindow,
    defaultModelOptions
  );

  if (trainedModel.error) {
    throw Error("No model returned");
  }

  const tensorFlowResult = trainedModel.model.evaluate(
    tf.tensor(features),
    tf.tensor(labels)
  );
  const tensorFlowResultAccuracy = (tensorFlowResult as tf.Scalar[])[1]
    .dataSync()[0]
    .toFixed(4);
  const tensorflowPredictionResult = (
    trainedModel.model.predict(tf.tensor(features)) as tf.Tensor
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

const getMetrics = (trainedModel: TrainingResult) => {
  const accuracy: number[] = [0, 0, 0, 0, 0];
  const meanConfidence: number[] = [0, 0, 0, 0, 0];
  const meanCorrectConfidence: number[] = [0, 0, 0, 0, 0];
  for (let dataset = 0; dataset < testData.length; dataset++) {
    const { tensorFlowResultAccuracy, tensorflowPredictionResult, labels } =
      getModelResults(testData[dataset], trainedModel);
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
  }
  return [accuracy, meanConfidence, meanCorrectConfidence];
};

/*for (let i = 0; i < runs; i++) {
  test("", () => getMetrics(0));
  test("", () => getMetrics(1));
  test("", () => getMetrics(2));
  test("", () => getMetrics(3));
  test("", () => getMetrics(4));
}*/

let overallAccuracy = [0, 0, 0, 0, 0];
let overallMeanConfidence = [0, 0, 0, 0, 0];
let overallMeanCorrectConfidence = [0, 0, 0, 0, 0];
describe("Getting ML metrics", () => {
  test(
    "Running " + runs + " iterated tests",
    async () => {
      for (let i = 0; i < runs; i++) {
        const model = await retrainModel();
        const [accuracy, meanConfidence, meanCorrectConfidence] =
          getMetrics(model);
        overallAccuracy = overallAccuracy.map(
          (value: number, index: number) => value + accuracy[index]
        );
        overallMeanConfidence = overallMeanConfidence.map(
          (value: number, index: number) => value + meanConfidence[index]
        );
        overallMeanCorrectConfidence = overallMeanCorrectConfidence.map(
          (value: number, index: number) => value + meanCorrectConfidence[index]
        );
      }
      overallAccuracy = overallAccuracy.map((x) => +(x / runs).toFixed(5));
      overallMeanConfidence = overallMeanConfidence.map(
        (x) => +(x / runs).toFixed(5)
      );
      overallMeanCorrectConfidence = overallMeanCorrectConfidence.map(
        (x) => +(x / runs).toFixed(5)
      );
    },
    maxRunTime
  );
});

afterAll(() => {
  const lines: string[] = [];

  lines.push(
    "This log file was generated at " +
      generateDate() +
      ", with " +
      runs +
      " runs.\n"
  );
  lines.push("MACHINE LEARNING METRICS:");
  lines.push(
    "                   Dataset: Worst     Poor      OK        Good      Best      "
  );
  lines.push(
    "          Average Accuracy: " +
      overallAccuracy.map((x) => x.toString().padEnd(10, " ")).join("")
  );
  lines.push(
    "        Average Confidence: " +
      overallMeanConfidence.map((x) => x.toString().padEnd(10, " ")).join("")
  );
  lines.push(
    "Average Correct Confidence: " +
      overallMeanCorrectConfidence
        .map((x) => x.toString().padEnd(10, " "))
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

  fs.writeFile("metricResults.txt", lines.join("\n"), (err) => {
    if (err) {
      return console.error("Error writing to comparisonLog.txt: ", err);
    }
    console.log("Details written to comparisonLog.txt.");
  });
});
