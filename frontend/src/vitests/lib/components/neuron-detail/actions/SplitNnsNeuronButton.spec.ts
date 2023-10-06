import SplitNeuronButton from "$lib/components/neuron-detail/actions/SplitNnsNeuronButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("SplitNeuronButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders split neuron message", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: SplitNeuronButton,
      },
    });

    expect(getByText(en.neuron_detail.split_neuron)).toBeInTheDocument();
  });

  it("renders disabled when stake is not enough", () => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: BigInt(10),
          },
        },
        testComponent: SplitNeuronButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    expect(buttonElement?.getAttribute("disabled")).not.toBeNull();
  });

  it("opens Split Neuron Modal", async () => {
    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: BigInt(1_000_000_000),
          },
        },
        testComponent: SplitNeuronButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("split-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
