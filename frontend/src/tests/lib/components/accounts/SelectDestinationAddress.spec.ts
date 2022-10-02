/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import SelectDestinationAddress from "../../../../lib/components/accounts/SelectDestinationAddress.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";

describe("SelectDestinationAddress", () => {
  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: "test-identifier",
  };
  const subaccounts = [mockSubAccount, mockSubAccount2];
  const hardwareWallets = [mockHardwareWalletAccount];

  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe(subaccounts, hardwareWallets)
    );

  it("should render address input as default", () => {
    const { container } = render(SelectDestinationAddress);

    expect(
      container.querySelector("input[name='accounts-address']")
    ).toBeInTheDocument();
  });

  it("should render toggle", () => {
    const { container } = render(SelectDestinationAddress);

    const toggle = container.querySelector("input[id='toggle']");
    expect(toggle).toBeInTheDocument();
  });

  it("should not render toggle if no extra accounts to choose from", () => {
    const { container } = render(SelectDestinationAddress, {
      props: {
        filterAccounts: () => false,
      },
    });

    const toggle = container.querySelector("input[id='toggle']");
    expect(toggle).not.toBeInTheDocument();
  });

  it("should render select account dropdown when toggle is clicked", async () => {
    const { container, queryByTestId } = render(SelectDestinationAddress);

    expect(
      container.querySelector("input[name='accounts-address']")
    ).toBeInTheDocument();

    const toggle = container.querySelector("input[id='toggle']");
    toggle && fireEvent.click(toggle);

    await waitFor(() =>
      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
    );
  });
});
