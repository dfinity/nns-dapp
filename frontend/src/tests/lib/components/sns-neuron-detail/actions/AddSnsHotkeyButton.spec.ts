/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/svelte";
import AddSnsHotkeyButton from "../../../../../lib/components/sns-neuron-detail/actions/AddSnsHotkeyButton.svelte";
import { renderSelectedSnsNeuronContext } from "../../../../mocks/context-wrapper.mock";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";

describe("AddSnsHotkeyButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderCard = () =>
    renderSelectedSnsNeuronContext({
      Component: AddSnsHotkeyButton,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

  it("renders add hotkey message", () => {
    const { getByText } = renderCard();

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = renderCard();

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("add-hotkey-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
