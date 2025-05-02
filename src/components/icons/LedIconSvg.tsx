/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useBreakpointValue, useToken } from "@chakra-ui/react";
import { icons, LedIconType } from "../../utils/icons";
import { useCallback } from "react";
import { useIntl } from "react-intl";

interface LedIconSvg {
  icon: LedIconType;
}

const LedIconSvg = ({ icon }: LedIconSvg) => {
  const [brand500, gray200] = useToken("colors", ["brand.500", "gray.200"]);
  const iconData = icons[icon];
  const intl = useIntl();
  const getFill = useCallback(
    (value: string) => {
      return value === "1" ? brand500 : gray200;
    },
    [brand500, gray200]
  );
  const sizes = { base: 40.025, md: 80.05 };
  const size = useBreakpointValue(sizes) ?? sizes.base;
  const padding = size / 40.025; // 2 for size = 80.05
  const pixelCountRow = 5;
  const pixelSize = (size - padding * (pixelCountRow - 1)) / pixelCountRow;
  return (
    <svg
      role="img"
      aria-label={intl.formatMessage({
        id: `led-icon-option-${icon.toLowerCase()}`,
      })}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <g>
        {Array.from({ length: pixelCountRow * pixelCountRow }).map((_, i) => (
          <rect
            width={pixelSize}
            height={pixelSize}
            rx="2"
            transform={`translate(${(i % 5) * (pixelSize + padding)} ${
              Math.floor(i / 5) * (pixelSize + padding)
            })`}
            fill={getFill(iconData[i])}
          />
        ))}
      </g>
    </svg>
  );
};
export default LedIconSvg;
