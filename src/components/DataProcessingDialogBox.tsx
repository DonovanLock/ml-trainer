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
import { useRef } from "react";

const DataProcessingDialogBox = () => {
  const modelOptions = useStore((s) => s.modelOptions);
  const setDitheringDistortionRotation = useStore(
    (s) => s.setDitheringDistortionRotation
  );
  const isOpen = useStore((s) => s.isDataProcessingDialogOpen);
  const closeDialog = useStore((s) => s.closeDialog);

  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const heading = (
    <Text>Select which modes of training data processing you want active</Text>
  );

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
              <Checkbox
                key="dith"
                onChange={(e) => {
                  setDitheringDistortionRotation(
                    e.target.checked,
                    modelOptions.distortion,
                    modelOptions.rotation
                  );
                }}
                isChecked={modelOptions.dithering}
              >
                Dithering
              </Checkbox>
              <Checkbox
                key="dist"
                onChange={(e) => {
                  setDitheringDistortionRotation(
                    modelOptions.dithering,
                    e.target.checked,
                    modelOptions.rotation
                  );
                }}
                isChecked={modelOptions.distortion}
              >
                Distortion
              </Checkbox>
              <Checkbox
                key="rot"
                onChange={(e) => {
                  setDitheringDistortionRotation(
                    modelOptions.dithering,
                    modelOptions.distortion,
                    e.target.checked
                  );
                }}
                isChecked={modelOptions.rotation}
              >
                Rotation
              </Checkbox>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={closeDialog}
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

export default DataProcessingDialogBox;
