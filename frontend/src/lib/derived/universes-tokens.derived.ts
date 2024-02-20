import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import type {
  TokensStoreData,
  TokensStoreUniverseData,
} from "$lib/stores/tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { mapEntries } from "$lib/utils/utils";
import { TokenAmountV2, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const nnsTokenStore = derived<
  [Readable<TokensStoreData>],
  TokensStoreUniverseData
>([tokensStore], ([$tokensStore]) => $tokensStore[OWN_CANISTER_ID_TEXT]);

// TODO: should we create and icrcTokenStore and icrcTokenFeeStore ?

export const ckBTCTokenStore = derived<
  [Readable<TokensStoreData>],
  Record<UniverseCanisterIdText, TokensStoreUniverseData | undefined>
>([tokensStore], ([$tokensStore]) => ({
  [CKBTC_UNIVERSE_CANISTER_ID.toText()]:
    $tokensStore[CKBTC_UNIVERSE_CANISTER_ID.toText()],
  [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]:
    $tokensStore[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()],
}));

export const ckBTCTokenFeeStore = derived<
  [
    Readable<
      Record<UniverseCanisterIdText, TokensStoreUniverseData | undefined>
    >,
  ],
  Record<UniverseCanisterIdText, TokenAmountV2 | undefined>
>([ckBTCTokenStore], ([$ckBTCTokenStore]) =>
  mapEntries({
    obj: $ckBTCTokenStore,
    mapFn: ([key, value]) => [
      key,
      nonNullish(value) && nonNullish(value?.token)
        ? TokenAmountV2.fromUlps({
            amount: value.token.fee,
            token: {
              name: value.token.name,
              symbol: value.token.symbol,
              decimals: value.token.decimals,
            },
          })
        : undefined,
    ],
  })
);
