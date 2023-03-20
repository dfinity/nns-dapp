/**
 * @jest-environment jsdom
 */
import {
  snsSortedNeuronStore,
  sortedSnsCFNeuronsStore,
  sortedSnsUserNeuronsStore,
} from "$lib/derived/sns/sns-sorted-neurons.derived";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { snsResponsesFor } from "$tests/mocks/sns-response.mock";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sortedSnsNeuronStore", () => {
  const principal2 = Principal.fromText("aaaaa-aa");

  beforeEach(() => {
    snsNeuronsStore.reset();
    snsQueryStore.reset();

    snsQueryStore.setData(
      snsResponsesFor([
        { principal: mockPrincipal, lifecycle: SnsSwapLifecycle.Committed },
        { principal: principal2, lifecycle: SnsSwapLifecycle.Committed },
      ])
    );
  });

  it("returns an empty array if no neurons", () => {
    expect(get(snsSortedNeuronStore).length).toBe(0);
  });

  it("should sort neurons by createdTimestampSeconds", async () => {
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(1),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(3),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(10_000_000_000),
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(2),
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
          stake: BigInt(0),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(1),
        maturity_e8s_equivalent: BigInt(0),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(3),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(10_000_000_000),
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(2),
      },
    ];
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockPrincipal,
      neurons,
      certified: true,
    });

    page.mock({ data: { universe: mockPrincipal.toText() } });

    await waitFor(() =>
      expect(get(snsSortedNeuronStore)).toEqual([neurons[1], neurons[2]])
    );
  });

  it("should return the sorted neurons of the selected project", async () => {
    const neurons1: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(1),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(3),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(10_000_000_000),
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(2),
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
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(2),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(1),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(10_000_000_000),
          id: [1, 2, 2, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(3),
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
  afterEach(() => snsNeuronsStore.reset());
  it("should not return CF neurons", async () => {
    const cfNeuron: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: BigInt(10_000_000_000),
        id: [1, 2, 2, 9, 9, 3, 2],
      }),
      created_timestamp_seconds: BigInt(2),
      source_nns_neuron_id: [BigInt(2)],
    };
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(1),
      },
      {
        ...createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
        created_timestamp_seconds: BigInt(3),
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
  afterEach(() => snsNeuronsStore.reset());
  it("should not return CF neurons", async () => {
    const cfNeuron1: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: BigInt(10_000_000_000),
        id: [1, 2, 2, 9, 9, 3, 2],
      }),
      source_nns_neuron_id: [BigInt(2)],
      created_timestamp_seconds: BigInt(3),
    };
    const cfNeuron2: SnsNeuron = {
      ...createMockSnsNeuron({
        stake: BigInt(2_000_000_000),
        id: [1, 5, 3, 9, 9, 3, 2],
      }),
      source_nns_neuron_id: [BigInt(3)],
      created_timestamp_seconds: BigInt(2),
    };
    const neurons: SnsNeuron[] = [
      {
        ...createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        created_timestamp_seconds: BigInt(1),
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
