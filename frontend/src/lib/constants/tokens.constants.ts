import { allCkTokens } from "$lib/constants/ck-canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETH_UNIVERSE_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { IS_TESTNET } from "$lib/constants/environment.constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
import { ICPToken } from "@dfinity/utils";

export const NNS_TOKEN_DATA = {
  ...ICPToken,
  fee: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
};

export const NNS_TOKEN: TokensStoreUniverseData = {
  token: NNS_TOKEN_DATA,
  certified: true,
};

// Tokens that have significance within the Internet Computer ecosystem.
// The fixed order maps to a descending order in the fully diluted valuation of the underlying native tokens.
export const IMPORTANT_CK_TOKEN_IDS = [
  CKBTC_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
  // Skip for test environment, because these canisters do not exist there.
  ...(IS_TESTNET
    ? []
    : allCkTokens.map(({ ledgerCanisterId }) => ledgerCanisterId)),
  // test ck tokens
  CKTESTBTC_UNIVERSE_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
];
