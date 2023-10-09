import { queryFinalizationStatus } from "$lib/api/sns-sale.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getOrCreateSnsFinalizationStatusStore } from "$lib/stores/sns-finalization-status.store";
import { snsSummariesStore } from "$lib/stores/sns.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { swapEndedMoreThanOneWeekAgo } from "$lib/utils/sns.utils";
import type { Principal } from "@dfinity/principal";
import {
  SnsSwapLifecycle,
  type SnsGetAutoFinalizationStatusResponse,
} from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

export const loadSnsFinalizationStatus = async (rootCanisterId: Principal) => {
  const summaries = get(snsSummariesStore);
  const summary = summaries.find(
    (s) => s.rootCanisterId.toText() === rootCanisterId.toText()
  );
  // We don't want to do calls that we know are unnecessary.
  // The project starts finalizing right after the sale ends.
  // It might take a few hours.
  // Waiting one week ensures that the project is not finalizing anymore.
  if (
    isNullish(summary) ||
    summary.swap.lifecycle !== SnsSwapLifecycle.Committed ||
    swapEndedMoreThanOneWeekAgo({ summary, nowInSeconds: nowInSeconds() })
  ) {
    return;
  }
  await queryAndUpdate<
    SnsGetAutoFinalizationStatusResponse | undefined,
    unknown
  >({
    strategy: FORCE_CALL_STRATEGY,
    identityType: "anonymous",
    request: ({ certified, identity }) =>
      queryFinalizationStatus({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response, certified }) => {
      // If the response is `undefined`, it means the method is not supported.
      // In that case, there is no need to update the store.
      if (nonNullish(response)) {
        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        store.setData({
          data: response,
          certified,
        });
      }
    },
    onError: ({ error: err }) => {
      // Ignore the error. This is a bonus feature. If it fails, the UX isn't affected.
      console.error(err);
    },
    logMessage: "Querying SNS finalization status",
  });
};
