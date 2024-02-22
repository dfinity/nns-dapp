import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { authSignedInStore } from "$lib/derived/auth.derived";
import { pageStore } from "$lib/derived/page.derived";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

/** Returns true when the indication needs to be shown */
export const actionableProposalIndicationEnabledStore: Readable<boolean> =
  derived(
    [pageStore, authSignedInStore],
    ([{ path: currentPath }, isSignedInd]) =>
      isNullish(currentPath)
        ? false
        : isSignedInd &&
          isSelectedPath({
            currentPath,
            paths: [AppPath.Proposals],
          })
  );
