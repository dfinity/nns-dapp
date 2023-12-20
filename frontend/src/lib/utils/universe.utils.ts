import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { i18n } from "$lib/stores/i18n";
import type { IcrcCanistersStoreData } from "$lib/stores/icrc-canisters.store";
import type { SnsSummary } from "$lib/types/sns";
import type { Universe } from "$lib/types/universe";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import type { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const isAllTokensPath = ({ path }: Page): boolean =>
  isSelectedPath({
    currentPath: path,
    paths: [AppPath.Accounts, AppPath.Wallet],
  });

export const isUniverseNns = (canisterId: Principal): boolean =>
  canisterId.toText() === OWN_CANISTER_ID.toText();

export const isUniverseCkBTC = (canisterId: Principal | string): boolean =>
  [
    CKBTC_UNIVERSE_CANISTER_ID.toText(),
    CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
  ].includes(typeof canisterId === "string" ? canisterId : canisterId.toText());

export const isUniverseRealCkBTC = (canister: Principal): boolean =>
  CKBTC_UNIVERSE_CANISTER_ID.toText() === canister.toText();

export const isUniverseCkTESTBTC = (
  canisterId: Principal | string | undefined
): boolean =>
  nonNullish(canisterId) &&
  (typeof canisterId === "string" ? canisterId : canisterId.toText()) ===
    CKTESTBTC_UNIVERSE_CANISTER_ID.toText();

export const isIcrcTokenUniverse = ({
  universeId,
  icrcCanisters,
}: {
  universeId: Principal;
  icrcCanisters: IcrcCanistersStoreData;
}): boolean => nonNullish(icrcCanisters[universeId.toText()]);

export const universeLogoAlt = ({
  summary,
  canisterId,
  title,
}: Universe): string => {
  const i18nObj = get(i18n);

  if (nonNullish(summary?.metadata.name)) {
    return `${summary?.metadata.name} ${i18nObj.sns_launchpad.project_logo}`;
  }

  if (isUniverseCkTESTBTC(canisterId)) {
    return i18nObj.ckbtc.test_logo;
  }

  if (isUniverseCkBTC(canisterId)) {
    return i18nObj.ckbtc.logo;
  }

  return replacePlaceholders(i18nObj.universe.universe_logo, {
    $universe: title,
  });
};

export const createUniverse = (summary: SnsSummary): Universe => ({
  canisterId: summary.rootCanisterId.toText(),
  summary,
  title: summary.metadata.name,
  logo: summary.metadata.logo,
});
