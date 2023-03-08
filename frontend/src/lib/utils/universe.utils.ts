import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { i18n } from "$lib/stores/i18n";
import type { Universe } from "$lib/types/universe";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import type { Principal } from "@dfinity/principal";
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
