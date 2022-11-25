/**
 * @jest-environment jsdom
 */

import HardwareWalletListNeurons from "$lib/components/accounts/HardwareWalletListNeuronsButton.svelte";
import { listNeuronsHardwareWalletProxy } from "$lib/proxy/ledger.services.proxy";
import { walletModal } from "$lib/stores/modal.store";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import WalletActionsTest from "./WalletActionsTest.svelte";

jest.mock("$lib/proxy/ledger.services.proxy");

describe("HardwareWalletListNeuronsButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  let spy;

  beforeAll(() => {
    spy = (listNeuronsHardwareWalletProxy as jest.Mock).mockImplementation(
      async () => ({
        neurons: [mockNeuron],
      })
    );
  });

  const renderTestCmp = () =>
    render(WalletActionsTest, {
      props: {
        account: mockMainAccount,
        testComponent: HardwareWalletListNeurons,
      },
    });

  it("should contain a closed modal per default", () => {
    const { getByText } = renderTestCmp();
    expect(() => getByText(en.neurons.title)).toThrow();
  });

  it("should contain an action named list neurons", async () => {
    const { getByText } = renderTestCmp();
    expect(
      getByText(en.accounts.attach_hardware_show_neurons)
    ).toBeInTheDocument();
  });

  it("should list neurons and open modal", async () => {
    const { getByTestId } = renderTestCmp();
    await fireEvent.click(
      getByTestId("ledger-list-button") as HTMLButtonElement
    );

    const modal = get(walletModal);
    expect(modal).toEqual("hw-list-neurons");

    expect(spy).toHaveBeenCalled();
  });
});
