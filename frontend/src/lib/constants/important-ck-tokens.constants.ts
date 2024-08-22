import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";

// Tokens that have significance within the Internet Computer ecosystem.
// The fixed order maps to a descending order in the market cap of the underlying native tokens.
export const IMPORTANT_CK_TOKEN_IDS = [
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
];
