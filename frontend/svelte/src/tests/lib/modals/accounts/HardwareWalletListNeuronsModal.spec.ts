/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import HardwareWalletListNeuronsModal from "../../../../lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";
import en from "../../../mocks/i18n.mock";
import HardwareWalletNeuronsTest from "../../components/accounts/HardwareWalletNeuronsTest.svelte";

describe("HardwareWalletListNeuronsModal", () => {
  const props = { testComponent: HardwareWalletListNeuronsModal };

  it("should display modal", () => {
    const { container } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(getByText(en.neurons.title)).toBeInTheDocument();
  });

  it("should render list of neurons component", () => {
    const { getByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(
      getByText(en.accounts.attach_hardware_neurons_text)
    ).toBeInTheDocument();
  });
});
