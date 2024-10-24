import type { TableNeuron } from "$lib/types/neurons-table";
import type { ResponsiveTableOrder } from "$lib/types/responsive-table";
import {
  createTableNeuronsToSortStore,
  sortNeuronIds,
} from "$lib/utils/neurons-table-order-sorted-neuronids-store.utils";
import { mockTableNeuron } from "$tests/mocks/neurons.mock";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { get, writable } from "svelte/store";

describe("neurons-table-order-sorted-neuronids-store.utils", () => {
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

  describe("sortNeuronIds", () => {
    it("should sort neurons by stake in descending order", () => {
      const order: ResponsiveTableOrder = [{ columnId: "stake" }];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["1", "3", "2", "4"]);
    });

    it("should sort neurons by stake in ascending order when reversed", () => {
      const order: ResponsiveTableOrder = [
        { columnId: "stake", reversed: true },
      ];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "2", "3", "1"]);
    });

    it("should sort neurons by dissolve delay in descending order", () => {
      const order: ResponsiveTableOrder = [{ columnId: "dissolveDelay" }];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "1", "2", "3"]);
    });

    it("should sort neurons by state", () => {
      const order: ResponsiveTableOrder = [{ columnId: "state" }];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["1", "4", "2", "3"]);
    });

    it("should use multiple sort criteria", () => {
      const order: ResponsiveTableOrder = [
        { columnId: "dissolveDelay" },
        { columnId: "stake" },
      ];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["4", "1", "3", "2"]);
    });

    it("should return neuron IDs in original order if no valid sort criteria", () => {
      const order: ResponsiveTableOrder = [{ columnId: "invalidColumn" }];
      const result = sortNeuronIds(order, testNeurons);
      expect(result).toEqual(["1", "2", "3", "4"]);
    });
  });

  describe("createTableNeuronsToSortStore", () => {
    it("should create a derived store that sorts neurons by ID", () => {
      const mockStore = writable(testNeurons);
      const sortedStore = createTableNeuronsToSortStore(
        [mockStore],
        ($neurons) => $neurons
      );

      expect(get(sortedStore).map((n) => n.neuronId)).toEqual([
        "1",
        "2",
        "3",
        "4",
      ]);

      mockStore.set([
        testNeurons[2],
        testNeurons[0],
        testNeurons[3],
        testNeurons[1],
      ]);

      expect(get(mockStore).map((n) => n.neuronId)).toEqual([
        "3",
        "1",
        "4",
        "2",
      ]);

      expect(get(sortedStore).map((n) => n.neuronId)).toEqual([
        "1",
        "2",
        "3",
        "4",
      ]);
    });
  });
});
