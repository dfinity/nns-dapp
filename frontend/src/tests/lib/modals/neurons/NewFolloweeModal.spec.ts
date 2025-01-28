import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
import { addFollowee, removeFollowee } from "$lib/services/neurons.services";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockFullNeuron,
  mockKnownNeuron,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    addFollowee: vi.fn().mockResolvedValue(undefined),
    removeFollowee: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn(),
  };
});

describe("NewFolloweeModal", () => {
  const followingNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      followees: [
        {
          topic: Topic.Unspecified,
          followees: [mockKnownNeuron.id],
        },
      ],
    },
  };
  beforeEach(() => {
    resetIdentity();
    knownNeuronsStore.setNeurons([]);
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
    const onClose = vi.fn();

    const { container } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
      events: {
        nnsClose: onClose,
      },
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
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("renders known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const { queryAllByTestId } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
    });

    const knownNeuronElements = queryAllByTestId("known-neuron-item");

    expect(knownNeuronElements.length).toBe(1);
  });

  it("renders known neurons to unfollow", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const { queryByTestId } = render(NewFolloweeModal, {
      props: { neuron: followingNeuron, topic: Topic.Unspecified },
    });

    const knownNeuronElement = queryByTestId(
      `known-neuron-item-${mockKnownNeuron.id}`
    );

    expect(knownNeuronElement).toBeInTheDocument();

    const knownNeuronButton = knownNeuronElement?.querySelector("button");
    expect(knownNeuronButton).toBeInTheDocument();
    knownNeuronButton &&
      expect(knownNeuronButton.innerHTML).toEqual(en.new_followee.unfollow);
  });

  it("follow known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);

    const onClose = vi.fn();

    const { queryAllByTestId } = render(NewFolloweeModal, {
      props: { neuron: mockNeuron, topic: Topic.Unspecified },
      events: {
        nnsClose: onClose,
      },
    });

    const knownNeuronElements = queryAllByTestId("known-neuron-item");

    expect(knownNeuronElements.length).toBe(1);
    const knownNeuronElement: HTMLElement = knownNeuronElements[0];

    const followButton = knownNeuronElement.querySelector("button");

    expect(followButton).toBeInTheDocument();

    followButton && (await fireEvent.click(followButton));

    expect(addFollowee).toBeCalled();
    expect(removeFollowee).not.toBeCalled();
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("unfollow known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);

    const onClose = vi.fn();

    const { queryByTestId } = render(NewFolloweeModal, {
      props: { neuron: followingNeuron, topic: Topic.Unspecified },
      events: {
        nnsClose: onClose,
      },
    });

    const knownNeuronElement = queryByTestId(
      `known-neuron-item-${mockKnownNeuron.id}`
    );

    expect(knownNeuronElement).toBeInTheDocument();

    const knownNeuronButton = knownNeuronElement?.querySelector("button");
    expect(knownNeuronButton).toBeInTheDocument();

    knownNeuronButton && (await fireEvent.click(knownNeuronButton));

    expect(removeFollowee).toBeCalled();
    expect(addFollowee).not.toBeCalled();
    await waitFor(() => expect(onClose).toBeCalled());
  });
});
