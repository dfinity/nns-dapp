/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import HardwareWalletListNeurons from "../../../../lib/components/accounts/HardwareWalletListNeuronsButton.svelte";
import { listNeuronsHardwareWalletProxy } from "../../../../lib/proxy/ledger.services.proxy";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletListNeuronsButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  let spy;

  beforeAll(() => {
    spy = (listNeuronsHardwareWalletProxy as jest.Mock).mockImplementation(
      async () => ({ neurons: [mockNeuron] })
    );
  });

  it("should contain a closed modal per default", () => {
    const { getByText } = render(HardwareWalletListNeurons);
    expect(() => getByText(en.neurons.title)).toThrow();
  });

  it("should contain an action named list neurons", async () => {
    const { getByText } = render(HardwareWalletListNeurons);
    expect(
      getByText(en.accounts.attach_hardware_show_neurons)
    ).toBeInTheDocument();
  });

  it("should list neurons and open modal", async () => {
    const { getByText, getByTestId } = render(HardwareWalletListNeurons);
    await fireEvent.click(
      getByTestId("ledger-list-button") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(getByText(en.neurons.title)).toBeInTheDocument()
    );

    expect(spy).toHaveBeenCalled();
  });
});
