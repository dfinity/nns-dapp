/**
 * @jest-environment jsdom
 */

import NnsDestinationAddress from "$lib/components/accounts/NnsDestinationAddress.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { render } from "@testing-library/svelte";

describe("NnsDestinationAddress", () => {
  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: `test-subaccount2-identifier`,
  };

  jest
    .spyOn(icpAccountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount, mockSubAccount2])
    );

  it("should render an input to enter an address", () => {
    const { container } = render(NnsDestinationAddress);

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("should render a list of accounts", () => {
    const { getByText } = render(NnsDestinationAddress);

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount2.identifier, { exact: false })
    ).toBeInTheDocument();
  });
});
