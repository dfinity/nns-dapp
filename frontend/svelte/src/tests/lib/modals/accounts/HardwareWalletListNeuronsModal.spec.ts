/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import HardwareWalletListNeuronsModal from "../../../../lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("HardwareWalletListNeuronsModal", () => {
  it("should display modal", () => {
    const { container } = render(HardwareWalletListNeuronsModal, {
      props: { neurons: [mockNeuron] },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(HardwareWalletListNeuronsModal, {
      props: { neurons: [mockNeuron] },
    });

    expect(getByText(en.neurons.title)).toBeInTheDocument();
  });

  it("should render list of neurons component", () => {
    const { getByText } = render(HardwareWalletListNeuronsModal, {
      props: { neurons: [mockNeuron] },
    });

    expect(
      getByText(en.accounts.attach_hardware_neurons_text)
    ).toBeInTheDocument();
  });
});
