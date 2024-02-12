import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { SECONDS_IN_MINUTE } from "$lib/constants/constants";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { nowInSeconds } from "$lib/utils/date.utils";
import { isNullish } from "@dfinity/utils";

const cacheExpirationDurationSeconds = 5 * SECONDS_IN_MINUTE;

interface SnsAggregatorCache {
  data: Promise<CachedSnsDto[]>;
  // When the data was cached.
  timestampSeconds: number;
}

let snsAggregatorCache: SnsAggregatorCache | null = null;

// For testing purposes.
export const clearSnsAggregatorCache = () => {
  snsAggregatorCache = null;
};

export const snsAggregatorApiService = {
  querySnsProjects() {
    if (
      isNullish(snsAggregatorCache) ||
      nowInSeconds() - snsAggregatorCache.timestampSeconds >
        cacheExpirationDurationSeconds
    ) {
      snsAggregatorCache = {
        data: querySnsProjects().catch((err) => {
          // If the request fails, we don't want to cache the error.
          snsAggregatorCache = null;
          // But we still want to throw the error for whoever called this function.
          throw err;
        }),
        timestampSeconds: nowInSeconds(),
      };
    }

    return snsAggregatorCache.data;
  },
};
