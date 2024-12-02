import HardwareWalletShowAction from "$lib/components/accounts/HardwareWalletShowActionButton.svelte";
import { showAddressAndPubKeyOnHardwareWalletProxy } from "$lib/proxy/icp-ledger.services.proxy";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import type { Mock } from "vitest";

vi.mock("$lib/proxy/icp-ledger.services.proxy");

describe("HardwareWalletShowActionButton", () => {
  let spy;

  beforeEach(() => {
    spy = (
      showAddressAndPubKeyOnHardwareWalletProxy as Mock
    ).mockImplementation(async () => {
      // Do nothing test
    });
  });

  it("should call show info on Ledger device", async () => {
    const { getByRole } = render(HardwareWalletShowAction);

    fireEvent.click(getByRole("button"));

    expect(spy).toHaveBeenCalled();
  });
});
