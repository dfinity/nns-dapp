/**
 * @jest-environment jsdom
 */

import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import {
  mockBTCAddressMainnet,
  mockBTCAddressTestnet,
  mockCkBTCAddress,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SelectNetworkDropdown", () => {
  const props = { universeId: CKBTC_UNIVERSE_CANISTER_ID };

  it("should render a select component", () => {
    const { getByTestId } = render(SelectNetworkDropdown, { props });

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
  });

  it("should display a disable placeholder", () => {
    const { container } = render(SelectNetworkDropdown, { props });

    const option = container.querySelector("option[disabled]");

    expect(option).not.toBeNull();
    expect(option?.getAttribute("value")).toEqual("undefined");
  });

  it("should display an option to select ICP", () => {
    const { container } = render(SelectNetworkDropdown, { props });

    const option = container.querySelector("option[value='network_icp']");

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_icp);
  });

  it("should display an option to select bitcoin", () => {
    const { container } = render(SelectNetworkDropdown, { props });

    const option = container.querySelector(
      "option[value='network_btc_mainnet']"
    );

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_btc_mainnet);
  });

  it("should bind select to selected network", async () => {
    const { getByTestId, component, container } = render(
      SelectNetworkDropdown,
      { props }
    );

    const optionDefault = container.querySelector("option[disabled]");
    expect(optionDefault).not.toBeNull();

    const selectElement = getByTestId(
      "select-network-dropdown"
    ) as HTMLSelectElement | null;
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: TransactionNetwork.ICP },
      });

    await waitFor(() =>
      expect(component.$$.ctx[component.$$.props["selectedNetwork"]]).toEqual(
        TransactionNetwork.ICP
      )
    );
  });

  it("should auto select ckBTC network", async () => {
    const { component } = render(SelectNetworkDropdown, {
      props: {
        ...props,
        selectedDestinationAddress: mockCkBTCAddress,
      },
    });

    await waitFor(() =>
      expect(component.$$.ctx[component.$$.props["selectedNetwork"]]).toEqual(
        TransactionNetwork.ICP
      )
    );
  });

  it("should auto select BTC testnet network", async () => {
    const { component } = render(SelectNetworkDropdown, {
      props: {
        ...props,
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        selectedDestinationAddress: mockBTCAddressTestnet,
      },
    });

    await waitFor(() =>
      expect(component.$$.ctx[component.$$.props["selectedNetwork"]]).toEqual(
        TransactionNetwork.BTC_TESTNET
      )
    );
  });

  it("should auto select BTC mainnet network", async () => {
    const { component } = render(SelectNetworkDropdown, {
      props: {
        ...props,
        selectedDestinationAddress: mockBTCAddressMainnet,
      },
    });

    await waitFor(() =>
      expect(component.$$.ctx[component.$$.props["selectedNetwork"]]).toEqual(
        TransactionNetwork.BTC_MAINNET
      )
    );
  });

  it("should auto not select BTC mainnet network", async () => {
    const { component } = render(SelectNetworkDropdown, {
      props: {
        ...props,
        selectedNetwork: TransactionNetwork.ICP,
        selectedDestinationAddress: mockBTCAddressMainnet,
      },
    });

    await waitFor(() =>
      expect(
        component.$$.ctx[component.$$.props["selectedNetwork"]]
      ).not.toEqual(TransactionNetwork.BTC_MAINNET)
    );
  });
});
