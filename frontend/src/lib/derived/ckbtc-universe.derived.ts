import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { i18n } from "$lib/stores/i18n";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const ckBTCUniverseStore: Readable<Universe> = derived(
  i18n,
  ($i18n) => ({
    canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
    title: $i18n.ckbtc.title,
    logo: CKBTC_LOGO,
    governance: false,
  })
);
