import { MenuItem } from "@chakra-ui/react";
import { DataSamplesView } from "../model";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { useStore } from "../store";

const ShowGraphsMenuItem = () => {
  const { dataSamplesView, showGraphs } = useStore((s) => s.settings);
  const setDataSamplesView = useStore((s) => s.setDataSamplesView);
  const setShowGraphs = useStore((s) => s.setShowGraphs);

  const toggleShowGraphs = () => {
    setShowGraphs(!showGraphs);
    setDataSamplesView(
      !showGraphs
        ? DataSamplesView.GraphAndDataFeatures
        : DataSamplesView.DataFeatures
    );
  };

  return (
    <>
      {dataSamplesView !== DataSamplesView.Graph &&
        (showGraphs ? (
          <MenuItem onClick={toggleShowGraphs} icon={<RiEyeOffFill />}>
            <FormattedMessage id="hide-graphs-action" />
          </MenuItem>
        ) : (
          <MenuItem onClick={toggleShowGraphs} icon={<RiEyeFill />}>
            <FormattedMessage id="show-graphs-action" />
          </MenuItem>
        ))}
    </>
  );
};

export default ShowGraphsMenuItem;
