/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import NewFolloweeModal from "../../../lib/modals/neurons/NewFolloweeModal.svelte";
import { addFollowee } from "../../../lib/services/neurons.services";
import { authStore } from "../../../lib/stores/auth.store";
import { knownNeuronsStore } from "../../../lib/stores/knownNeurons.store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { mockKnownNeuron, mockNeuron } from "../../mocks/neurons.mock";

jest.mock("../../../lib/services/neurons.services", () => {
  return {
    addFollowee: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

describe("NewFolloweeModal", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  afterEach(() => {
    knownNeuronsStore.setNeurons([]);
    jest.clearAllMocks();
  });
  it("renders an input for a neuron address", () => {
    const { container } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
    });

    const inputElement = container.querySelector(
      '[name="new-followee-address"]'
    );

    expect(inputElement).toBeInTheDocument();
  });

  it("adds a followee from a valid address", async () => {
    const { container } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
    });

    const inputElement: HTMLInputElement | null = container.querySelector(
      'input[name="new-followee-address"]'
    );

    expect(inputElement).toBeInTheDocument();
    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 123 } }));

    const formElement = container.querySelector("form");
    expect(formElement).toBeInTheDocument();

    formElement && (await fireEvent.submit(formElement));

    expect(addFollowee).toBeCalled();
  });

  it("renders known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const { queryAllByTestId } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
    });

    const knownNeuronElements = queryAllByTestId("known-neuron-item");

    expect(knownNeuronElements.length).toBe(1);
  });

  it("follow known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const { queryAllByTestId } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
    });

    const knownNeuronElements = queryAllByTestId("known-neuron-item");

    expect(knownNeuronElements.length).toBe(1);
    const knownNeuronElement: HTMLElement = knownNeuronElements[0];

    const followButton = knownNeuronElement.querySelector("button");

    expect(followButton).toBeInTheDocument();

    followButton && (await fireEvent.click(followButton));

    expect(addFollowee).toBeCalled();
  });
});
