/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ActionData } from "../model";

export const getTotalNumSamples = (actions: ActionData[]) =>
  actions.map((a) => a.recordings).reduce((acc, curr) => acc + curr.length, 0);
