/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import AddSnsHotkeyButton from "../../../../../lib/components/sns-neuron-detail/actions/AddSnsHotkeyButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";

describe("AddSnsHotkeyButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders add hotkey message", () => {
    const { getByText } = render(AddSnsHotkeyButton, {
      props: {
        neuronId: mockSnsNeuron.id[0],
      },
    });

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = render(AddSnsHotkeyButton, {
      props: {
        neuronId: mockSnsNeuron.id[0],
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("add-hotkey-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
