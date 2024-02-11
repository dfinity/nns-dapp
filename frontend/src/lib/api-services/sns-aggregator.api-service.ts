import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { SECONDS_IN_MINUTE } from "$lib/constants/constants";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { nowInSeconds } from "$lib/utils/date.utils";
import { isNullish } from "@dfinity/utils";

const cacheExpirationDurationSeconds = 5 * SECONDS_IN_MINUTE;

interface SnsAggregatorCache {
  data: Promise<CachedSnsDto[]>;
  // When the neurons were cached.
  timestampSeconds: number;
}

let snsAggregatorCache: SnsAggregatorCache | null = null;

export const clearCache = () => {
  snsAggregatorCache = null;
};

export const snsAggregatorApiService = {
  async querySnsProjects() {
    if (
      isNullish(snsAggregatorCache) ||
      nowInSeconds() - snsAggregatorCache.timestampSeconds >
        cacheExpirationDurationSeconds
    ) {
      snsAggregatorCache = {
        data: querySnsProjects(),
        timestampSeconds: nowInSeconds(),
      };
    }

    return snsAggregatorCache.data;
  },
};
