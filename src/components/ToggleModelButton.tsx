import { Button, VStack } from "@chakra-ui/react";
import { useStore, ModelTypes } from "../store";

const ToggleModelButton = () => {
  const modelOptions = useStore((s) => s.modelOptions);
  const toggleModel = useStore((s) => s.toggleModel);
  const advancedOptionsEnabled = useStore((s) => s.advancedOptionsEnabled);

  return (
    <VStack>
      {advancedOptionsEnabled ? (
        modelOptions.modelType == ModelTypes.DEFAULT ? (
          <Button onClick={toggleModel} variant="secondary">
            Neural Network
          </Button>
        ) : (
          <Button onClick={toggleModel} variant="secondary">
            Logistic Regression
          </Button>
        )
      ) : (
        <></>
      )}
    </VStack>
  );
};

export default ToggleModelButton;
