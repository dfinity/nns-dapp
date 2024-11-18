import { neuronsTableOrderSortedNeuronIdsStore } from "$lib/stores/neurons-table-order-sorted-neuron-ids-store";
import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import { get } from "svelte/store";

describe("neuronsTableOrderSortedNeuronIdsStore", () => {
  const createTestNeuron = ({
    id,
    stake,
    dissolveDelaySeconds,
    state,
  }: {
    id: bigint;
    stake: bigint;
    dissolveDelaySeconds: bigint;
    state: NeuronState;
  }): NeuronInfo => {
    return {
      ...mockNeuron,
      neuronId: id,
      dissolveDelaySeconds,
      state,
      fullNeuron: {
        ...mockFullNeuron,
        id,
        cachedNeuronStake: stake,
      },
    };
  };

  const testNeurons: NeuronInfo[] = [
    createTestNeuron({
      id: 1n,
      stake: 400_000_000n,
      dissolveDelaySeconds: 3000n,
      state: NeuronState.Locked,
    }),
    createTestNeuron({
      id: 2n,
      stake: 200_000_000n,
      dissolveDelaySeconds: 2000n,
      state: NeuronState.Dissolving,
    }),
    createTestNeuron({
      id: 3n,
      stake: 300_000_000n,
      dissolveDelaySeconds: 2000n,
      state: NeuronState.Dissolving,
    }),
    createTestNeuron({
      id: 4n,
      stake: 100_000_000n,
      dissolveDelaySeconds: 4000n,
      state: NeuronState.Locked,
    }),
  ];

  beforeEach(() => {
    neuronsTableOrderStore.reset();
    resetIdentity();
    setAccountsForTesting({ main: mockMainAccount });
  });

  it("should sort neurons by stake in descending order", () => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    neuronsTableOrderStore.set([{ columnId: "stake" }]);

    const sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["1", "3", "2", "4"]);
  });

  it("should sort neurons by dissolve delay in descending order", () => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    neuronsTableOrderStore.set([{ columnId: "dissolveDelay" }]);

    const sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["4", "1", "2", "3"]);
  });

  it("should sort neurons by state", () => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    neuronsTableOrderStore.set([{ columnId: "state" }]);

    const sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["1", "4", "2", "3"]);
  });

  it("should use multiple sort criteria", () => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    neuronsTableOrderStore.set([
      { columnId: "dissolveDelay" },
      { columnId: "stake" },
    ]);

    const sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["4", "1", "3", "2"]);
  });

  it("should update when neurons are added or removed", () => {
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
    neuronsTableOrderStore.set([{ columnId: "stake" }]);

    let sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["1", "3", "2", "4"]);

    const newNeuron = createTestNeuron({
      id: 5n,
      stake: 500_000_000n,
      dissolveDelaySeconds: 4000n,
      state: NeuronState.Locked,
    });

    neuronsStore.pushNeurons({
      neurons: [...testNeurons, newNeuron],
      certified: true,
    });

    expect(get(neuronsStore).neurons.map((n) => n.neuronId.toString())).toEqual(
      ["1", "2", "3", "4", "5"]
    );

    sortedNeuronIds = get(neuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["5", "1", "3", "2", "4"]);
  });
});
