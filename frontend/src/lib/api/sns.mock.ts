import type { SnsNeuron } from "@dfinity/sns";

const createMockSnsNeuron = ({
  stake,
  id,
}: {
  stake: bigint;
  id: number[];
}): SnsNeuron => ({
  id: [{ id }],
  permissions: [],
  maturity_e8s_equivalent: BigInt(0),
  cached_neuron_stake_e8s: stake,
  created_timestamp_seconds: BigInt(
    Math.floor(Date.now() / 1000 - 3600 * 24 * 6)
  ),
  aging_since_timestamp_seconds: BigInt(100),
  dissolve_state: [],
  followees: [],
  neuron_fees_e8s: BigInt(0),
});

export const mockSnsNeurons: SnsNeuron[] = [
  { stake: BigInt(1_000_000_000), id: [1, 5, 3, 9, 9, 3, 2] },
  { stake: BigInt(3_400_000_000), id: [1, 5, 3, 7, 8, 2, 2] },
  { stake: BigInt(18_000_000_000), id: [1, 5, 3, 0, 7, 3, 2, 9] },
].map(createMockSnsNeuron);
