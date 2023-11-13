import {
  tokensStore,
  type TokensStore,
  type TokensStoreData,
} from "$lib/stores/tokens.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { getUniverseLogo, getUniverseTitle } from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

const convertUniverseToBaseTokenData =
  (tokensData: TokensStoreData) =>
  (universe: Universe): UserTokenData | undefined => {
    const universeId = Principal.fromText(universe.canisterId);
    const title = getUniverseTitle(universe);
    const token = tokensData[universe.canisterId]?.token;
    const logo = getUniverseLogo(universe);

    if (isNullish(token) || isNullish(title) || isNullish(logo)) {
      return undefined;
    }
    return {
      universeId,
      title,
      balance: new UnavailableTokenAmount(token),
      logo,
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
