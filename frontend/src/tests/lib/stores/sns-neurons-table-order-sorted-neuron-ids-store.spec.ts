import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
import { snsNeuronsTableOrderSortedNeuronIdsStore } from "$lib/stores/sns-neurons-table-order-sorted-neuron-ids-store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("snsNeuronsTableOrderSortedNeuronIdsStore", () => {
  const testSnsNeurons: SnsNeuron[] = [
    createMockSnsNeuron({
      id: [1],
      stake: 400_000_000n,
      dissolveDelaySeconds: 3000n,
    }),
    createMockSnsNeuron({
      id: [2],
      stake: 200_000_000n,
      dissolveDelaySeconds: 2000n,
    }),
    createMockSnsNeuron({
      id: [3],
      stake: 300_000_000n,
      dissolveDelaySeconds: 2000n,
    }),
    createMockSnsNeuron({
      id: [4],
      stake: 100_000_000n,
      dissolveDelaySeconds: 4000n,
    }),
  ];

  const mockRootCanisterId = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

  beforeEach(() => {
    resetSnsProjects();
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockRootCanisterId,
      neurons: testSnsNeurons,
      certified: true,
    });
    setSnsProjects([
      {
        rootCanisterId: mockRootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    page.mock({ data: { universe: mockRootCanisterId.toText() } });
  });

  it("should sort neurons by stake in descending order", () => {
    neuronsTableOrderStore.set([{ columnId: "stake" }]);

    const sortedNeuronIds = get(snsNeuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["01", "03", "02", "04"]);
  });

  it("should sort neurons by dissolve delay in descending order", () => {
    neuronsTableOrderStore.set([{ columnId: "dissolveDelay" }]);

    const sortedNeuronIds = get(snsNeuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["04", "01", "02", "03"]);
  });

  it("should use multiple sort criteria", () => {
    neuronsTableOrderStore.set([
      { columnId: "dissolveDelay" },
      { columnId: "stake" },
    ]);

    const sortedNeuronIds = get(snsNeuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["04", "01", "03", "02"]);
  });

  it("should update when neurons are added or removed", () => {
    neuronsTableOrderStore.set([{ columnId: "stake" }]);

    let sortedNeuronIds = get(snsNeuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["01", "03", "02", "04"]);

    const newNeuron = createMockSnsNeuron({
      id: [5],
      stake: 500_000_000n,
      dissolveDelaySeconds: 4000n,
    });

    snsNeuronsStore.addNeurons({
      rootCanisterId: mockRootCanisterId,
      neurons: [newNeuron],
      certified: true,
    });

    expect(
      get(snsNeuronsStore)[mockRootCanisterId.toText()].neurons.map((n) =>
        getSnsNeuronIdAsHexString(n)
      )
    ).toEqual(["05", "01", "02", "03", "04"]);

    sortedNeuronIds = get(snsNeuronsTableOrderSortedNeuronIdsStore);
    expect(sortedNeuronIds).toEqual(["05", "01", "03", "02", "04"]);
  });
});
