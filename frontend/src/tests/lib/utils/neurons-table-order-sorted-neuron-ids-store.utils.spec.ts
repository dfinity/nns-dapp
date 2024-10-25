import type { NeuronsTableOrder, TableNeuron } from "$lib/types/neurons-table";

import { getSortedNeuronIds } from "$lib/utils/neurons-table-order-sorted-neuron-ids-store.utils";
import { mockTableNeuron } from "$tests/mocks/neurons.mock";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("neurons-table-order-sorted-neuron-ids-store.utils", () => {
  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  const createTestNeuron = ({
    id,
    stake,
    dissolveDelaySeconds,
    state,
  }: {
    id: string;
    stake: bigint;
    dissolveDelaySeconds: bigint;
    state: NeuronState;
  }): TableNeuron => ({
    ...mockTableNeuron,
    neuronId: id,
    stake: makeStake(stake),
    dissolveDelaySeconds,
    state,
  });

  const testNeurons: TableNeuron[] = [
    createTestNeuron({
      id: "1",
      stake: 400_000_000n,
      dissolveDelaySeconds: 3000n,
      state: NeuronState.Locked,
    }),
    createTestNeuron({
      id: "2",
      stake: 200_000_000n,
      dissolveDelaySeconds: 2000n,
      state: NeuronState.Dissolving,
    }),
    createTestNeuron({
      id: "3",
      stake: 300_000_000n,
      dissolveDelaySeconds: 2000n,
      state: NeuronState.Dissolving,
    }),
    createTestNeuron({
      id: "4",
      stake: 100_000_000n,
      dissolveDelaySeconds: 4000n,
      state: NeuronState.Locked,
    }),
  ];

  describe("getSortedNeuronIds", () => {
    it("should sort neurons by stake in descending order", () => {
      const order: NeuronsTableOrder = [{ columnId: "stake" }];
      const result = getSortedNeuronIds(order, testNeurons);
      expect(result).toEqual(["1", "3", "2", "4"]);
    });

    it("should sort neurons by stake in ascending order when reversed", () => {
      const order: NeuronsTableOrder = [{ columnId: "stake", reversed: true }];
      const result = getSortedNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "2", "3", "1"]);
    });

    it("should sort neurons by dissolve delay in descending order", () => {
      const order: NeuronsTableOrder = [{ columnId: "dissolveDelay" }];
      const result = getSortedNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "1", "2", "3"]);
    });

    it("should sort neurons by state", () => {
      const order: NeuronsTableOrder = [{ columnId: "state" }];
      const result = getSortedNeuronIds(order, testNeurons);
      expect(result).toEqual(["1", "4", "2", "3"]);
    });

    it("should use multiple sort criteria", () => {
      const order: NeuronsTableOrder = [
        { columnId: "dissolveDelay" },
        { columnId: "stake" },
      ];
      const result = getSortedNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "1", "3", "2"]);
    });
  });
});
