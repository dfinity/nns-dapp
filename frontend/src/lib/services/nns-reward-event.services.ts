import { governanceApiService } from "$lib/api-services/governance.api-service";
import type { RewardEvent } from "@dfinity/nns";
import { queryAndUpdate } from "./utils.services";

// TODO: Implement
export const loadLatestRewardEvent = (): Promise<void> => {
  return queryAndUpdate<RewardEvent, unknown>({
    request: (options) => governanceApiService.queryLastestRewardEvent(options),
    onLoad: () => {
      // TODO: Implement
      // console.log(rewardEvent);
    },
    onError: ({ error: err }) => {
      console.error(err);
    },
    logMessage: "Getting latest reward event for NNS",
  });
};
