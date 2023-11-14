import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import type { Universe } from "$lib/types/universe";

export const nnsUniverseMock: Universe = {
  canisterId: OWN_CANISTER_ID_TEXT,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
};

export const ckBTCUniverseMock: Universe = {
  canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
  title: "ckBTC",
  logo: CKBTC_LOGO,
};

export const ckTESTBTCUniverseMock: Universe = {
  canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
  title: "ckTESTBTC",
  logo: CKTESTBTC_LOGO,
};
