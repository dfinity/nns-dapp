import {
  CKBTC_UNIVERSE_CANISTER_ID,
  OWN_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import type {
  TokensStore,
  TokensStoreData,
  TokensStoreUniverseData,
} from "$lib/stores/tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { ICPToken } from "@dfinity/nns";
import { derived } from "svelte/store";

export const NNS_TOKEN: TokensStoreUniverseData = {
  token: {
    ...ICPToken,
    fee: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
  },
  certified: true,
};

export const universesTokensStore = derived<[TokensStore], TokensStoreData>(
  [tokensStore],
  ([$tokenStore]) => ({
    [OWN_CANISTER_ID.toText()]: NNS_TOKEN,
    ...$tokenStore,
  })
);

export const nnsTokenStore = derived<[TokensStore], TokensStoreUniverseData>(
  [tokensStore],
  ([$tokenStore]) => $tokenStore[OWN_CANISTER_ID.toText()]
);

export const ckBTCTokenStore = derived<
  [TokensStore],
  TokensStoreUniverseData | undefined
>(
  [tokensStore],
  ([$tokenStore]) => $tokenStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
);
