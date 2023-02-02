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
  type ApiCallNeuronParams,
  type ApiDisburseParams,
  type ApiHotkeyCallParams,
  type ApiIncreaseDissolveDelayParams,
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
  queryNeuron(params: ApiQueryNeuronParams) {
    return queryNeuron(params);
  },
  queryNeurons(params: ApiQueryParams) {
    return queryNeurons(params);
  },
  queryKnownNeurons(params: ApiQueryParams) {
    return queryKnownNeurons(params);
  },

  // Action calls
  addHotkey(params: ApiHotkeyCallParams) {
    return addHotkey(params);
  },
  autoStakeMaturity(params: ApiAutoStakeMaturityParams) {
    return autoStakeMaturity(params);
  },
  claimOrRefreshNeuron(params: ApiCallNeuronParams) {
    return claimOrRefreshNeuron(params);
  },
  disburse(params: ApiDisburseParams) {
    return disburse(params);
  },
  increaseDissolveDelay(params: ApiIncreaseDissolveDelayParams) {
    return increaseDissolveDelay(params);
  },
  joinCommunityFund(params: ApiCallNeuronParams) {
    return joinCommunityFund(params);
  },
  leaveCommunityFund(params: ApiCallNeuronParams) {
    return leaveCommunityFund(params);
  },
  // @deprecated
  mergeMaturity(params: ApiMergeMaturityParams) {
    return mergeMaturity(params);
  },
  mergeNeurons(params: ApiMergeNeuronsParams) {
    return mergeNeurons(params);
  },
  removeHotkey(params: ApiHotkeyCallParams) {
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
  startDissolving(params: ApiCallNeuronParams) {
    return startDissolving(params);
  },
  stopDissolving(params: ApiCallNeuronParams) {
    return stopDissolving(params);
  },
};
