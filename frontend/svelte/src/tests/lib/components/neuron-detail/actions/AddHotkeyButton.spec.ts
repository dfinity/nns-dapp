/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import AddHotkeyButton from "../../../../../lib/components/neuron-detail/actions/AddHotkeyButton.svelte";
import en from "../../../../mocks/i18n.mock";

describe("DissolveActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders split neuron message", () => {
    const { getByText } = render(AddHotkeyButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("renders disabled when stake is not enough", () => {
    const { container } = render(AddHotkeyButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    expect(buttonElement?.getAttribute("disabled")).not.toBeNull();
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
