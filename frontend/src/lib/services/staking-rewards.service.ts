import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
import {
  getStakingRewardData,
  type StakingRewardCalcParams,
} from "$lib/utils/staking-rewards.utils";

// Encapusaling the variables below in a closure so that they are reset during the different tests
// Otherwise, this function is supposed to be called only once, in the app root initialization
export const getRefreshStakingRewards = () => {
  let debounceTimer: ReturnType<typeof setTimeout>;
  // If the auth state changes, we want to refresh the data immediately to reflect that
  let prevAuthState = false;
  // We also want to refresh it immediately the first time, in order to set the correct loading state
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
