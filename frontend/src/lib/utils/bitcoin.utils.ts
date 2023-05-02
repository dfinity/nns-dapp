import { BITCOIN_ESTIMATED_FEE_TO_FORMATTED_BTC } from "$lib/constants/bitcoin.constants";

const estimatedFee = (bitcoinEstimatedFee: bigint): number =>
  Number(bitcoinEstimatedFee) / BITCOIN_ESTIMATED_FEE_TO_FORMATTED_BTC;

export const formatEstimatedFee = (bitcoinEstimatedFee: bigint): string =>
  `${estimatedFee(bitcoinEstimatedFee)}`;
