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
import { useRef } from "react";

const FilterFeaturesDialogBox = () => {
  const featuresActive = useStore((s) => s.modelOptions).featuresActive;
  const featuresActiveToggle = new Set<Filter>();
  const toggleFeaturesActive = useStore((s) => s.toggleFeaturesActive);
  const handleChange = (v: Filter) => {
    if (featuresActiveToggle.has(v)) {
      featuresActiveToggle.delete(v);
    } else {
      featuresActiveToggle.add(v);
    }
  };
  const isOpen = useStore((s) => s.isFeaturesFilterDialogOpen);
  const handleSetFeaturesActive = () => {
    toggleFeaturesActive(featuresActiveToggle);
    closeDialog();
  };
  const handleCancel = () => {
    featuresActiveToggle.forEach((f) => featuresActiveToggle.delete(f));
    closeDialog();
  };
  const closeDialog = useStore((s) => s.closeDialog);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const heading = <Text>Select which featuers you want active</Text>;
  const body = (
    <VStack align="left">
      <Checkbox
        onChange={() => handleChange(Filter.MAX)}
        defaultChecked={featuresActive.has(Filter.MAX)}
      >
        Max
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.MIN)}
        defaultChecked={featuresActive.has(Filter.MIN)}
      >
        Min
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.MEAN)}
        defaultChecked={featuresActive.has(Filter.MEAN)}
      >
        Mean
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.STD)}
        defaultChecked={featuresActive.has(Filter.STD)}
      >
        Standard Deviation
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.PEAKS)}
        defaultChecked={featuresActive.has(Filter.PEAKS)}
      >
        Peaks
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.ACC)}
        defaultChecked={featuresActive.has(Filter.ACC)}
      >
        Acceleration
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.ZCR)}
        defaultChecked={featuresActive.has(Filter.ZCR)}
      >
        Zero Crossing Rate
      </Checkbox>
      <Checkbox
        onChange={() => handleChange(Filter.RMS)}
        defaultChecked={featuresActive.has(Filter.RMS)}
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
            <Button ref={leastDestructiveRef} onClick={handleCancel}>
              {"Cancel"}
            </Button>
            <Button
              isDisabled={featuresActiveToggle === featuresActive}
              variant="solid"
              colorScheme="red"
              onClick={handleSetFeaturesActive}
              ml={3}
            >
              {"Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default FilterFeaturesDialogBox;
