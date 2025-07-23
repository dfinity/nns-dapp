import type { StakingRewardResult } from "$lib/utils/staking-rewards.utils";
import { writable } from "svelte/store";

export const stakingRewardsStore = writable<StakingRewardResult | undefined>(
  undefined
);
