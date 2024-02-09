import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { tokensStore, type TokensStore } from "$lib/stores/tokens.store";
import type { Principal } from "@dfinity/principal";
import type { Token } from "@dfinity/utils";
import { ICPToken } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

// Holds the token corresponding to the selected universe.
export const selectedTokenStore: Readable<Token | undefined> = derived<
  [Readable<Principal>, TokensStore],
  Token | undefined
>(
  [selectedUniverseIdStore, tokensStore],
  ([$selectedUniverseIdStore, $tokensStore]) => {
    if ($selectedUniverseIdStore.toText() === OWN_CANISTER_ID_TEXT) {
      return ICPToken;
    }
    return $tokensStore[$selectedUniverseIdStore.toText()]?.token;
  }
);
