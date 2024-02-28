import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { authSignedInStore } from "$lib/derived/auth.derived";
import { pageStore } from "$lib/derived/page.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { mapEntries } from "$lib/utils/utils";
import { isNullish } from "@dfinity/utils";
import { derived, get, type Readable } from "svelte/store";

export interface ActionableProposalCountData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number | undefined;
}

/** Returns true when the indication needs to be shown */
export const actionableProposalIndicationEnabledStore: Readable<boolean> =
  derived(
    [pageStore, authSignedInStore],
    ([{ path: currentPath }, isSignedIn]) =>
      isNullish(currentPath) || !get(ENABLE_VOTING_INDICATION)
        ? false
        : isSignedIn &&
          isSelectedPath({
            currentPath,
            paths: [AppPath.Proposals],
          })
  );

/** A store that contains the count of proposals that can be voted on by the user mapped by canister id (nns + snses) */
export const actionableProposalCountStore: Readable<ActionableProposalCountData> =
  derived(
    [actionableNnsProposalsStore, actionableSnsProposalsStore],
    ([{ proposals: nnsProposals }, actionableSnsProposals]) => ({
      [OWN_CANISTER_ID_TEXT]: nnsProposals?.length,
      ...mapEntries({
        obj: actionableSnsProposals,
        mapFn: ([canisterId, proposals]) => [canisterId, proposals.length],
      }),
    })
  );
