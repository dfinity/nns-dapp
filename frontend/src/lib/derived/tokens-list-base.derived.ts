import type { UserTokenBase } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

const convertUniverseToBaseTokenData = (universe: Universe): UserTokenBase => ({
  universeId: Principal.fromText(universe.canisterId),
  title: universe.title,
  logo: universe.logo,
  actions: [],
});

export const tokensListBaseStore = derived<
  Readable<Universe[]>,
  UserTokenBase[]
>(universesStore, (universes) => universes.map(convertUniverseToBaseTokenData));
