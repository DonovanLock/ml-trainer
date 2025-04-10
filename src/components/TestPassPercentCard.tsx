import { Card, CardBody, Text, VStack } from "@chakra-ui/react";
import { Action } from "../model";
import { tourElClassname } from "../tours";
import { useStore } from "../store";

interface TestPassPercentCardProps {
  value: Action;
  selected?: boolean;
  readOnly: boolean;
  onDeleteAction?: () => void;
  onSelectRow?: () => void;
  disabled?: boolean;
}

const TestPassCard = ({
  value,
  onSelectRow,
  selected = false,
  disabled,
}: TestPassPercentCardProps) => {
  const modelOptions = useStore((s) => s.modelOptions);
  return (
    <Card
      p={2}
      h="120px"
      w="200px"
      display="flex"
      borderColor={selected ? "brand.500" : "transparent"}
      borderWidth={1}
      onClick={onSelectRow}
      position="relative"
      className={tourElClassname.dataSamplesActionCard}
      opacity={disabled ? 0.5 : undefined}
    >
      <CardBody p={0} alignContent="centre">
        <VStack>
          <Text fontSize="xl">
            {value.testsPassed} out of {modelOptions.testNumber}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TestPassCard;
