/**
 * @jest-environment jsdom
 */

import { dispatchIntersecting } from "$lib/directives/intersection.directives";
import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
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
    neuronIdText: `${neuronId}`,
  };

  it("should display skeletons", () => {
    const { container } = render(NnsNeuronDetail, props);

    expect(querySkeleton(container)).not.toBeNull();
  });

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = render(NnsNeuronDetail, props);

    fillNeuronStore();

    await waitFor(() => expect(getByTestId("neuron-id")).not.toBeNull());

    const element = getByTestId("neuron-id-title") as HTMLElement;
    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() => expect(title).toEqual(text));
  };

  it("should render a title with neuron ID if title is not intersecting viewport", async () =>
    await testTitle({
      intersecting: false,
      text: `${en.core.icp} – ${neuronId}`,
    }));

  it("should render a static title if title is intersecting viewport", async () =>
    await testTitle({ intersecting: true, text: en.neuron_detail.title }));

  it("should hide skeletons after neuron data are available", async () => {
    const { container } = render(NnsNeuronDetail, props);

    fillNeuronStore();

    await waitFor(() => expect(querySkeleton(container)).toBeNull());
  });

  it("should show skeletons when neuron is in voting process", async () => {
    const { container } = render(NnsNeuronDetail, props);

    fillNeuronStore();

    await waitFor(() => expect(querySkeleton(container)).toBeNull());

    voteRegistrationStore.add({
      ...mockVoteRegistration,
      neuronIds: [neuronId],
    });

    await waitFor(() => expect(querySkeleton(container)).not.toBeNull());
  });
});
