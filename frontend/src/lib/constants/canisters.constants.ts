import { SECONDS_IN_MINUTE } from "$lib/constants/constants";

// This minimum does not apply on testnets.
export const NEW_CANISTER_MIN_T_CYCLES = 2;

// Workers
export const SYNC_CYCLES_TIMER_INTERVAL = SECONDS_IN_MINUTE * 1000; // 1 minute
