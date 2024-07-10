import { Grid, GridItem, GridProps, HStack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useGestureData } from "../gestures-hooks";
import AddDataGridGestureRow from "./AddDataGridGestureRow";
import AddDataGridWalkThrough from "./AddDataGridWalkThrough";
import InfoToolTip, { InfoToolTipProps } from "./InfoToolTip";

const gridCommonProps: Partial<GridProps> = {
  gridTemplateColumns: "200px 1fr",
  gap: 3,
  px: 10,
  py: 2,
  w: "100%",
};

const AddDataGridView = () => {
  const [gestures] = useGestureData();
  const [selected, setSelected] = useState<number>(0);
  const showWalkThrough = useMemo<boolean>(
    () =>
      gestures.data.length === 0 ||
      (gestures.data.length === 1 && gestures.data[0].recordings.length === 0),
    [gestures.data]
  );

  return (
    <>
      <Grid
        {...gridCommonProps}
        flexShrink={0}
        position="sticky"
        top={0}
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
      <Grid
        {...gridCommonProps}
        alignItems="start"
        autoRows="max-content"
        overflow="auto"
        flexGrow={1}
        h={0}
      >
        {showWalkThrough ? (
          <AddDataGridWalkThrough gesture={gestures.data[0]} />
        ) : (
          gestures.data.map((g, idx) => (
            <AddDataGridGestureRow
              key={g.ID}
              gesture={g}
              selected={selected === idx}
              onSelectRow={() => setSelected(idx)}
            />
          ))
        )}
      </Grid>
    </>
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
