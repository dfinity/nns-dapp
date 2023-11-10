import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { i18n } from "$lib/stores/i18n";
import {
  tokensStore,
  type TokensStore,
  type TokensStoreData,
} from "$lib/stores/tokens.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import {
  isUniverseCkTESTBTC,
  isUniverseNns,
  isUniverseRealCkBTC,
} from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, get, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

const convertUniverseToVisitorTokenData =
  (tokensData: TokensStoreData) =>
  (universe: Universe): UserTokenData | undefined => {
    const i18nKeys = get(i18n);
    const universeId = Principal.fromText(universe.canisterId);
    const title = isUniverseNns(universeId)
      ? i18nKeys.core.ic
      : isUniverseCkTESTBTC(universeId)
      ? i18nKeys.ckbtc.test_title
      : isUniverseRealCkBTC(universeId)
      ? i18nKeys.ckbtc.title
      : universe.summary?.metadata.name;
    const token = tokensData[universe.canisterId]?.token;
    const logo = isUniverseNns(universeId)
      ? IC_LOGO_ROUNDED
      : isUniverseCkTESTBTC(universeId)
      ? CKTESTBTC_LOGO
      : isUniverseRealCkBTC(universeId)
      ? CKBTC_LOGO
      : universe.summary?.metadata.logo;

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
    .map(convertUniverseToVisitorTokenData(tokensData))
    .filter((data): data is UserTokenData => nonNullish(data))
);
