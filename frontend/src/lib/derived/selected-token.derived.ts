import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { Principal } from "@dfinity/principal";
import type { Token } from "@dfinity/utils";
import { ICPToken } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

// Holds the token corresponding to the selected universe.
export const selectedTokenStore: Readable<Token | undefined> = derived<
  [Readable<Principal>, Readable<Record<string, IcrcTokenMetadata>>],
  Token | undefined
>(
  [selectedUniverseIdStore, tokensByUniverseIdStore],
  ([$selectedUniverseIdStore, $tokensStore]) => {
    if ($selectedUniverseIdStore.toText() === OWN_CANISTER_ID_TEXT) {
      return ICPToken;
    }
    return $tokensStore[$selectedUniverseIdStore.toText()];
  }
);
