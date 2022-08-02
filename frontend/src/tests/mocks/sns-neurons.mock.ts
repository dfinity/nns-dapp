import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import type { Subscriber } from "svelte/store";

export const createMockSnsNeuron = ({
  stake = BigInt(1_000_000_000),
  id,
  state,
}: {
  stake?: bigint;
  id: number[];
  state?: NeuronState;
}): SnsNeuron => ({
  id: [{ id }],
  permissions: [],
  maturity_e8s_equivalent: BigInt(0),
  cached_neuron_stake_e8s: stake,
  created_timestamp_seconds: BigInt(
    Math.floor(Date.now() / 1000 - 3600 * 24 * 6)
  ),
  aging_since_timestamp_seconds: BigInt(100),
  dissolve_state:
    state === undefined
      ? []
      : [
          state === NeuronState.DISSOLVING
            ? {
                WhenDissolvedTimestampSeconds: BigInt(
                  Math.floor(Date.now() / 1000 + 3600 * 24 * 365 * 2)
                ),
              }
            : {
                DissolveDelaySeconds: BigInt(
                  Math.floor(Date.now() / 1000 + 3600 * 24 * 365 * 2)
                ),
              },
        ],
  followees: [],
  neuron_fees_e8s: BigInt(0),
});

export const mockSnsNeuron = createMockSnsNeuron({
  stake: BigInt(1_000_000_000),
  id: [1, 5, 3, 9, 9, 3, 2],
});

export const buildMockSortedSnsNeuronsStoreSubscribe =
  (neurons: SnsNeuron[] = []) =>
  (run: Subscriber<SnsNeuron[]>): (() => void) => {
    run(neurons);
    return () => undefined;
  };
