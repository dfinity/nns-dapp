import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  icrcCanistersStore,
  type IcrcCanistersStore,
  type IcrcCanistersStoreData,
} from "$lib/derived/icrc-canisters.derived";
import { pageStore, type Page } from "$lib/derived/page.derived";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { ENABLE_CKTESTBTC } from "$lib/stores/feature-flags.store";
import type { Universe, UniverseCanisterId } from "$lib/types/universe";
import {
  isAllTokensPath,
  isUniverseCkBTC,
  isUniverseCkTESTBTC,
  isUniverseNns,
} from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

/**
 * In Neurons or ultimately in Voting screen, user can select the "universe" - e.g. display Neurons of Nns or a particular Sns
 * This "universe" is represented in the path of the URL: `/accounts/?u=<a-canister-id>...`
 * The store reads the routeStore and returns the context.
 * It defaults to NNS (OWN_CANISTER_ID) if the path is not a context path.
 */
const pageUniverseIdStore: Readable<Principal> = derived(
  pageStore,
  ({ universe }) => {
    if (![null, undefined, OWN_CANISTER_ID_TEXT].includes(universe)) {
      try {
        return Principal.fromText(universe);
      } catch (error: unknown) {
        // Ignore error as we redirect to default Nns or ckBTC
      }
    }
    // Consider NNS as default project
    return OWN_CANISTER_ID;
  }
);

export const selectedUniverseIdStore: Readable<Principal> = derived<
  [Readable<Principal>, Readable<Page>, IcrcCanistersStore, Readable<boolean>],
  Principal
>(
  [pageUniverseIdStore, pageStore, icrcCanistersStore, ENABLE_CKTESTBTC],
  ([canisterId, page, icrcCanisters, $ENABLE_CKTESTBTC]) => {
    const isCkBTC = isUniverseCkBTC(canisterId);
    const isIcrcToken = nonNullish(icrcCanisters[canisterId.toText()]);
    // ckBTC and ICRC Tokens are only available on Accounts therefore we fallback to Nns if selected and user switch to another view
    if ((isCkBTC || isIcrcToken) && !isAllTokensPath(page)) {
      return OWN_CANISTER_ID;
    }
    if (isUniverseCkTESTBTC(canisterId) && !$ENABLE_CKTESTBTC) {
      return OWN_CANISTER_ID;
    }

    return canisterId;
  }
);

/**
 * Is the selected universe Nns?
 */
export const isNnsUniverseStore = derived(
  selectedUniverseIdStore,
  ($selectedProjectId: Principal) => isUniverseNns($selectedProjectId)
);
/**
 * Is the selected universe ckBTC?
 */
export const isCkBTCUniverseStore = derived(
  selectedUniverseIdStore,
  ($selectedProjectId: Principal) => isUniverseCkBTC($selectedProjectId)
);

export const selectedIcrcTokenUniverseIdStore = derived(
  [pageUniverseIdStore, pageStore, icrcCanistersStore],
  ([$pageUniverseIdStore, $page, $icrcCanistersStore]: [
    Principal,
    Page,
    IcrcCanistersStoreData,
  ]) =>
    isAllTokensPath($page)
      ? $icrcCanistersStore[$pageUniverseIdStore.toText()]?.ledgerCanisterId
      : undefined
);

/**
 * Is the selected universe an ICRC Token?
 */
export const isIcrcTokenUniverseStore = derived(
  selectedIcrcTokenUniverseIdStore,
  ($selectedIcrcTokenUniverseIdStore) =>
    nonNullish($selectedIcrcTokenUniverseIdStore)
);

export const selectedUniverseStore: Readable<Universe> = derived(
  [selectedUniverseIdStore, selectableUniversesStore, nnsUniverseStore],
  ([$selectedUniverseIdStore, $selectableUniverses, nnsUniverse]) =>
    $selectableUniverses?.find(
      ({ canisterId }) => canisterId === $selectedUniverseIdStore.toText()
    ) ?? nnsUniverse
);

export const selectedCkBTCUniverseIdStore = derived<
  Readable<UniverseCanisterId>,
  UniverseCanisterId | undefined
>(selectedUniverseIdStore, ($selectedUniverseIdStore: Principal) =>
  isUniverseCkBTC($selectedUniverseIdStore)
    ? $selectedUniverseIdStore
    : undefined
);
