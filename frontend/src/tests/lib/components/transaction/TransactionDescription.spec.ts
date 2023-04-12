/**
 * @jest-environment jsdom
 */

import TransactionDescription from "$lib/components/transaction/TransactionDescription.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("TransactionDescription", () => {
  it("should render destination address", () => {
    const { getByText } = render(TransactionDescription, {
      props: { destinationAddress: mockMainAccount.identifier },
    });

    expect(getByText(en.accounts.to_address)).toBeInTheDocument();
    expect(getByText(mockMainAccount.identifier)).toBeInTheDocument();
  });

  it("should render label description", () => {
    const { getByText } = render(TransactionDescription, {
      props: { destinationAddress: mockMainAccount.identifier },
    });

    expect(getByText(en.accounts.description)).toBeInTheDocument();
  });

  it("should not render network", () => {
    const { getByTestId } = render(TransactionDescription, {
      props: { destinationAddress: mockMainAccount.identifier },
    });

    expect(() => getByTestId("transaction-description-network")).toThrow();
  });

  it("should render network", () => {
    const { getByTestId } = render(TransactionDescription, {
      props: {
        destinationAddress: mockMainAccount.identifier,
        selectedNetwork: TransactionNetwork.BTC_TESTNET,
      },
    });

    expect(getByTestId("transaction-description-network")?.textContent).toEqual(
      en.accounts.network_btc_testnet
    );
  });
});
