import type { GovernanceCachedMetrics } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export interface GovernanceMetricsStoreData {
  metrics: GovernanceCachedMetrics | undefined;
  certified: boolean | undefined;
}

export interface GovernanceMetricsStore
  extends Readable<GovernanceMetricsStoreData> {
  setMetrics: (data: GovernanceMetricsStoreData) => void;
}

/**
 * A store that contains the [governance metrics](https://github.com/dfinity/ic/blob/fc85690fc9318eef49be54c5401994b74e92e2cb/rs/nns/governance/api/src/types.rs#L2756).
 */
const initGovernanceMetricsStore = () => {
  const initialStoreData: GovernanceMetricsStoreData = {
    metrics: undefined,
    certified: undefined,
  };
  const { subscribe, set } =
    writable<GovernanceMetricsStoreData>(initialStoreData);

  return {
    subscribe,

    setMetrics(metrics: GovernanceMetricsStoreData) {
      set(metrics);
    },

    reset() {
      set(initialStoreData);
    },
  };
};

export const governanceMetricsStore = initGovernanceMetricsStore();
