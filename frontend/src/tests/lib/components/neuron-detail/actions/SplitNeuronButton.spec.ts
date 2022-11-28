/**
 * @jest-environment jsdom
 */

import SplitNeuronButton from "$lib/components/neuron-detail/actions/SplitNeuronButton.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextTest from "../NeuronContextTest.svelte";
import AddHotkeyButton from "$lib/components/neuron-detail/actions/AddHotkeyButton.svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("SplitNeuronButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
