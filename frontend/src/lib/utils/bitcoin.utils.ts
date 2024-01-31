import { formatTokenE8s } from "$lib/utils/token.utils";

export const formatEstimatedFee = (bitcoinEstimatedFee: bigint): string =>
  formatTokenE8s({
    value: bitcoinEstimatedFee,
    detailed: "height_decimals",
  });
