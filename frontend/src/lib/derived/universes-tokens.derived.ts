import {
  CKBTC_UNIVERSE_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import type {
  TokensStoreData,
  TokensStoreUniverseData,
} from "$lib/stores/tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const nnsTokenStore = derived<
  [Readable<TokensStoreData>],
  TokensStoreUniverseData
>([tokensStore], ([$tokensStore]) => $tokensStore[OWN_CANISTER_ID_TEXT]);

export const ckBTCTokenStore = derived<
  [Readable<TokensStoreData>],
  TokensStoreUniverseData | undefined
>(
  [tokensStore],
  ([$tokensStore]) => $tokensStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
);

export const ckBTCTokenFeeStore = derived<
  [Readable<TokensStoreUniverseData | undefined>],
  TokenAmount | undefined
>([ckBTCTokenStore], ([$ckBTCTokenStore]) =>
  nonNullish($ckBTCTokenStore) && nonNullish($ckBTCTokenStore?.token)
    ? TokenAmount.fromE8s({
        amount: $ckBTCTokenStore.token.fee,
        token: {
          name: $ckBTCTokenStore.token.name,
          symbol: $ckBTCTokenStore.token.symbol,
        },
      })
    : undefined
);
