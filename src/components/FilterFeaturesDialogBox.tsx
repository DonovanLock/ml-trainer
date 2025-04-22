import {
  Text,
  Checkbox,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Heading,
  Button,
} from "@chakra-ui/react";
import { useStore } from "../store";
import { Filter } from "../mlConfig";
import { useRef, useState } from "react";

const FilterFeaturesDialogBox = () => {
  const featuresActive = useStore((s) => s.modelOptions).featuresActive;
  const featuresActiveToggle = new Set<Filter>();

  const [maxChecked, setMaxChecked] = useState(featuresActive.has(Filter.MAX));
  const [minChecked, setMinChecked] = useState(featuresActive.has(Filter.MIN));
  const [meanChecked, setMeanChecked] = useState(
    featuresActive.has(Filter.MEAN)
  );
  const [accChecked, setAccChecked] = useState(featuresActive.has(Filter.ACC));
  const [rmsChecked, setRmsChecked] = useState(featuresActive.has(Filter.RMS));
  const [zcrChecked, setZcrChecked] = useState(featuresActive.has(Filter.ZCR));
  const [peaksChecked, setPeaksChecked] = useState(
    featuresActive.has(Filter.PEAKS)
  );
  const [stdChecked, setStdChecked] = useState(featuresActive.has(Filter.STD));

  const toggleFeaturesActive = useStore((s) => s.toggleFeaturesActive);
  const isOpen = useStore((s) => s.isFeaturesFilterDialogOpen);
  const handleSetFeaturesActive = () => {
    if (featuresActive.has(Filter.MAX) !== maxChecked) {
      featuresActiveToggle.add(Filter.MAX);
    }
    if (featuresActive.has(Filter.MIN) !== minChecked) {
      featuresActiveToggle.add(Filter.MIN);
    }
    if (featuresActive.has(Filter.MEAN) !== meanChecked) {
      featuresActiveToggle.add(Filter.MEAN);
    }
    if (featuresActive.has(Filter.PEAKS) !== peaksChecked) {
      featuresActiveToggle.add(Filter.PEAKS);
    }
    if (featuresActive.has(Filter.ZCR) !== zcrChecked) {
      featuresActiveToggle.add(Filter.ZCR);
    }
    if (featuresActive.has(Filter.ACC) !== accChecked) {
      featuresActiveToggle.add(Filter.ACC);
    }
    if (featuresActive.has(Filter.RMS) !== rmsChecked) {
      featuresActiveToggle.add(Filter.RMS);
    }
    if (featuresActive.has(Filter.STD) !== stdChecked) {
      featuresActiveToggle.add(Filter.STD);
    }
    toggleFeaturesActive(featuresActiveToggle);
    setMaxChecked(maxChecked);
    closeDialog();
  };
  const handleCancel = () => {
    featuresActiveToggle.forEach((f) => featuresActiveToggle.delete(f));
    setMaxChecked(featuresActive.has(Filter.MAX));
    setMinChecked(featuresActive.has(Filter.MIN));
    setMeanChecked(featuresActive.has(Filter.MEAN));
    setAccChecked(featuresActive.has(Filter.ACC));
    setRmsChecked(featuresActive.has(Filter.RMS));
    setZcrChecked(featuresActive.has(Filter.ZCR));
    setPeaksChecked(featuresActive.has(Filter.PEAKS));
    setStdChecked(featuresActive.has(Filter.STD));
    closeDialog();
  };
  const handleReset = () => {
    featuresActiveToggle.forEach((f) => featuresActiveToggle.delete(f));
    if (!featuresActive.has(Filter.MAX)) {
      featuresActiveToggle.add(Filter.MAX);
    }
    if (!featuresActive.has(Filter.MIN)) {
      featuresActiveToggle.add(Filter.MIN);
    }
    if (!featuresActive.has(Filter.MEAN)) {
      featuresActiveToggle.add(Filter.MEAN);
    }
    if (!featuresActive.has(Filter.ACC)) {
      featuresActiveToggle.add(Filter.ACC);
    }
    if (!featuresActive.has(Filter.RMS)) {
      featuresActiveToggle.add(Filter.RMS);
    }
    if (!featuresActive.has(Filter.ZCR)) {
      featuresActiveToggle.add(Filter.ZCR);
    }
    if (!featuresActive.has(Filter.PEAKS)) {
      featuresActiveToggle.add(Filter.PEAKS);
    }
    if (!featuresActive.has(Filter.STD)) {
      featuresActiveToggle.add(Filter.STD);
    }
    setAccChecked(true);
    setMaxChecked(true);
    setMeanChecked(true);
    setMinChecked(true);
    setPeaksChecked(true);
    setRmsChecked(true);
    setStdChecked(true);
    setZcrChecked(true);
  };
  const closeDialog = useStore((s) => s.closeDialog);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const heading = <Text>Select which featuers you want active</Text>;
  const body = (
    <VStack align="left">
      <Checkbox
        onChange={() => {
          setMaxChecked(!maxChecked);
        }}
        isChecked={maxChecked}
      >
        Max
      </Checkbox>
      <Checkbox
        onChange={() => {
          setMinChecked(!minChecked);
        }}
        isChecked={minChecked}
      >
        Min
      </Checkbox>
      <Checkbox
        onChange={() => {
          setMeanChecked(!meanChecked);
        }}
        isChecked={meanChecked}
      >
        Mean
      </Checkbox>
      <Checkbox
        onChange={() => {
          setStdChecked(!stdChecked);
        }}
        isChecked={stdChecked}
      >
        Standard Deviation
      </Checkbox>
      <Checkbox
        onChange={() => {
          setPeaksChecked(!peaksChecked);
        }}
        isChecked={peaksChecked}
      >
        Peaks
      </Checkbox>
      <Checkbox
        onChange={() => {
          setAccChecked(!accChecked);
        }}
        isChecked={accChecked}
      >
        Acceleration
      </Checkbox>
      <Checkbox
        onChange={() => {
          setZcrChecked(!zcrChecked);
        }}
        isChecked={zcrChecked}
      >
        Zero Crossing Rate
      </Checkbox>
      <Checkbox
        onChange={() => {
          setRmsChecked(!rmsChecked);
        }}
        isChecked={rmsChecked}
      >
        Root Mean Square
      </Checkbox>
    </VStack>
  );

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={leastDestructiveRef}
      onClose={handleCancel}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading as="h2" size="md">
              {heading}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={leastDestructiveRef} onClick={handleReset} mr={3}>
              Reset Features
            </Button>
            <Button ref={leastDestructiveRef} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={handleSetFeaturesActive}
              ml={3}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default FilterFeaturesDialogBox;
