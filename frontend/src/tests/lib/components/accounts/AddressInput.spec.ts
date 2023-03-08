/**
 * @jest-environment jsdom
 */

import AddressInput from "$lib/components/accounts/AddressInput.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";
import {mockBTCAddressTestnet, mockCkBTCAddress} from "../../../mocks/ckbtc-accounts.mock";

describe("AddressInput", () => {
  const props = { address: undefined };

  it("should render an input with a minimal length of 40", () => {
    const { container } = render(AddressInput, { props });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("should show error message on blur when invalid address", async () => {
    const { container, queryByTestId } = render(AddressInput, { props });

    const input = container.querySelector("input") as HTMLInputElement;

    await fireEvent.input(input, { target: { value: "invalid-address" } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeInTheDocument();
  });

  it("should show error message on network change with invalid address", async () => {
    const { container, queryByTestId, rerender } = render(AddressInput, {
      props,
    });

    const input = container.querySelector("input") as HTMLInputElement;

    await fireEvent.input(input, { target: { value: mockCkBTCAddress } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeNull();

    rerender({
      ...props,
      address: mockCkBTCAddress,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    await waitFor(() =>
      expect(queryByTestId("input-error-message")).toBeInTheDocument()
    );
  });

  it("should not show error message on network change with valid BTC address", async () => {
    const { container, queryByTestId, rerender } = render(AddressInput, {
      props,
    });

    const input = container.querySelector("input") as HTMLInputElement;

    await fireEvent.input(input, { target: { value: mockCkBTCAddress } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeNull();

    rerender({
      ...props,
      address: mockCkBTCAddress,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    await waitFor(() =>
      expect(queryByTestId("input-error-message")).toBeInTheDocument()
    );

    rerender({
      ...props,
      address: mockBTCAddressTestnet,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    expect(queryByTestId("input-error-message")).toBeNull();
  });
});
