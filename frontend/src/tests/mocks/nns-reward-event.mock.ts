import type { RewardEvent } from "@dfinity/nns";

export const mockRewardEvent: RewardEvent = {
  rounds_since_last_distribution: [1_000n],
  day_after_genesis: 365n,
  actual_timestamp_seconds: 12_234_455_555n,
  total_available_e8s_equivalent: 20_000_000_000n,
  distributed_e8s_equivalent: 2_000_000_000n,
  settled_proposals: [],
  latest_round_available_e8s_equivalent: [1_000_000_000n],
};
