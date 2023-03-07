/**
 * @jest-environment jsdom
 */

import AddHotkeyButton from "$lib/components/neuron-detail/actions/AddHotkeyButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("AddHotkeyButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders add hotkey message", () => {
    const { getByText } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: AddHotkeyButton,
      },
    });

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: AddHotkeyButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("add-hotkey-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
