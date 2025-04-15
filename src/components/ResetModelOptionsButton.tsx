import { Button, VStack } from "@chakra-ui/react";
import { useStore } from "../store";

const ResetModelOptionsButton = () => {
  const resetModelOptions = useStore((s) => s.resetModelOptions);
  const advancedOptionsEnabled = useStore((s) => s.advancedOptionsEnabled);

  return (
    <VStack>
      {advancedOptionsEnabled ? (
        <Button onClick={resetModelOptions} variant="primary">
          Reset Sliders
        </Button>
      ) : (
        <></>
      )}
    </VStack>
  );
};

export default ResetModelOptionsButton;
