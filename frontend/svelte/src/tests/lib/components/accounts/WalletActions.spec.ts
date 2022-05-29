/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import WalletActions from "../../../../lib/components/accounts/WalletActions.svelte";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountContext,
  type SelectedAccountStore,
} from "../../../../lib/types/selected-account.context";
import {
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("WalletActions", () => {
  const renderWalletActions = (account) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedAccountStore>({
            account,
            transactions: undefined,
          }),
        } as SelectedAccountContext,
        Component: WalletActions,
      },
    });

  it("should render a menubar", () => {
    const { getByRole } = renderWalletActions(undefined);

    expect(getByRole("menubar")).not.toBeNull();
  });

  it("should render no content", () => {
    const { getByRole } = renderWalletActions(undefined);

    expect(getByRole("menubar").childElementCount).toEqual(0);
  });

  it("should render subaccount actions", () => {
    const { getByTestId } = renderWalletActions(mockSubAccount);

    expect(getByTestId("open-rename-subaccount-button")).not.toBeNull();
  });

  it("should render hardware wallet actions", () => {
    const { getByTestId } = renderWalletActions(mockHardwareWalletAccount);

    expect(getByTestId("ledger-list-button")).not.toBeNull();
    expect(getByTestId("ledger-show-button")).not.toBeNull();
  });
});
