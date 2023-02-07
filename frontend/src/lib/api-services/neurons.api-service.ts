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
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";

const cacheExpirationDurationMs = 5 * 60 * 1000;

const nowMs = () => new Date().getTime();

let cachedNeurons: NeuronInfo[] | null = null;

// When the neurons were last cached.
let cacheTimestampMs: number | null = null;

// The principal of the identity for which the neurons were cached.
let cachePrincipalText: string | null = null;

export const clearCache = () => {
  cachedNeurons = null;
  cacheTimestampMs = null;
  cachePrincipalText = null;
};

const hasValidCachedNeurons = (identity: Identity) => {
  if (
    cachedNeurons === null ||
    cacheTimestampMs === null ||
    cachePrincipalText === null
  ) {
    return false;
  }
  if (nowMs() - cacheTimestampMs > cacheExpirationDurationMs) {
    clearCache();
    return false;
  }
  return cachePrincipalText === identity.getPrincipal().toText();
};

const clearCacheAfter = async <R>(promise: Promise<R>) => {
  const result: R = await promise;
  clearCache();
  return result;
};

export const resetNeuronsApiService = () => {
  clearCache();
};

export const neuronsApiService = {
  // Read calls
  queryKnownNeurons(params: ApiQueryParams) {
    return queryKnownNeurons(params);
  },
  queryNeuron(params: ApiQueryNeuronParams) {
    return queryNeuron(params);
  },
  async queryNeurons(params: ApiQueryParams) {
    if (hasValidCachedNeurons(params.identity)) {
      return cachedNeurons;
    }
    const promise = queryNeurons(params);
    if (!params.certified) {
      return promise;
    }
    cachedNeurons = await promise;
    cacheTimestampMs = nowMs();
    cachePrincipalText = params.identity.getPrincipal().toText();
    return cachedNeurons;
  },

  // Action calls
  async addHotkey(params: ApiManageHotkeyParams) {
    return clearCacheAfter(addHotkey(params));
  },
  autoStakeMaturity(params: ApiAutoStakeMaturityParams) {
    return clearCacheAfter(autoStakeMaturity(params));
  },
  claimOrRefreshNeuron(params: ApiManageNeuronParams) {
    return clearCacheAfter(claimOrRefreshNeuron(params));
  },
  disburse(params: ApiDisburseParams) {
    return clearCacheAfter(disburse(params));
  },
  increaseDissolveDelay(params: ApiIncreaseDissolveDelayParams) {
    return clearCacheAfter(increaseDissolveDelay(params));
  },
  joinCommunityFund(params: ApiManageNeuronParams) {
    return clearCacheAfter(joinCommunityFund(params));
  },
  leaveCommunityFund(params: ApiManageNeuronParams) {
    return clearCacheAfter(leaveCommunityFund(params));
  },
  // @deprecated
  mergeMaturity(params: ApiMergeMaturityParams) {
    return clearCacheAfter(mergeMaturity(params));
  },
  mergeNeurons(params: ApiMergeNeuronsParams) {
    return clearCacheAfter(mergeNeurons(params));
  },
  removeHotkey(params: ApiManageHotkeyParams) {
    return clearCacheAfter(removeHotkey(params));
  },
  setFollowees(params: ApiSetFolloweesParams) {
    return clearCacheAfter(setFollowees(params));
  },
  spawnNeuron(params: ApiSpawnNeuronParams) {
    return clearCacheAfter(spawnNeuron(params));
  },
  splitNeuron(params: ApiSplitNeuronParams) {
    return clearCacheAfter(splitNeuron(params));
  },
  stakeMaturity(params: ApiStakeMaturityParams) {
    return clearCacheAfter(stakeMaturity(params));
  },
  stakeNeuron(params: ApiStakeNeuronParams) {
    return clearCacheAfter(stakeNeuron(params));
  },
  startDissolving(params: ApiManageNeuronParams) {
    return clearCacheAfter(startDissolving(params));
  },
  stopDissolving(params: ApiManageNeuronParams) {
    return clearCacheAfter(stopDissolving(params));
  },
};
