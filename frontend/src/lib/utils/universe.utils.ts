import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import type { Principal } from "@dfinity/principal";

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
