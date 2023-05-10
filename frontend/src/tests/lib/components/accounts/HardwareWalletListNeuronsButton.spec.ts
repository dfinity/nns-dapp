import HardwareWalletListNeurons from "$lib/components/accounts/HardwareWalletListNeuronsButton.svelte";
import { listNeuronsHardwareWalletProxy } from "$lib/proxy/ledger.services.proxy";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { vi, type Mock } from "vitest";
import WalletContextTest from "./WalletContextTest.svelte";

vi.mock("$lib/proxy/ledger.services.proxy");

describe("HardwareWalletListNeuronsButton", () => {
  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  let spy;

  beforeAll(() => {
    spy = (listNeuronsHardwareWalletProxy as Mock).mockImplementation(
      async () => ({
        neurons: [mockNeuron],
      })
    );
  });

  const renderTestCmp = () =>
    render(WalletContextTest, {
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
    const { getByTestId, container } = renderTestCmp();
    await fireEvent.click(
      getByTestId("ledger-list-button") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );

    expect(spy).toHaveBeenCalled();
  });
});
