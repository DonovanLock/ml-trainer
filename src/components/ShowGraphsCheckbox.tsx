/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Checkbox, useBreakpointValue } from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { DataSamplesView } from "../model";
import { useStore } from "../store";
import { IconButton } from "@chakra-ui/react";
import { RiEyeLine, RiEyeOffLine, RiFileChart2Fill, RiLineChartFill, RiLineChartLine } from "react-icons/ri";

const ShowGraphsCheckbox = () => {
  const { dataSamplesView, showGraphs } = useStore((s) => s.settings);
  const setDataSamplesView = useStore((s) => s.setDataSamplesView);
  const setShowGraphs = useStore((s) => s.setShowGraphs);

  const handleShowGraphOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      setShowGraphs(isChecked);
      setDataSamplesView(
        isChecked
          ? DataSamplesView.GraphAndDataFeatures
          : DataSamplesView.DataFeatures
      );
    },
    [setDataSamplesView, setShowGraphs]
  );

  return (
    <>
      {dataSamplesView !== DataSamplesView.Graph && (
        useBreakpointValue({ "base": "base", "md": "md"}) === "base" ? (
          <IconButton
            aria-label="Toggle show graphs"
            icon={<RiFileChart2Fill />}
            onClick={() =>
              handleShowGraphOnChange({
                target: { checked: !showGraphs },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            color={showGraphs ? "black" : "gray.600"}
          />
        ) : (
          <Checkbox isChecked={showGraphs} onChange={handleShowGraphOnChange}>
            <FormattedMessage id="show-graphs-checkbox-label-text" />
          </Checkbox>
        )
      )}
    </>
  );
};

export default ShowGraphsCheckbox;
