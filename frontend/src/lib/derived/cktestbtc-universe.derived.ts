import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { i18n } from "$lib/stores/i18n";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const ckTESTBTCUniverseStore: Readable<Universe> = derived(
  i18n,
  ($i18n) => ({
    canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
    title: $i18n.ckbtc.test_title,
    logo: CKTESTBTC_LOGO,
    governance: false,
  })
);
