/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import WalletActions from "../../../../lib/components/accounts/WalletActions.svelte";
import {
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";

describe("WalletActions", () => {
  it("should render a menubar", () => {
    const { getByRole } = render(WalletActions, {
      props: { selectedAccount: undefined },
    });

    expect(getByRole("menubar")).not.toBeNull();
  });

  it("should render no content", () => {
    const { getByRole } = render(WalletActions, {
      props: { selectedAccount: undefined },
    });

    expect(getByRole("menubar").childElementCount).toEqual(0);
  });

  it("should render subaccount actions", () => {
    const { getByTestId } = render(WalletActions, {
      props: { selectedAccount: mockSubAccount },
    });

    expect(getByTestId("open-rename-subaccount-button")).not.toBeNull();
  });

  it("should render hardware wallet actions", () => {
    const { getByTestId } = render(WalletActions, {
      props: { selectedAccount: mockHardwareWalletAccount },
    });

    expect(getByTestId("ledger-show-button")).not.toBeNull();
  });
});
