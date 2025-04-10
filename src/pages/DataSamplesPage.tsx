/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 * Modifications (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Flex,
  HStack,
  VStack,
  Checkbox,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiAddLine, RiArrowRightLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import DataSamplesTable from "../components/DataSamplesTable";
import DefaultPageLayout, {
  ProjectMenuItems,
  ProjectToolbarItems,
} from "../components/DefaultPageLayout";
import LiveGraphPanel from "../components/LiveGraphPanel";
import TrainModelDialogs from "../components/TrainModelFlowDialogs";
import { useConnectionStage } from "../connection-stage-hooks";
import { keyboardShortcuts, useShortcut } from "../keyboard-shortcut-hooks";
import {
  useHasSufficientDataForTraining,
  useStore,
  useHasFeatureActive,
} from "../store";
import { tourElClassname } from "../tours";
import { createTestingModelPageUrl } from "../urls";

const DataSamplesPage = () => {
  const actions = useStore((s) => s.actions);
  const modelOptions = useStore((s) => s.modelOptions);
  const addNewAction = useStore((s) => s.addNewAction);
  const handleModelClear = useStore((s) => s.modelClear);
  const setBatchSize = useStore((s) => s.setBatchSize);
  const setEpochs = useStore((s) => s.setEpochs);
  const setLearningRate = useStore((s) => s.setLearningRate);
  const setNeuronNumb = useStore((s) => s.setNeuronNumber);
  const setTestNumber = useStore((s) => s.setTestNumber);
  const model = useStore((s) => s.model);
  const [selectedActionIdx, setSelectedActionIdx] = useState<number>(0);

  const navigate = useNavigate();
  const trainModelFlowStart = useStore((s) => s.trainModelFlowStart);

  const maxTestSize = useMemo(() => {
    let min = 0;
    if (actions.length > 0) {
      min = actions[0].recordings.length - 3;
      for (let i = 1; i < actions.length; i++) {
        const temp = actions[i].recordings.length - 3;
        if (temp >= 0 && temp < min) {
          min = temp;
        }
      }
    }
    return Math.max(min, 1);
  }, [actions]);

  const upDateModelOptions = () => {
    setBatchSize(batch);
    setEpochs(epochNum === 1 ? epochNum : epochNum - 1);
    setLearningRate(rateNumber);
    setNeuronNumb(neuronNumber);
    setTestNumber(testNumber);
  };

  const [batch, setBatchValue] = useState(modelOptions.batchSize);
  const [showBatchTooltip, setShowBatchTooltip] = useState(false);
  const [epochNum, setEpochValue] = useState(modelOptions.epochs + 1);
  const [showEpochTooltip, setShowEpochTooltip] = useState(false);
  const [testNumber, setTestNum] = useState(modelOptions.testNumber);
  const [showTestTooltip, setShowTestTooltip] = useState(false);
  const [neuronNumber, setNeuronNumber] = useState(modelOptions.neuronNumber);
  const [showNeuronTooltip, setShowNeuronTooltip] = useState(false);
  const [rateNumber, setRateNumber] = useState(modelOptions.learningRate);
  const [showRateTooltip, setShowRateTooltip] = useState(false);
  const [advancedOptionsEnabled, setAdvancedOptionsEnabled] = useState(false);

  const tourStart = useStore((s) => s.tourStart);
  const { isConnected } = useConnectionStage();
  useEffect(() => {
    // If a user first connects on "Testing model" this can result in the tour when they return to the "Data samples" page.
    if (isConnected) {
      tourStart({ name: "Connect" }, false);
    }
  }, [isConnected, tourStart]);

  const hasSufficientData = useHasSufficientDataForTraining(testNumber);
  const hasFeatureActive = useHasFeatureActive();
  const isAddNewActionDisabled = actions.some((a) => a.name.length === 0);

  const handleNavigateToModel = useCallback(() => {
    navigate(createTestingModelPageUrl());
  }, [navigate]);

  const trainButtonRef = useRef(null);
  const handleAddNewAction = useCallback(() => {
    setSelectedActionIdx(actions.length);
    addNewAction();
  }, [addNewAction, actions]);
  useShortcut(keyboardShortcuts.addAction, handleAddNewAction, {
    enabled: !isAddNewActionDisabled,
  });
  const intl = useIntl();
  return (
    <>
      <TrainModelDialogs finalFocusRef={trainButtonRef} />
      <DefaultPageLayout
        titleId="data-samples-title"
        showPageTitle
        menuItems={<ProjectMenuItems />}
        toolbarItemsRight={<ProjectToolbarItems />}
      >
        <Flex as="main" flexGrow={1} flexDir="column">
          <DataSamplesTable
            selectedActionIdx={selectedActionIdx}
            setSelectedActionIdx={setSelectedActionIdx}
          />
        </Flex>
        <VStack w="full" flexShrink={0} bottom={0} gap={0} bg="gray.25">
          <HStack
            role="region"
            aria-label={intl.formatMessage({
              id: "data-samples-actions-region",
            })}
            justifyContent="space-between"
            px={5}
            py={2}
            w="full"
            borderBottomWidth={3}
            borderTopWidth={3}
            borderColor="gray.200"
            alignItems="center"
          >
            <HStack gap={2} alignItems="center">
              <Button
                className={tourElClassname.addActionButton}
                variant={hasSufficientData ? "secondary" : "primary"}
                leftIcon={<RiAddLine />}
                onClick={handleAddNewAction}
                isDisabled={isAddNewActionDisabled}
              >
                <FormattedMessage id="add-action-action" />
              </Button>
            </HStack>
            <HStack gap={6}>
              {model ? (
                <HStack>
                  <Button onClick={handleModelClear} variant="primary">
                    <FormattedMessage id="Re-Train Model" />
                  </Button>
                  <Button
                    onClick={handleNavigateToModel}
                    className={tourElClassname.trainModelButton}
                    variant="primary"
                    rightIcon={<RiArrowRightLine />}
                  >
                    <FormattedMessage id="testing-model-title" />
                  </Button>
                </HStack>
              ) : (
                <HStack gap={6}>
                  <VStack>
                    {advancedOptionsEnabled ? (
                      <VStack>
                        <Text>Batch Size</Text>
                        <Slider
                          id="BatchSlider"
                          defaultValue={batch}
                          width="175px"
                          min={1}
                          max={100}
                          colorScheme="blue"
                          onMouseEnter={() => setShowBatchTooltip(true)}
                          onMouseLeave={() => setShowBatchTooltip(false)}
                          onChange={(val) => setBatchValue(Number(val))}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg="blue.500"
                            color="white"
                            placement="top"
                            isOpen={showBatchTooltip}
                            label={batch}
                          >
                            <SliderThumb />
                          </Tooltip>
                        </Slider>
                      </VStack>
                    ) : (
                      <></>
                    )}
                  </VStack>
                  <VStack>
                    {advancedOptionsEnabled ? (
                      <VStack>
                        <Text>Epoch Number</Text>
                        <Slider
                          id="EpochNumber"
                          defaultValue={epochNum}
                          width="175px"
                          min={1}
                          max={301}
                          step={10}
                          colorScheme="blue"
                          onMouseEnter={() => setShowEpochTooltip(true)}
                          onMouseLeave={() => setShowEpochTooltip(false)}
                          onChange={(val) => setEpochValue(Number(val))}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg="blue.500"
                            color="white"
                            placement="top"
                            isOpen={showEpochTooltip}
                            label={epochNum === 1 ? epochNum : epochNum - 1}
                          >
                            <SliderThumb />
                          </Tooltip>
                        </Slider>
                      </VStack>
                    ) : (
                      <></>
                    )}
                  </VStack>
                  <VStack>
                    {advancedOptionsEnabled ? (
                      <VStack>
                        <Text>Learning Rate</Text>
                        <Slider
                          id="RateSlider"
                          defaultValue={rateNumber}
                          width="175px"
                          min={0.1}
                          max={1}
                          step={0.05}
                          colorScheme="blue"
                          onMouseEnter={() => setShowRateTooltip(true)}
                          onMouseLeave={() => setShowRateTooltip(false)}
                          onChange={(val) => setRateNumber(Number(val))}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg="blue.500"
                            color="white"
                            placement="top"
                            isOpen={showRateTooltip}
                            label={rateNumber}
                          >
                            <SliderThumb />
                          </Tooltip>
                        </Slider>
                      </VStack>
                    ) : (
                      <></>
                    )}
                  </VStack>
                  <VStack>
                    {advancedOptionsEnabled ? (
                      <VStack>
                        <Text>Neuron Number</Text>
                        <Slider
                          id="NeuronSlider"
                          defaultValue={neuronNumber}
                          width="175px"
                          min={1}
                          max={100}
                          colorScheme="blue"
                          onMouseEnter={() => setShowNeuronTooltip(true)}
                          onMouseLeave={() => setShowNeuronTooltip(false)}
                          onChange={(val) => setNeuronNumber(Number(val))}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg="blue.500"
                            color="white"
                            placement="top"
                            isOpen={showNeuronTooltip}
                            label={neuronNumber}
                          >
                            <SliderThumb />
                          </Tooltip>
                        </Slider>
                      </VStack>
                    ) : (
                      <></>
                    )}
                  </VStack>
                  <VStack>
                    {advancedOptionsEnabled ? (
                      <VStack>
                        <Text>No. Testing Samples</Text>
                        <Slider
                          id="TestData%age"
                          defaultValue={testNumber}
                          width="175px"
                          min={0}
                          max={maxTestSize + 2}
                          colorScheme="blue"
                          onMouseEnter={() => setShowTestTooltip(true)}
                          onMouseLeave={() => setShowTestTooltip(false)}
                          onChange={(val) => setTestNum(Number(val))}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg="blue.500"
                            color="white"
                            placement="top"
                            isOpen={showTestTooltip}
                            label={testNumber}
                          >
                            <SliderThumb />
                          </Tooltip>
                        </Slider>
                      </VStack>
                    ) : (
                      <></>
                    )}
                  </VStack>
                  <Checkbox
                    onChange={() =>
                      setAdvancedOptionsEnabled(!advancedOptionsEnabled)
                    }
                  >
                    Enable Advanced Model Options
                  </Checkbox>
                  <Button
                    isDisabled={!hasSufficientData || !hasFeatureActive}
                    ref={trainButtonRef}
                    className={tourElClassname.trainModelButton}
                    onClick={() => {
                      upDateModelOptions();
                      void trainModelFlowStart(handleNavigateToModel);
                    }}
                    variant={
                      hasSufficientData && hasFeatureActive
                        ? "primary"
                        : "secondary-disabled"
                    }
                  >
                    <FormattedMessage id="train-model" />
                  </Button>
                </HStack>
              )}
            </HStack>
          </HStack>
          <LiveGraphPanel disconnectedTextId="connect-to-record" />
        </VStack>
      </DefaultPageLayout>
    </>
  );
};

export default DataSamplesPage;
