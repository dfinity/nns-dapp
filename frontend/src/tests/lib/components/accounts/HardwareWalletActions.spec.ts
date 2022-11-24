/**
 * @jest-environment jsdom
 */

import HardwareWalletActions from "$lib/components/accounts/HardwareWalletActions.svelte";
import { mockHardwareWalletAccount } from "../../../mocks/accounts.store.mock";
import { renderWalletActions } from "../../../mocks/wallet.mock";

describe("WalletActions", () => {
  it("should render no content", () => {
    const { getByRole } = renderWalletActions({
      account: undefined,
      component: HardwareWalletActions,
    });

    expect(() => getByRole("menubar")).toThrow();
  });

  it("should render hardware wallet actions", () => {
    const { getByTestId } = renderWalletActions({
      account: mockHardwareWalletAccount,
      component: HardwareWalletActions,
    });

    expect(getByTestId("ledger-list-button")).not.toBeNull();
    expect(getByTestId("ledger-show-button")).not.toBeNull();
  });
});
