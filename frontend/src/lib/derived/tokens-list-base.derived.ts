import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import type { UserTokenBase } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

const getLedgerCanisterIdFromUniverse = (universe: Universe): Principal => {
  if (universe.canisterId === OWN_CANISTER_ID_TEXT) {
    return LEDGER_CANISTER_ID;
  }
  if (nonNullish(universe.summary)) {
    return universe.summary.ledgerCanisterId;
  }
  return Principal.fromText(universe.canisterId);
};

const convertUniverseToBaseTokenData = (universe: Universe): UserTokenBase => ({
  universeId: Principal.fromText(universe.canisterId),
  ledgerCanisterId: getLedgerCanisterIdFromUniverse(universe),
  title: universe.title,
  logo: universe.logo,
  actions: [],
});

export const tokensListBaseStore = derived<
  Readable<Universe[]>,
  UserTokenBase[]
>(universesStore, (universes) => universes.map(convertUniverseToBaseTokenData));
