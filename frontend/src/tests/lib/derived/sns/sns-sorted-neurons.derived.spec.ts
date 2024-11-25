import {
  definedSnsNeuronStore,
  snsSortedNeuronStore,
  sortedSnsCFNeuronsStore,
  sortedSnsUserNeuronsStore,
} from "$lib/derived/sns/sns-sorted-neurons.derived";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("definedSnsNeuronStore", () => {
  const principal2 = Principal.fromText("aaaaa-aa");

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        lifecycle: SnsSwapLifecycle.Committed,
      },
      {
        rootCanisterId: principal2,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
  });

  it("returns an empty array if no neurons", () => {
    expect(get(definedSnsNeuronStore).length).toBe(0);
  });

  it("should filter out neurons with no stake nor maturity", async () => {
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 0n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        maturity_e8s_equivalent: 0n,
        staked_maturity_e8s_equivalent: [0n],
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: 3n,
      },
      {
        ...createMockSnsNeuron({
          stake: 10_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(definedSnsNeuronStore)).toEqual([neurons[1], neurons[2]])
    );
  });

  it("should return the defined neurons of the selected project", async () => {
    const neurons1: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 3_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons: neurons1,
      certified: true,
    });
    const neurons2: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 3_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: principal2,
      neurons: neurons2,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(definedSnsNeuronStore)).toEqual([
        neurons1[0],
        neurons1[1],
        neurons1[2],
      ])
    );

    page.mock({ data: { universe: principal2.toText() } });

    await waitFor(() =>
      expect(get(definedSnsNeuronStore)).toEqual([
        neurons2[0],
        neurons2[1],
        neurons2[2],
      ])
    );
  });
});

describe("sortedSnsNeuronStore", () => {
  const principal2 = Principal.fromText("aaaaa-aa");

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        lifecycle: SnsSwapLifecycle.Committed,
      },
      {
        rootCanisterId: principal2,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
  });

  it("returns an empty array if no neurons", () => {
    expect(get(snsSortedNeuronStore).length).toBe(0);
  });

  it("should sort neurons by stake", async () => {
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 3_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(snsSortedNeuronStore)).toEqual([
        neurons[1],
        neurons[2],
        neurons[0],
      ])
    );
  });

  it("should filter out neurons with no stake nor maturity", async () => {
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 0n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        maturity_e8s_equivalent: 0n,
        staked_maturity_e8s_equivalent: [0n],
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: 3n,
      },
      {
        ...createMockSnsNeuron({
          stake: 10_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(snsSortedNeuronStore)).toEqual([neurons[2], neurons[1]])
    );
  });

  it("should return the sorted neurons of the selected project", async () => {
    const neurons1: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 3_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons: neurons1,
      certified: true,
    });
    const neurons2: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 3_000_000_000n,
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: principal2,
      neurons: neurons2,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(snsSortedNeuronStore)).toEqual([
        neurons1[1],
        neurons1[2],
        neurons1[0],
      ])
    );

    page.mock({ data: { universe: principal2.toText() } });

    await waitFor(() =>
      expect(get(snsSortedNeuronStore)).toEqual([
        neurons2[2],
        neurons2[0],
        neurons2[1],
      ])
    );
  });
});

describe("sortedSnsUserNeuronsStore", () => {
  it("should not return CF neurons", async () => {
    const cfNeuron: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: 10_000_000_000n,
        id: [1, 2, 2, 9, 9, 3, 2],
      }),
      source_nns_neuron_id: [2n],
    };
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
      },
      {
        ...createMockSnsNeuron({
          stake: 2_000_000_000n,
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      },
      cfNeuron,
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(sortedSnsUserNeuronsStore)).toEqual([neurons[1], neurons[0]])
    );
  });
});

describe("sortedSnsCFNeuronsStore", () => {
  it("should not return CF neurons", async () => {
    const cfNeuron1: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: 10_000_000_000n,
        id: [1, 2, 2, 9, 9, 3, 2],
      }),
      source_nns_neuron_id: [2n],
      created_timestamp_seconds: 3n,
    };
    const cfNeuron2: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: 2_000_000_000n,
        id: [1, 5, 3, 9, 9, 3, 2],
      }),
      source_nns_neuron_id: [3n],
      created_timestamp_seconds: 2n,
    };
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: 1_000_000_000n,
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: 1n,
      },
      cfNeuron2,
      cfNeuron1,
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(sortedSnsCFNeuronsStore)).toEqual([cfNeuron1, cfNeuron2])
    );
  });
});
