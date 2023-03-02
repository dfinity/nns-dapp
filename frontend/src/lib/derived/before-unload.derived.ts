import { saleInProgress } from "$lib/stores/sns-sale.store";
import type { VoteRegistrationStoreData } from "$lib/stores/vote-registration.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import { voteRegistrationActive } from "$lib/utils/proposals.utils";
import { derived, type Readable } from "svelte/store";

export const confirmBeforeCloseStore = derived<
  [Readable<VoteRegistrationStoreData>, Readable<boolean>],
  boolean
>(
  [voteRegistrationStore, saleInProgress],
  ([$voteRegistrationStore, $saleInProgress]) =>
    voteRegistrationActive($voteRegistrationStore.registrations) ||
    $saleInProgress
);
