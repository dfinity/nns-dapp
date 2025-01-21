import { page } from "$app/stores";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  IMPORT_TOKEN_INDEX_ID_QUERY_PARAM,
  IMPORT_TOKEN_LEDGER_ID_QUERY_PARAM,
} from "$lib/constants/routes.constants";
import {
  snsTokensByLedgerCanisterIdStore,
  snsTokensByRootCanisterIdStore,
} from "$lib/derived/sns/sns-tokens.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mapEntries } from "$lib/utils/utils";
import { derived, type Readable } from "svelte/store";

export const tokensByUniverseIdStore: Readable<
  Record<string, IcrcTokenMetadata>
> = derived(
  [tokensStore, snsTokensByRootCanisterIdStore],
  ([$tokensStore, $snsTokensByRootCanisterIdStore]) => {
    return {
      ...mapEntries({
        obj: $tokensStore,
        mapFn: ([universeId, tokenData]) => [universeId, tokenData.token],
      }),
      ...$snsTokensByRootCanisterIdStore,
    };
  }
);

export const tokensByLedgerCanisterIdStore: Readable<
  Record<string, IcrcTokenMetadata>
> = derived(
  [tokensStore, snsTokensByLedgerCanisterIdStore],
  ([$tokensStore, $snsTokensByLedgerCanisterIdStore]) => {
    return {
      ...mapEntries({
        obj: $tokensStore,
        mapFn: ([universeId, tokenData]) =>
          universeId === OWN_CANISTER_ID_TEXT
            ? undefined
            : [universeId, tokenData.token],
      }),
      ...$snsTokensByLedgerCanisterIdStore,
      [LEDGER_CANISTER_ID.toText()]: $tokensStore[OWN_CANISTER_ID_TEXT].token,
    };
  }
);

export const importTokenLedgerIdQueryParameterStore: Readable<string | null> =
  derived(page, ($page) =>
    $page.url.searchParams.get(IMPORT_TOKEN_LEDGER_ID_QUERY_PARAM)
  );

export const importTokenIndexIdQueryParameterStore: Readable<string | null> =
  derived(page, ($page) =>
    $page.url.searchParams.get(IMPORT_TOKEN_INDEX_ID_QUERY_PARAM)
  );
