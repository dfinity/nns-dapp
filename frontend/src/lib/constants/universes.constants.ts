import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import type { Universe } from "$lib/types/universe";
import { OWN_CANISTER_ID_TEXT } from "./canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "./ckbtc-canister-ids.constants";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID_TEXT,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
};

export const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
  title: "ckBTC",
  logo: CKBTC_LOGO,
};

export const CKTESTBTC_UNIVERSE: Universe = {
  canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
  title: "ckTESTBTC",
  logo: CKTESTBTC_LOGO,
};
