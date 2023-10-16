import TransactionDescription from "$lib/components/transaction/TransactionDescription.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
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

  it("should render transaction time seconds", () => {
    const { getByText } = render(TransactionDescription, {
      props: { destinationAddress: mockMainAccount.identifier },
    });

    expect(getByText(en.accounts.transaction_time)).toBeInTheDocument();
    expect(getByText(en.accounts.transaction_time_seconds)).toBeInTheDocument();
  });

  it("should render transaction time bitcoin", () => {
    const { getByText } = render(TransactionDescription, {
      props: {
        destinationAddress: mockMainAccount.identifier,
        selectedNetwork: TransactionNetwork.BTC_TESTNET,
      },
    });

    expect(getByText(en.accounts.transaction_time)).toBeInTheDocument();
    expect(getByText(en.ckbtc.about_thirty_minutes)).toBeInTheDocument();
  });

  it("should render ICP network as default", () => {
    const { getByTestId } = render(TransactionDescription, {
      props: {
        destinationAddress: mockMainAccount.identifier,
        selectedNetwork: undefined,
      },
    });

    expect(getByTestId("transaction-description-network")?.textContent).toEqual(
      en.accounts.network_icp
    );
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
