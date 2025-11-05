import { KNOWN_NEURONS_ORDER_DASHBOARD } from "$lib/constants/neurons.constants";
import {
  knownNeuronsStore,
  sortedknownNeuronsStore,
} from "$lib/stores/known-neurons.store";
import {
  createMockKnownNeuron,
  mockKnownNeuron,
} from "$tests/mocks/neurons.mock";
import { get } from "svelte/store";

describe("knownNeurons", () => {
  const mockKnownNeurons = [mockKnownNeuron];
  it("should set known neurons", () => {
    knownNeuronsStore.setNeurons(mockKnownNeurons);

    const neurons = get(knownNeuronsStore);
    expect(neurons).toEqual(mockKnownNeurons);
  });

  it("should reset known neurons", () => {
    knownNeuronsStore.setNeurons(mockKnownNeurons);
    knownNeuronsStore.setNeurons([]);

    const neurons = get(knownNeuronsStore);
    expect(neurons).toEqual([]);
  });

  it("should sort pinned known neurons first in dashboard order, then others alphabetically", () => {
    knownNeuronsStore.reset();

    // Known neurons with ids in KNOWN_NEURONS_ORDER_DASHBOARD are pinned
    const pinnedFirst = { ...createMockKnownNeuron(27n), name: "Zeta" };
    const pinnedSecond = {
      ...createMockKnownNeuron(12911334408382674412n),
      name: "Gamma",
    };

    // Non-pinned known neurons
    const nonPinnedAlpha = { ...createMockKnownNeuron(999n), name: "Alpha" };
    const nonPinnedBeta = { ...createMockKnownNeuron(1000n), name: "Beta" };

    knownNeuronsStore.setNeurons([
      nonPinnedBeta,
      pinnedSecond,
      nonPinnedAlpha,
      pinnedFirst,
    ]);

    const sorted = get(sortedknownNeuronsStore);
    expect(sorted.map((n) => n.id)).toEqual([
      27n,
      12911334408382674412n,
      999n,
      1000n,
    ]);
  });

  it("should sort non-pinned known neurons alphabetically by name", () => {
    knownNeuronsStore.reset();

    const a = { ...createMockKnownNeuron(3n), name: "Charlie" };
    const b = { ...createMockKnownNeuron(2n), name: "alpha" };
    const c = { ...createMockKnownNeuron(1n), name: "Bravo" };

    knownNeuronsStore.setNeurons([a, b, c]);

    const sorted = get(sortedknownNeuronsStore);
    expect(sorted.map((n) => n.name)).toEqual(["alpha", "Bravo", "Charlie"]);
  });

  it("should filter out pinned ids not present in the store", () => {
    knownNeuronsStore.reset();

    const presentPinnedIdStr = KNOWN_NEURONS_ORDER_DASHBOARD[0];
    const missingPinnedIdStr = KNOWN_NEURONS_ORDER_DASHBOARD[1];

    const presentPinnedNeuron = {
      ...createMockKnownNeuron(BigInt(presentPinnedIdStr)),
    };

    knownNeuronsStore.setNeurons([presentPinnedNeuron]);
    const sorted = get(sortedknownNeuronsStore);
    const sortedIds = sorted.map((n) => n.id);

    expect(sortedIds).toEqual([BigInt(presentPinnedIdStr)]);
    expect(sortedIds.includes(BigInt(missingPinnedIdStr))).toBe(false);
  });
});
