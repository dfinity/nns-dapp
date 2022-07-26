/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import HardwareWalletNeuronAddHotkeyButton from "../../../../lib/components/accounts/HardwareWalletNeuronAddHotkeyButton.svelte";
import en from "../../../mocks/i18n.mock";
import HardwareWalletAddNeuronHotkeyTest from "./HardwareWalletAddNeuronHotkeyTest.svelte";

describe("HardwareWalletNeuronAddHotkeyButton", () => {
  const props = { testComponent: HardwareWalletNeuronAddHotkeyButton };

  it("should contain a closed modal per default", () => {
    const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });
    expect(() =>
      getByText(en.accounts.hardware_wallet_add_hotkey_title)
    ).toThrow();
  });

  it("should contain an action named attach neuron", async () => {
    const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });
    expect(
      getByText(en.accounts.attach_hardware_neurons_add)
    ).toBeInTheDocument();
  });

  it("should open modal", async () => {
    const { getByText, getByTestId } = render(
      HardwareWalletAddNeuronHotkeyTest,
      {
        props,
      }
    );
    await fireEvent.click(
      getByTestId("open-hardware-wallet-add-hotkey-button") as HTMLButtonElement
    );
    expect(
      getByText(en.accounts.attach_hardware_neurons_add)
    ).toBeInTheDocument();
  });
});
