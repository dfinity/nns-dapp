/**
 * @jest-environment jsdom
 */

import AddressInput from "$lib/components/accounts/AddressInput.svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";

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

    const ckBTCAdress =
      "73avq-yvrvj-kuzxq-kttlj-nkaz4-tecy6-biuud-3ymeg-guvci-naire-uqe";

    await fireEvent.input(input, { target: { value: ckBTCAdress } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeNull();

    rerender({
      ...props,
      address: ckBTCAdress,
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

    const ckBTCAdress =
      "73avq-yvrvj-kuzxq-kttlj-nkaz4-tecy6-biuud-3ymeg-guvci-naire-uqe";

    await fireEvent.input(input, { target: { value: ckBTCAdress } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeNull();

    rerender({
      ...props,
      address: ckBTCAdress,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    await waitFor(() =>
      expect(queryByTestId("input-error-message")).toBeInTheDocument()
    );

    const btcAddress = "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn";

    rerender({
      ...props,
      address: btcAddress,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    expect(queryByTestId("input-error-message")).toBeNull();
  });
});
