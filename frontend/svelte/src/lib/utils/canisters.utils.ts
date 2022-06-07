import { ONE_TRILLION } from "../constants/icp.constants";
import { formatNumber } from "./format.utils";

export const formatCyclesToTCycles = (cycles: bigint): string =>
  formatNumber(Number(cycles) / Number(ONE_TRILLION), {
    minFraction: 3,
    maxFraction: 3,
  });
