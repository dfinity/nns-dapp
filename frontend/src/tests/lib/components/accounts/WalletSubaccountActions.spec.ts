/**
 * @jest-environment jsdom
 */

import WalletSubaccountActions from "$lib/components/accounts/WalletSubaccountActions.svelte";
import { mockSubAccount } from "../../../mocks/accounts.store.mock";
import { renderWalletActions } from "../../../mocks/wallet.mock";

describe("WalletActions", () => {
  it("should render no button", () => {
    const { container } = renderWalletActions({
      account: undefined,
      component: WalletSubaccountActions,
    });

    expect(container.querySelectorAll("button").length).toEqual(0);
  });

  it("should render subaccount actions", () => {
    const { getByTestId } = renderWalletActions({
      account: mockSubAccount,
      component: WalletSubaccountActions,
    });

    expect(getByTestId("open-rename-subaccount-button")).not.toBeNull();
  });
});
