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
import { useRef, useState, useCallback } from "react";

interface FilterCheckbox {
  active: boolean;
  name: string;
  filter: Filter;
}

const FilterFeaturesDialogBox = () => {
  const featuresActive = useStore((s) => s.modelOptions).featuresActive;
  const setFeaturesActive = useStore((s) => s.setFeaturesActive);
  const isOpen = useStore((s) => s.isFeaturesFilterDialogOpen);
  const closeDialog = useStore((s) => s.closeDialog);

  const getState = useCallback((featuresActive: Set<Filter>) => {
    return {
      max: {
        active: featuresActive.has(Filter.MAX),
        name: "Max",
        filter: Filter.MAX,
      },
      min: {
        active: featuresActive.has(Filter.MIN),
        name: "Min",
        filter: Filter.MIN,
      },
      mean: {
        active: featuresActive.has(Filter.MEAN),
        name: "Mean",
        filter: Filter.MEAN,
      },
      std: {
        active: featuresActive.has(Filter.STD),
        name: "Standard Deviation",
        filter: Filter.STD,
      },
      peaks: {
        active: featuresActive.has(Filter.PEAKS),
        name: "Peaks",
        filter: Filter.PEAKS,
      },
      acc: {
        active: featuresActive.has(Filter.ACC),
        name: "Acceleration",
        filter: Filter.ACC,
      },
      zcr: {
        active: featuresActive.has(Filter.ZCR),
        name: "Zero Crossing Rate",
        filter: Filter.ZCR,
      },
      rms: {
        active: featuresActive.has(Filter.RMS),
        name: "Root Mean Square",
        filter: Filter.RMS,
      },
    };
  }, []);

  const [featuresState, setFeaturesState] = useState<
    Record<string, FilterCheckbox>
  >(getState(featuresActive));

  const resetFeatures = useCallback(() => {
    const newActiveFilters = new Set<Filter>([
      Filter.MAX,
      Filter.MIN,
      Filter.MEAN,
      Filter.STD,
      Filter.PEAKS,
      Filter.ACC,
      Filter.ZCR,
      Filter.RMS,
    ]);
    setFeaturesActive(newActiveFilters);
    setFeaturesState(getState(newActiveFilters));
  }, [getState, setFeaturesActive]);

  const handleCancel = useCallback(() => {
    setFeaturesState(getState(featuresActive));
    closeDialog();
  }, [closeDialog, featuresActive, getState]);

  const handleConfirm = useCallback(() => {
    const newActiveFilters: Filter[] = [];
    for (const value of Object.values(featuresState)) {
      if (value.active) {
        newActiveFilters.push(value.filter);
      }
    }
    setFeaturesActive(new Set(newActiveFilters));
    closeDialog();
  }, [closeDialog, featuresState, setFeaturesActive]);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const heading = <Text>Select which featuers you want active</Text>;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={leastDestructiveRef}
      onClose={closeDialog}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading as="h2" size="md">
              {heading}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack align="left">
              {Object.entries(featuresState).map(([key, value]) => (
                <Checkbox
                  key={key}
                  onChange={(e) => {
                    setFeaturesState({
                      ...featuresState,
                      [key]: {
                        ...value,
                        active: e.target.checked,
                      },
                    });
                  }}
                  isChecked={value.active}
                >
                  {value.name}
                </Checkbox>
              ))}
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={resetFeatures} mr={3}>
              Reset Features
            </Button>
            <Button ref={leastDestructiveRef} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={handleConfirm}
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
