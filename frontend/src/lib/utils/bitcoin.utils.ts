import { BITCOIN_ESTIMATED_FEE_TO_FORMATTED_BTC } from "$lib/constants/bitcoin.constants";

export const formatEstimatedFee = (bitcoinEstimatedFee: bigint): number =>
  Number(bitcoinEstimatedFee) / BITCOIN_ESTIMATED_FEE_TO_FORMATTED_BTC;
