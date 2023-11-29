import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { i18n } from "$lib/stores/i18n";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const nnsUniverseStore: Readable<Universe> = derived(i18n, ($i18n) => ({
  canisterId: OWN_CANISTER_ID_TEXT,
  title: $i18n.core.ic,
  logo: IC_LOGO_ROUNDED,
  governance: true,
}));
