/**
 * @jest-environment jsdom
 */

import TransactionNetwork from "$lib/components/transaction/TransactionNetwork.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork as TransactionNetworkType } from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("TransactionNetwork", () => {
  const props = { universeId: CKBTC_UNIVERSE_CANISTER_ID };

  it("should display a network title", () => {
    const { getByText } = render(TransactionNetwork, { props });

    expect(getByText(en.accounts.network)).toBeInTheDocument();
  });

  it("should render dropdown per default", () => {
    const { getByTestId } = render(TransactionNetwork, { props });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
  });

  it("should render dropdown if explicitly not readonly", () => {
    const { getByTestId } = render(TransactionNetwork, {
      props: {
        ...props,
        networkReadonly: false,
      },
    });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
    expect(() => getByTestId("readonly-network")).toThrow();
  });

  it("should render dropdown if explicitly not readonly", () => {
    const { getByTestId } = render(TransactionNetwork, {
      props: {
        ...props,
        networkReadonly: false,
      },
    });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
    expect(() => getByTestId("readonly-network")).toThrow();
  });

  it("should render static text if readonly", () => {
    const { getByTestId } = render(TransactionNetwork, {
      props: {
        ...props,
        networkReadonly: true,
      },
    });

    expect(() => getByTestId("select-network-dropdown")).toThrow();
    expect(getByTestId("readonly-network")).not.toBeNull();
  });

  it("should render the network name if readonly", () => {
    const { getByTestId } = render(TransactionNetwork, {
      props: {
        ...props,
        networkReadonly: true,
        selectedNetwork: TransactionNetworkType.BTC_MAINNET,
      },
    });

    expect(getByTestId("readonly-network")?.textContent).toEqual(
      en.accounts.network_btc_mainnet
    );
  });

  it("should render ICP as fallback if readonly and no particular selected network", () => {
    const { getByTestId } = render(TransactionNetwork, {
      props: {
        ...props,
        networkReadonly: true,
      },
    });

    expect(getByTestId("readonly-network")?.textContent).toEqual(
      en.accounts.network_icp
    );
  });
});
