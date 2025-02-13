import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
import { addFollowee, removeFollowee } from "$lib/services/neurons.services";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockFullNeuron,
  mockKnownNeuron,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { NewFolloweeModalPo } from "$tests/page-objects/NewFolloweeModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic, type NeuronInfo } from "@dfinity/nns";

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
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  const followingNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...neuron.fullNeuron,
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

  const renderComponent = ({
    neuron,
    topic,
    onClose,
  }: {
    neuron: NeuronInfo;
    topic: Topic;
    onClose?: () => void;
  }) => {
    const { container } = render(NewFolloweeModal, {
      props: {
        neuron,
        topic,
      },
      events: {
        nnsClose: onClose,
      },
    });

    return NewFolloweeModalPo.under(new JestPageObjectElement(container));
  };

  it("renders an input for a neuron address", async () => {
    const po = renderComponent({ neuron, topic: Topic.Unspecified });

    expect(await po.getTextInputPo().isPresent()).toBe(true);
  });

  it("adds a followee from a valid address", async () => {
    const onClose = vi.fn();
    const po = renderComponent({ neuron, topic: Topic.Unspecified, onClose });

    expect(addFollowee).toBeCalledTimes(0);
    expect(onClose).toBeCalledTimes(0);

    await po.followNeuronId("123");

    expect(addFollowee).toBeCalledWith({
      followee: 123n,
      neuronId: neuron.neuronId,
      topic: Topic.Unspecified,
    });

    expect(addFollowee).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(1);
  });

  it("renders known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const po = renderComponent({ neuron, topic: Topic.Unspecified });

    const knownNeurons = await po.getKnownNeuronItemPos();
    expect(knownNeurons.length).toBe(1);
  });

  it("renders known neurons to unfollow", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const po = renderComponent({
      neuron: followingNeuron,
      topic: Topic.Unspecified,
    });

    const knownNeurons = await po.getKnownNeuronItemPos();
    expect(knownNeurons.length).toBe(1);

    expect(await knownNeurons[0].getButton().getText()).toBe("Unfollow");
  });

  it("follow known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const onClose = vi.fn();
    const po = renderComponent({ neuron, topic: Topic.Unspecified, onClose });

    const knownNeurons = await po.getKnownNeuronItemPos();
    expect(knownNeurons.length).toBe(1);

    expect(addFollowee).toBeCalledTimes(0);
    expect(removeFollowee).toBeCalledTimes(0);
    expect(onClose).toBeCalledTimes(0);

    const knownNeuron = knownNeurons[0];
    await knownNeuron.getButton().click();

    expect(addFollowee).toBeCalledWith({
      followee: mockKnownNeuron.id,
      neuronId: neuron.neuronId,
      topic: Topic.Unspecified,
    });
    expect(addFollowee).toBeCalledTimes(1);
    expect(removeFollowee).not.toBeCalled();
    expect(onClose).toBeCalledTimes(1);
  });

  it("unfollow known neurons", async () => {
    knownNeuronsStore.setNeurons([mockKnownNeuron]);
    const onClose = vi.fn();
    const po = renderComponent({
      neuron: followingNeuron,
      topic: Topic.Unspecified,
      onClose,
    });

    const knownNeurons = await po.getKnownNeuronItemPos();
    expect(knownNeurons.length).toBe(1);

    expect(addFollowee).toBeCalledTimes(0);
    expect(removeFollowee).toBeCalledTimes(0);
    expect(onClose).toBeCalledTimes(0);

    const knownNeuron = knownNeurons[0];
    await knownNeuron.getButton().click();

    expect(removeFollowee).toBeCalledWith({
      followee: mockKnownNeuron.id,
      neuronId: neuron.neuronId,
      topic: Topic.Unspecified,
    });
    expect(removeFollowee).toBeCalledTimes(1);
    expect(addFollowee).not.toBeCalled();
    expect(onClose).toBeCalledTimes(1);
  });
});
