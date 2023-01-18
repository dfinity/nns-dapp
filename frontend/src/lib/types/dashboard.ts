export interface StakingMetricDataSample {
  labels: unknown;
  timestamp: number;
  value: number;
}

export interface StakingMetricData {
  created_at: string;
  data_type: "Untyped";
  name:
    | "governance_dissolving_neurons_e8s_count"
    | "governance_not_dissolving_neurons_e8s_count";
  samples: StakingMetricDataSample[];
  timestamp_seconds: number;
}

export interface StakingMetrics {
  data: StakingMetricData[];
}
