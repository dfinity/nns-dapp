import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  snsTokensByLedgerCanisterIdStore,
  snsTokensByRootCanisterIdStore,
} from "$lib/derived/sns/sns-tokens.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { derived, type Readable } from "svelte/store";

export const tokensByUniverseIdStore: Readable<
  Record<string, IcrcTokenMetadata>
> = derived(
  [tokensStore, snsTokensByRootCanisterIdStore],
  ([$tokensStore, $snsTokensByRootCanisterIdStore]) => {
    return {
      ...Object.fromEntries(
        Object.entries($tokensStore).map(([universeId, tokenData]) => [
          universeId,
          tokenData.token,
        ])
      ),
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
      ...Object.fromEntries(
        Object.entries($tokensStore)
          .filter(
            ([universeId, _tokenData]) => universeId !== OWN_CANISTER_ID_TEXT
          )
          .map(([universeId, tokenData]) => [universeId, tokenData.token])
      ),
      ...$snsTokensByLedgerCanisterIdStore,
      [LEDGER_CANISTER_ID.toText()]: $tokensStore[OWN_CANISTER_ID_TEXT].token,
    };
  }
);
