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

const TestPassPercentCard = ({
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
      opacity={disabled ? 0.5 : 1}
    >
      <CardBody p={0} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="medium">
            {value.testsPassed} / {modelOptions.testNumber}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TestPassPercentCard;
