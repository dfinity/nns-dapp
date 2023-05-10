import { formatToken } from "$lib/utils/token.utils";

export const formatEstimatedFee = (bitcoinEstimatedFee: bigint): string =>
  formatToken({
    value: bitcoinEstimatedFee,
    detailed: "height_decimals",
  });
