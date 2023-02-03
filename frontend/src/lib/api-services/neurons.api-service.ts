import {
  addHotkey,
  autoStakeMaturity,
  claimOrRefreshNeuron,
  disburse,
  increaseDissolveDelay,
  joinCommunityFund,
  leaveCommunityFund,
  mergeMaturity,
  mergeNeurons,
  queryKnownNeurons,
  queryNeuron,
  queryNeurons,
  removeHotkey,
  setFollowees,
  spawnNeuron,
  splitNeuron,
  stakeMaturity,
  stakeNeuron,
  startDissolving,
  stopDissolving,
  type ApiAutoStakeMaturityParams,
  type ApiDisburseParams,
  type ApiIncreaseDissolveDelayParams,
  type ApiManageHotkeyParams,
  type ApiManageNeuronParams,
  type ApiMergeMaturityParams,
  type ApiMergeNeuronsParams,
  type ApiQueryNeuronParams,
  type ApiQueryParams,
  type ApiSetFolloweesParams,
  type ApiSpawnNeuronParams,
  type ApiSplitNeuronParams,
  type ApiStakeMaturityParams,
  type ApiStakeNeuronParams,
} from "$lib/api/governance.api";

export const neuronsApiService = {
  // Read calls
  queryKnownNeurons(params: ApiQueryParams) {
    return queryKnownNeurons(params);
  },
  queryNeuron(params: ApiQueryNeuronParams) {
    return queryNeuron(params);
  },
  queryNeurons(params: ApiQueryParams) {
    return queryNeurons(params);
  },

  // Action calls
  addHotkey(params: ApiManageHotkeyParams) {
    return addHotkey(params);
  },
  autoStakeMaturity(params: ApiAutoStakeMaturityParams) {
    return autoStakeMaturity(params);
  },
  claimOrRefreshNeuron(params: ApiManageNeuronParams) {
    return claimOrRefreshNeuron(params);
  },
  disburse(params: ApiDisburseParams) {
    return disburse(params);
  },
  increaseDissolveDelay(params: ApiIncreaseDissolveDelayParams) {
    return increaseDissolveDelay(params);
  },
  joinCommunityFund(params: ApiManageNeuronParams) {
    return joinCommunityFund(params);
  },
  leaveCommunityFund(params: ApiManageNeuronParams) {
    return leaveCommunityFund(params);
  },
  // @deprecated
  mergeMaturity(params: ApiMergeMaturityParams) {
    return mergeMaturity(params);
  },
  mergeNeurons(params: ApiMergeNeuronsParams) {
    return mergeNeurons(params);
  },
  removeHotkey(params: ApiManageHotkeyParams) {
    return removeHotkey(params);
  },
  setFollowees(params: ApiSetFolloweesParams) {
    return setFollowees(params);
  },
  spawnNeuron(params: ApiSpawnNeuronParams) {
    return spawnNeuron(params);
  },
  splitNeuron(params: ApiSplitNeuronParams) {
    return splitNeuron(params);
  },
  stakeMaturity(params: ApiStakeMaturityParams) {
    return stakeMaturity(params);
  },
  stakeNeuron(params: ApiStakeNeuronParams) {
    return stakeNeuron(params);
  },
  startDissolving(params: ApiManageNeuronParams) {
    return startDissolving(params);
  },
  stopDissolving(params: ApiManageNeuronParams) {
    return stopDissolving(params);
  },
};
