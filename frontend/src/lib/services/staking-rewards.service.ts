import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
import {
  getStakingRewardData,
  type StakingRewardCalcParams,
} from "$lib/utils/staking-rewards.utils";

export const getRefreshStakingRewards = () => {
  let debounceTimer: ReturnType<typeof setTimeout>;
  let prevAuthState = false;
  let firstTime = true;

  return (params: StakingRewardCalcParams) => {
    clearTimeout(debounceTimer);
    const refreshData = () =>
      stakingRewardsStore.set(getStakingRewardData(params));

    if (params.auth !== prevAuthState || firstTime) {
      // No debounce if auth state changes, or if it's the first time: refresh immediately
      prevAuthState = params.auth;
      firstTime = false;
      refreshData();
    } else {
      debounceTimer = setTimeout(refreshData, 500);
    }
  };
};
