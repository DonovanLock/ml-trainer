/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Grid, GridItem, Text } from "@chakra-ui/react";
import React from "react";
import { FormattedMessage } from "react-intl";
import { applyFilters } from "../ml";
import { XYZData } from "../model";
import { useStore } from "../store";
import { calculateGradientColor } from "../utils/gradient-calculator";
import ClickableTooltip from "./ClickableTooltip";

interface RecordingFingerprintProps extends BoxProps {
  data: XYZData;
  size: "sm" | "md";
  isTest: boolean;
}

const RecordingFingerprint = ({
  data,
  size,
  isTest,
  ...rest
}: RecordingFingerprintProps) => {
  const dataWindow = useStore((s) => s.dataWindow);
  const modelOptions = useStore((s) => s.modelOptions);
  const dataFeatures = applyFilters(data, dataWindow, modelOptions, {
    normalize: true,
  });

  return (
    <Grid
      w={`${size === "md" ? 158 : 92}px`}
      h="100%"
      position="relative"
      borderRadius="md"
      borderWidth={isTest ? 2 : 1}
      borderColor={isTest ? "blue" : "gray.200"}
      overflow="hidden"
      templateColumns={`repeat(${Object.keys(dataFeatures).length}, 1fr)`}
      {...rest}
    >
      {Object.keys(dataFeatures).map((k, idx) => (
        <ClickableTooltip
          placement="end-end"
          key={idx}
          label={
            <Text p={3}>
              <FormattedMessage id={`fingerprint-${k}-tooltip`} />
            </Text>
          }
        >
          <GridItem
            w="100%"
            backgroundColor={calculateGradientColor("#007DBC", dataFeatures[k])}
          />
        </ClickableTooltip>
      ))}
    </Grid>
  );
};

export default React.memo(RecordingFingerprint);
