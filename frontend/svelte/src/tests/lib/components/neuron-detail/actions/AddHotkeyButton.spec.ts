/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import AddHotkeyButton from "../../../../../lib/components/neuron-detail/actions/AddHotkeyButton.svelte";
import en from "../../../../mocks/i18n.mock";

describe("AddHotkeyButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders add hotkey message", () => {
    const { getByText } = render(AddHotkeyButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = render(AddHotkeyButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("add-hotkey-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
