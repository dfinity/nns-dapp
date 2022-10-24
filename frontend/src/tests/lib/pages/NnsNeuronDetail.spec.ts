/**
 * @jest-environment jsdom
 */

import { CONTEXT_PATH } from "$lib/constants/routes.constants";
import NeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import en from "../../mocks/i18n.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockVoteRegistration } from "../../mocks/proposal.mock";

jest.mock("$lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/neurons.services", () => {
  return {
    ...(jest.requireActual("$lib/services/neurons.services") as object),
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

  afterEach(() => {
    neuronsStore.reset();
    voteRegistrationStore.reset();
  });

  const props = {
    neuronIdText: `${neuronId}`
  }

  it("should display skeletons", () => {
    const { container } = render(NeuronDetail, props);

    expect(querySkeleton(container)).not.toBeNull();
  });

  it("should render a title with neuron ID", () => {
    render(NeuronDetail, props);

    const title = get(layoutTitleStore);

    expect(title).toEqual(`${en.core.icp} – ${neuronId}`);
  });

  it("should hide skeletons after neuron data are available", async () => {
    const { container } = render(NeuronDetail, props);

    fillNeuronStore();

    await waitFor(() => expect(querySkeleton(container)).toBeNull());
  });

  it("should show skeletons when neuron is in voting process", async () => {
    const { container } = render(NeuronDetail, props);

    fillNeuronStore();

    waitFor(() => expect(querySkeleton(container)).toBeNull());

    voteRegistrationStore.add({
      ...mockVoteRegistration,
      neuronIds: [neuronId],
    });

    await waitFor(() => expect(querySkeleton(container)).not.toBeNull());
  });
});
