export const formatEstimatedFee = (bitcoinEstimatedFee: bigint): number =>
  Number(bitcoinEstimatedFee) / 100_000_000;
