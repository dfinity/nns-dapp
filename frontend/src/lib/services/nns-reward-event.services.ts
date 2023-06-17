import { governanceApiService } from "$lib/api-services/governance.api-service";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import type { RewardEvent } from "@dfinity/nns";
import { queryAndUpdate } from "./utils.services";

export const loadLatestRewardEvent = (): Promise<void> => {
  return queryAndUpdate<RewardEvent, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: (options) => governanceApiService.queryLastestRewardEvent(options),
    onLoad: ({ response: rewardEvent, certified }) => {
      nnsLatestRewardEventStore.setLatestRewardEvent({
        rewardEvent,
        certified,
      });
    },
    onError: ({ error: err }) => {
      console.error(err);
      // We swallow the error because the reward event is not critical to the app.
    },
    logMessage: "Getting latest reward event for NNS",
  });
};
