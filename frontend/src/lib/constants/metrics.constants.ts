import { SECONDS_IN_MINUTE } from "$lib/constants/constants";

// Workers periodicity
// 60 minutes - i.e. currently longer than a session therefore not refreshed
// We might revert this to a more dynamic data in the future e.g. every minute, that's why we keep the feature
export const SYNC_METRICS_TIMER_INTERVAL = SECONDS_IN_MINUTE * 60000;
