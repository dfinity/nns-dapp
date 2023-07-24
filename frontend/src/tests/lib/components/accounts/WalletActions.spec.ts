/**
 * @jest-environment jsdom
 */

import WalletActions from "$lib/components/accounts/WalletActions.svelte";
import {
  mockHardwareWalletAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { render } from "@testing-library/svelte";
import WalletContextTest from "./WalletContextTest.svelte";

describe("WalletActions", () => {
  const renderWalletActions = (account) =>
    render(WalletContextTest, {
      props: {
        account,
        testComponent: WalletActions,
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
