import { MenuItem } from "@chakra-ui/react";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { useStore } from "../store";

const EnableAdvancedModelOptionsMenuItem = () => {
  const advancedOptionsEnabled = useStore((s) => s.advancedOptionsEnabled);
  const toggleAdvancedOptionsEnabled = useStore(
    (s) => s.toggleAdvancedOptionsEnabled
  );

  return (
    <>
      {advancedOptionsEnabled ? (
        <MenuItem
          onClick={toggleAdvancedOptionsEnabled}
          icon={<RiEyeOffFill />}
        >
          <FormattedMessage id="disable-advanced-options-action" />
        </MenuItem>
      ) : (
        <MenuItem onClick={toggleAdvancedOptionsEnabled} icon={<RiEyeFill />}>
          <FormattedMessage id="enable-advanced-options-action" />
        </MenuItem>
      )}
    </>
  );
};

export default EnableAdvancedModelOptionsMenuItem;
