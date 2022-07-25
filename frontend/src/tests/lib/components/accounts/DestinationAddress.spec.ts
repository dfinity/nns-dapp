/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import DestinationAddress from "../../../../lib/components/accounts/DestinationAddress.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";

describe("DestinationAddress", () => {
  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: `test-identifier`,
  };

  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount, mockSubAccount2])
    );

  it("should render an input to enter an address", () => {
    const { container } = render(DestinationAddress);

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("should render a list of accounts", () => {
    const { getByText } = render(DestinationAddress);

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount2.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should filter selected account", () => {
    const { getByText } = render(DestinationAddress, {
      props: {
        filterIdentifier: mockMainAccount.identifier,
      },
    });

    expect(() =>
      getByText(mockMainAccount.identifier, { exact: false })
    ).toThrow();
  });
});
