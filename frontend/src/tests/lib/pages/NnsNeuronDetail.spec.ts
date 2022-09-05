/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { CONTEXT_PATH } from "../../../lib/constants/routes.constants";
import NeuronDetail from "../../../lib/pages/NnsNeuronDetail.svelte";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { routeStore } from "../../../lib/stores/route.store";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockRouteStoreSubscribe } from "../../mocks/route.store.mock";

jest.mock("../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../lib/services/neurons.services", () => {
  return {
    ...(jest.requireActual("../../../lib/services/neurons.services") as object),
    loadNeuron: jest.fn(),
  };
});

describe("NeuronDetail", () => {
  const neuronId = BigInt(666);
  const fillNeuronStore = () =>
    neuronsStore.setNeurons({
      neurons: [{ ...mockNeuron, neuronId }],
      certified: true,
    });
  const querySkeleton = (container: HTMLElement): HTMLElement | null =>
    container.querySelector('[data-tid="skeleton-card"]');

  jest
    .spyOn(routeStore, "subscribe")
    .mockImplementation(
      mockRouteStoreSubscribe(`${CONTEXT_PATH}/aaaaa-aa/neuron/${neuronId}`)
    );

  afterEach(() => {
    neuronsStore.reset();
    voteRegistrationStore.reset();

    jest.clearAllMocks();
  });

  it("should display skeletons", () => {
    const { container } = render(NeuronDetail);

    expect(querySkeleton(container)).not.toBeNull();
  });

  it.only("should hide skeletons after neuron data are available", async () => {
    const { container } = render(NeuronDetail);

    fillNeuronStore();

    await waitFor(() => expect(querySkeleton(container)).toBeNull());
  });

  it("should show skeletons when neuron is in voting process", async () => {
    const { container } = render(NeuronDetail);

    fillNeuronStore();

    waitFor(() => expect(querySkeleton(container)).toBeNull());

    voteRegistrationStore.add({
      ...mockVoteRegistration,
      neuronIds: [neuronId],
    });

    await waitFor(() => expect(querySkeleton(container)).not.toBeNull());
  });
});
