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
import { useCallback, useEffect, useRef, useState } from "react";
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
  const advancedOptionsEnabled = useStore((s) => s.advancedOptionsEnabled);
  const toggleAdvancedOptionsEnabled = useStore(
    (s) => s.toggleAdvancedOptionsEnabled
  );
  const addNewAction = useStore((s) => s.addNewAction);
  const setBatchSize = useStore((s) => s.setBatchSize);
  const setEpochs = useStore((s) => s.setEpochs);
  const setLearningRate = useStore((s) => s.setLearningRate);
  const setNeuronNumb = useStore((s) => s.setNeuronNumber);
  const model = useStore((s) => s.model);
  const [selectedActionIdx, setSelectedActionIdx] = useState<number>(0);

  const navigate = useNavigate();
  const trainModelFlowStart = useStore((s) => s.trainModelFlowStart);

  const upDateModelOptions = () => {
    setBatchSize(batch);
    setEpochs(epochNum === 1 ? epochNum : epochNum - 1);
    setLearningRate(rateNumber);
    setNeuronNumb(neuronNumber);
  };

  const [batch, setBatchValue] = useState(modelOptions.batchSize);
  const [showBatchTooltip, setShowBatchTooltip] = useState(false);
  const [epochNum, setEpochValue] = useState(modelOptions.epochs + 1);
  const [showEpochTooltip, setShowEpochTooltip] = useState(false);
  const [neuronNumber, setNeuronNumber] = useState(modelOptions.neuronNumber);
  const [showNeuronTooltip, setShowNeuronTooltip] = useState(false);
  const [rateNumber, setRateNumber] = useState(modelOptions.learningRate);
  const [showRateTooltip, setShowRateTooltip] = useState(false);

  const tourStart = useStore((s) => s.tourStart);
  const { isConnected } = useConnectionStage();
  useEffect(() => {
    // If a user first connects on "Testing model" this can result in the tour when they return to the "Data samples" page.
    if (isConnected) {
      tourStart({ name: "Connect" }, false);
    }
  }, [isConnected, tourStart]);

  const hasSufficientData = useHasSufficientDataForTraining(
    modelOptions.testNumber
  );
  const hasFeatureActive = useHasFeatureActive(modelOptions.featuresActive);
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
            height="60px"
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
              <VStack>
                {advancedOptionsEnabled ? (
                  <VStack>
                    <Text>Batch Size</Text>
                    <Slider
                      id="BatchSlider"
                      defaultValue={batch}
                      width="125px"
                      min={1}
                      max={100}
                      size="md"
                      colorScheme="blue"
                      onMouseEnter={() => setShowBatchTooltip(true)}
                      onMouseLeave={() => setShowBatchTooltip(false)}
                      onChange={(val) => {
                        setBatchValue(Number(val));
                        setBatchSize(Number(val));
                      }}
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
                    <Text textStyle="sm">Epoch Number</Text>
                    <Slider
                      id="EpochNumber"
                      defaultValue={epochNum}
                      width="125px"
                      min={1}
                      max={301}
                      size="md"
                      step={10}
                      colorScheme="blue"
                      onMouseEnter={() => setShowEpochTooltip(true)}
                      onMouseLeave={() => setShowEpochTooltip(false)}
                      onChange={(val) => {
                        setEpochValue(Number(val));
                        setEpochs(Number(val));
                      }}
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
                    <Text textStyle="sm">Learning Rate</Text>
                    <Slider
                      id="RateSlider"
                      defaultValue={rateNumber}
                      width="125px"
                      min={0.1}
                      max={1}
                      size="md"
                      step={0.05}
                      colorScheme="blue"
                      onMouseEnter={() => setShowRateTooltip(true)}
                      onMouseLeave={() => setShowRateTooltip(false)}
                      onChange={(val) => {
                        setRateNumber(Number(val));
                        setLearningRate(Number(val));
                      }}
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
                    <Text textStyle="sm">Neuron Number</Text>
                    <Slider
                      id="NeuronSlider"
                      defaultValue={neuronNumber}
                      width="125px"
                      min={1}
                      max={100}
                      size="md"
                      colorScheme="blue"
                      onMouseEnter={() => setShowNeuronTooltip(true)}
                      onMouseLeave={() => setShowNeuronTooltip(false)}
                      onChange={(val) => {
                        setNeuronNumber(Number(val));
                        setNeuronNumb(Number(val));
                      }}
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
              <Checkbox
                defaultChecked={advancedOptionsEnabled}
                onChange={() => toggleAdvancedOptionsEnabled()}
              >
                Enable Advanced Model Options
              </Checkbox>
              {model ? (
                <HStack>
                  <Button
                    onClick={handleNavigateToModel}
                    className={tourElClassname.trainModelButton}
                    variant="primary"
                    rightIcon={<RiArrowRightLine />}
                    width="175px"
                  >
                    <FormattedMessage id="testing-model-title" />
                  </Button>
                </HStack>
              ) : (
                <HStack>
                  <Button
                    ref={trainButtonRef}
                    className={tourElClassname.trainModelButton}
                    onClick={() => {
                      upDateModelOptions();
                      void trainModelFlowStart(handleNavigateToModel);
                    }}
                    width="175px"
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
