import {
  Grid,
  GridItem,
  GridProps,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import AddDataGridGestureRow from "./AddDataGridGestureRow";
import InfoToolTip, { InfoToolTipProps } from "./InfoToolTip";
import { dummyGestureData } from "../dummy-gesture-data";

const gridCommonProps: Partial<GridProps> = {
  gridTemplateColumns: "200px 1fr",
  gap: 3,
  alignItems: "center",
  px: 10,
};

const AddDataGridView = () => {
  return (
    <VStack flexGrow={1} width="100%" alignItems="left">
      <Grid
        {...gridCommonProps}
        w="100%"
        h="3.25rem"
        alignItems="center"
        borderTopWidth={3}
        borderBottomWidth={3}
        borderColor="gray.200"
      >
        <GridColumnHeadingItem
          titleId="content.data.classification"
          descriptionId="content.data.classHelpBody"
        />
        <GridColumnHeadingItem
          titleId="content.data.data"
          descriptionId="content.data.dataDescription"
        />
      </Grid>
      <Grid {...gridCommonProps} w={0}>
        {dummyGestureData.map((g) => (
          <AddDataGridGestureRow key={g.name} gesture={g} />
        ))}
      </Grid>
    </VStack>
  );
};

const GridColumnHeadingItem = (props: InfoToolTipProps) => {
  return (
    <GridItem>
      <HStack opacity={0.7}>
        <Text>
          <FormattedMessage id={props.titleId} />
        </Text>
        <InfoToolTip {...props}></InfoToolTip>
      </HStack>
    </GridItem>
  );
};

export default AddDataGridView;
