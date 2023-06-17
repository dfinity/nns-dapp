import type { RewardEvent } from "@dfinity/nns";

export const mockRewardEvent: RewardEvent = {
  rounds_since_last_distribution: [BigInt(1_000)],
  day_after_genesis: BigInt(365),
  actual_timestamp_seconds: BigInt(12234455555),
  total_available_e8s_equivalent: BigInt(20_000_000_000),
  distributed_e8s_equivalent: BigInt(2_000_000_000),
  settled_proposals: [],
  latest_round_available_e8s_equivalent: [BigInt(1_000_000_000)],
};
