/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import HardwareWalletShowAction from "../../../../lib/components/accounts/HardwareWalletShowActionButton.svelte";
import { showAddressAndPubKeyOnHardwareWalletProxy } from "../../../../lib/proxy/ledger.services.proxy";

jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletShowActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  let spy;

  beforeAll(() => {
    spy = (
      showAddressAndPubKeyOnHardwareWalletProxy as jest.Mock
    ).mockImplementation(async () => {
      // Do nothing test
    });
  });

  it("should call show info on hardware wallet", async () => {
    const { getByRole } = render(HardwareWalletShowAction);

    fireEvent.click(getByRole("button"));

    expect(spy).toHaveBeenCalled();
  });
});
