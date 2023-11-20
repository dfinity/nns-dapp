import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

export const icpTokensListVisitors = derived<
  Readable<Universe>,
  UserTokenData[]
>(nnsUniverseStore, (nnsUniverse) => [
  {
    universeId: Principal.fromText(nnsUniverse.canisterId),
    title: nnsUniverse.title,
    balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
    logo: nnsUniverse.logo,
    actions: [UserTokenAction.GoToDetail],
  },
]);
