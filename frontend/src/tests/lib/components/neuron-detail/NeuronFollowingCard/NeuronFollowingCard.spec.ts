import NeuronFollowingCard from "$lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
import { listKnownNeurons } from "$lib/services/known-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { Topic, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn().mockResolvedValue(undefined),
  };
});

describe("NeuronFollowingCard", () => {
  const followees = [111, 222, 333].map(BigInt);
  const neuron: NeuronInfo = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: followees,
        },
      ],
    },
  };
  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should render texts", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronFollowingCard,
      },
    });

    expect(getByText(en.neuron_detail.following_title)).toBeInTheDocument();
    expect(
      getByText(en.neuron_detail.following_description)
    ).toBeInTheDocument();
  });

  it("should render edit button", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronFollowingCard,
      },
    });

    expect(getByText(en.neuron_detail.follow_neurons)).toBeInTheDocument();
  });

  it("should render followees", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronFollowingCard,
      },
    });

    followees.forEach((id) =>
      expect(getByText(id.toString())).toBeInTheDocument()
    );
  });

  it("should render no frame if no followees available", () => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NeuronFollowingCard,
      },
    });

    expect(container.querySelector(".frame")).toBeNull();
  });

  it("should trigger listKnownNeurons", async () => {
    render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NeuronFollowingCard,
      },
    });

    expect(listKnownNeurons).toBeCalled();
  });
});
