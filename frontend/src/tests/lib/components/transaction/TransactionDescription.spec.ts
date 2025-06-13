import TransactionDescription from "$lib/components/transaction/TransactionDescription.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";

describe("TransactionDescription", () => {
  const renderComponent = ({
    selectedNetwork,
  }: {
    selectedNetwork?: TransactionNetwork;
  } = {}) => {
    return render(TransactionDescription, {
      props: {
        description: createMockSnippet(),
        destinationInfo: createMockSnippet(),
        destinationAddress: mockMainAccount.identifier,
        selectedNetwork,
      },
    });
  };

  it("should render destination address", () => {
    const { getByText } = renderComponent();

    expect(getByText(en.accounts.to_address)).toBeInTheDocument();
    expect(getByText(mockMainAccount.identifier)).toBeInTheDocument();
  });

  it("should render label description", () => {
    const { getByText } = renderComponent();

    expect(getByText(en.accounts.description)).toBeInTheDocument();
  });

  it("should render transaction time seconds", () => {
    const { getByText } = renderComponent();

    expect(getByText(en.accounts.transaction_time)).toBeInTheDocument();
    expect(getByText(en.accounts.transaction_time_seconds)).toBeInTheDocument();
  });

  it("should render transaction time bitcoin", () => {
    const { getByText } = renderComponent({
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    expect(getByText(en.accounts.transaction_time)).toBeInTheDocument();
    expect(getByText(en.ckbtc.about_thirty_minutes)).toBeInTheDocument();
  });

  it("should render ICP network as default", () => {
    const { getByTestId } = renderComponent({
      selectedNetwork: undefined,
    });

    expect(getByTestId("transaction-description-network")?.textContent).toEqual(
      en.accounts.network_icp
    );
  });

  it("should render network", () => {
    const { getByTestId } = renderComponent({
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    expect(getByTestId("transaction-description-network")?.textContent).toEqual(
      en.accounts.network_btc_testnet
    );
  });
});
