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
import { useRef, useEffect, useState } from "react";

interface CheckboxItemProps {
  filter: Filter;
  label: string;
  isChecked: boolean;
  onChange: (filter: Filter) => void;
}

const CheckboxItem = ({
  filter,
  label,
  isChecked,
  onChange,
}: CheckboxItemProps) => (
  <Checkbox onChange={() => onChange(filter)} isChecked={isChecked}>
    {label}
  </Checkbox>
);

const FilterFeaturesDialogBox = () => {
  const {
    modelOptions,
    actions,
    isFeaturesFilterDialogOpen,
    toggleFeaturesActive,
    setActionName,
    closeDialog,
  } = useStore((state) => ({
    modelOptions: state.modelOptions,
    actions: state.actions,
    isFeaturesFilterDialogOpen: state.isFeaturesFilterDialogOpen,
    toggleFeaturesActive: state.toggleFeaturesActive,
    setActionName: state.setActionName,
    closeDialog: state.closeDialog,
  }));

  const featuresActive = modelOptions.featuresActive;
  const [selectedFeatures, setSelectedFeatures] = useState(
    new Set(featuresActive)
  );
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isFeaturesFilterDialogOpen) {
      setSelectedFeatures(new Set(featuresActive));
    }
  }, [isFeaturesFilterDialogOpen, featuresActive]);

  const handleChange = (filter: Filter) => {
    setSelectedFeatures((prev) => {
      const updated = new Set(prev);
      if (updated.has(filter)) {
        updated.delete(filter);
      } else {
        updated.add(filter);
      }
      return updated;
    });
  };

  const handleSetFeaturesActive = () => {
    toggleFeaturesActive(selectedFeatures);

    if (actions.length > 0) {
      const temp = actions[0].name;
      setActionName(actions[0].ID, "");
      setActionName(actions[0].ID, temp);
    }

    closeDialog();
  };

  const handleCancel = () => {
    closeDialog();
  };

  const filterOptions = [
    { filter: Filter.MAX, label: "Max" },
    { filter: Filter.MIN, label: "Min" },
    { filter: Filter.MEAN, label: "Mean" },
    { filter: Filter.STD, label: "Standard Deviation" },
    { filter: Filter.PEAKS, label: "Peaks" },
    { filter: Filter.ACC, label: "Acceleration" },
    { filter: Filter.ZCR, label: "Zero Crossing Rate" },
    { filter: Filter.RMS, label: "Root Mean Square" },
  ];

  const hasChanges = () => {
    if (selectedFeatures.size !== featuresActive.size) return true;
    return ![...selectedFeatures].every((filter) => featuresActive.has(filter));
  };

  return (
    <AlertDialog
      isOpen={isFeaturesFilterDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={handleCancel}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading as="h2" size="md">
              <Text>Select which features you want active</Text>
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack align="start" spacing={2}>
              {filterOptions.map(({ filter, label }) => (
                <CheckboxItem
                  key={filter}
                  filter={filter}
                  label={label}
                  isChecked={selectedFeatures.has(filter)}
                  onChange={handleChange}
                />
              ))}
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              isDisabled={!hasChanges()}
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
