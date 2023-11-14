import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { i18n } from "$lib/stores/i18n";
import type { SnsSummary } from "$lib/types/sns";
import type { Universe } from "$lib/types/universe";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const pathSupportsCkBTC = ({ path }: Page): boolean =>
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

export const universeLogoAlt = ({ summary, canisterId }: Universe): string => {
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

  return i18nObj.auth.ic_logo;
};

export const getUniverseTitle = (universe: Universe): string | undefined => {
  const i18nKeys = get(i18n);
  const universeId = Principal.fromText(universe.canisterId);
  return isUniverseNns(universeId)
    ? i18nKeys.core.ic
    : isUniverseCkTESTBTC(universeId)
    ? i18nKeys.ckbtc.test_title
    : isUniverseRealCkBTC(universeId)
    ? i18nKeys.ckbtc.title
    : universe.summary?.metadata.name;
};

export const getUniverseLogo = (universe: Universe): string | undefined => {
  const universeId = Principal.fromText(universe.canisterId);
  return isUniverseNns(universeId)
    ? IC_LOGO_ROUNDED
    : isUniverseCkTESTBTC(universeId)
    ? CKTESTBTC_LOGO
    : isUniverseRealCkBTC(universeId)
    ? CKBTC_LOGO
    : universe.summary?.metadata.logo;
};

export const createUniverse = (summary: SnsSummary): Universe => ({
  canisterId: summary.rootCanisterId.toText(),
  summary,
  title: summary.metadata.name,
  logo: summary.metadata.logo,
});
