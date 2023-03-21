/**
 * @jest-environment jsdom
 */

import BitcoinEstimatedAmountReceived from "$lib/components/accounts/BitcoinEstimatedAmountReceived.svelte";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";

describe("BitcoinEstimatedAmountReceived", () => {
  describe("should display zero as estimated received amount", () => {
    it("both props undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: { amount: undefined, bitcoinEstimatedFee: undefined },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toEqual("0");
    });

    it("amount undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: { amount: undefined, bitcoinEstimatedFee: 1_000n },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toEqual("0");
    });

    it("fee undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: { amount: 10, bitcoinEstimatedFee: undefined },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toEqual("0");
    });

    it("amount does not cover fee", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: { amount: 0.0000099, bitcoinEstimatedFee: 1_000n },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toEqual("0");
    });
  });

  it("should display label estimated amount received", () => {
    const { getByText } = render(BitcoinEstimatedAmountReceived, {
      props: { amount: undefined, bitcoinEstimatedFee: undefined },
    });

    expect(
      getByText(en.accounts.estimated_amount_received, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display btc label", () => {
    const { getByText } = render(BitcoinEstimatedAmountReceived, {
      props: { amount: undefined, bitcoinEstimatedFee: undefined },
    });

    expect(getByText(en.ckbtc.btc, { exact: false })).toBeInTheDocument();
  });

  it("should display estimated received amount", () => {
    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: { amount: 0.0099, bitcoinEstimatedFee: 1_000n },
    });

    const element = getByTestId("bitcoin-estimated-amount-value");
    expect(element?.textContent ?? "").toEqual("0.00989");
  });
});
