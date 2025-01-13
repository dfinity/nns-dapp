import { universesStore } from "$lib/derived/universes.derived";
import type { UserTokenBase } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

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
