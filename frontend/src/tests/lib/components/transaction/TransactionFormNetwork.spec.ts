/**
 * @jest-environment jsdom
 */

import TransactionFormNetwork from "$lib/components/transaction/TransactionFormNetwork.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("TransactionFormNetwork", () => {
  const props = { universeId: CKBTC_UNIVERSE_CANISTER_ID };

  it("should display a network title", () => {
    const { getByText } = render(TransactionFormNetwork, { props });

    expect(getByText(en.accounts.network)).toBeInTheDocument();
  });

  it("should render dropdown per default", () => {
    const { getByTestId } = render(TransactionFormNetwork, { props });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
  });

  it("should render dropdown if explicitly not readonly", () => {
    const { getByTestId } = render(TransactionFormNetwork, {
      props: {
        ...props,
        networkReadonly: false,
      },
    });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
    expect(() => getByTestId("readonly-network")).toThrow();
  });

  it("should render dropdown if explicitly not readonly", () => {
    const { getByTestId } = render(TransactionFormNetwork, {
      props: {
        ...props,
        networkReadonly: false,
      },
    });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
    expect(() => getByTestId("readonly-network")).toThrow();
  });

  it("should render static text if readonly", () => {
    const { getByTestId } = render(TransactionFormNetwork, {
      props: {
        ...props,
        networkReadonly: true,
      },
    });

    expect(() => getByTestId("select-network-dropdown")).toThrow();
    expect(getByTestId("readonly-network")).not.toBeNull();
  });

  it("should render the network name if readonly", () => {
    const { getByTestId } = render(TransactionFormNetwork, {
      props: {
        ...props,
        networkReadonly: true,
        selectedNetwork: TransactionNetwork.BTC_MAINNET,
      },
    });

    expect(getByTestId("readonly-network")?.textContent).toEqual(
      en.accounts.network_btc_mainnet
    );
  });

  it("should render ICP as fallback if readonly and no particular selected network", () => {
    const { getByTestId } = render(TransactionFormNetwork, {
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
