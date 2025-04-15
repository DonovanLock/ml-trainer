import {
  VStack,
  Text,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useStore } from "../store";

const TestSlider = () => {
  const modelOptions = useStore((s) => s.modelOptions);
  const actions = useStore((s) => s.actions);
  const advancedOptionsEnabled = useStore((s) => s.advancedOptionsEnabled);
  const setTestNumber = useStore((s) => s.setTestNumber);
  const [testNumber, setTestNum] = useState(modelOptions.testNumber);
  const [showTestTooltip, setShowTestTooltip] = useState(false);

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

  return (
    <VStack>
      {advancedOptionsEnabled ? (
        <VStack>
          <Text textStyle="sm">No. Testing Samples</Text>
          <Slider
            id="TestData%age"
            defaultValue={modelOptions.testNumber}
            width="150px"
            min={0}
            max={maxTestSize}
            size="md"
            colorScheme="blue"
            onMouseEnter={() => setShowTestTooltip(true)}
            onMouseLeave={() => setShowTestTooltip(false)}
            onChange={(val) => {
              setTestNum(Number(val));
              setTestNumber(Number(val));
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
  );
};

export default TestSlider;
