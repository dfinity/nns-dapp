import {
  tokensStore,
  type TokensStore,
  type TokensStoreData,
} from "$lib/stores/tokens.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

const convertUniverseToBaseTokenData =
  (tokensData: TokensStoreData) =>
  (universe: Universe): UserTokenData | undefined => {
    const token = tokensData[universe.canisterId]?.token;

    if (isNullish(token)) {
      return undefined;
    }
    return {
      universeId: Principal.fromText(universe.canisterId),
      title: universe.title,
      balance: new UnavailableTokenAmount(token),
      token,
      feeE8s: token.fee,
      logo: universe.logo,
      actions: [],
    };
  };

export const tokensListBaseStore = derived<
  [Readable<Universe[]>, TokensStore],
  UserTokenData[]
>([universesStore, tokensStore], ([universes, tokensData]) =>
  universes
    .map(convertUniverseToBaseTokenData(tokensData))
    .filter((data): data is UserTokenData => nonNullish(data))
);
