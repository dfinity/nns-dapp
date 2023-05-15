/**
 * @jest-environment jsdom
 */

import BitcoinEstimatedAmountReceived from "$lib/components/accounts/BitcoinEstimatedAmountReceived.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";

describe("BitcoinEstimatedAmountReceived", () => {
  describe("should display zero as estimated received amount", () => {
    const zeroBtc = `${formatEstimatedFee(0n)} ${en.ckbtc.btc}`;

    it("both props undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: undefined,
          bitcoinEstimatedFee: undefined,
          kytEstimatedFee: undefined,
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toContain(zeroBtc);
    });

    it("amount undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: undefined,
          bitcoinEstimatedFee: 1_000n,
          kytEstimatedFee: 2_000n,
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toContain(zeroBtc);
    });

    it("fee undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: 10,
          bitcoinEstimatedFee: undefined,
          kytEstimatedFee: undefined,
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toContain(zeroBtc);
    });

    it("amount does not cover fee", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: 0.0000099,
          bitcoinEstimatedFee: 5_000n,
          kytEstimatedFee: 5_000n,
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toContain(zeroBtc);
    });
  });

  it("should display label estimated amount received", () => {
    const { getByText } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: undefined,
        bitcoinEstimatedFee: undefined,
        kytEstimatedFee: undefined,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    expect(
      getByText(en.accounts.received_amount_notice, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display label estimated notice", () => {
    const { getByText } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: undefined,
        bitcoinEstimatedFee: undefined,
        kytEstimatedFee: undefined,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    expect(getByText(en.accounts.estimation_notice)).toBeInTheDocument();
  });

  it("should display btc label", () => {
    const { getByText } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: undefined,
        bitcoinEstimatedFee: undefined,
        kytEstimatedFee: undefined,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    expect(getByText(en.ckbtc.btc, { exact: false })).toBeInTheDocument();
  });

  it("should display estimated received amount as zero if estimated btc fee not defined", () => {
    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: 0.0099,
        bitcoinEstimatedFee: undefined,
        kytEstimatedFee: 1_000n,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    const element = getByTestId("bitcoin-estimated-amount-value");
    expect((element?.textContent ?? "").trim()).toEqual(
      `${formatToken({
        value: 0n,
        detailed: "height_decimals",
      })} ${en.ckbtc.btc}`
    );
  });

  it("should display estimated received amount as zero if kyt fee not defined", () => {
    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: 0.0099,
        bitcoinEstimatedFee: 1_000n,
        kytEstimatedFee: undefined,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    const element = getByTestId("bitcoin-estimated-amount-value");
    expect((element?.textContent ?? "").trim()).toEqual(
      `${formatToken({
        value: 0n,
        detailed: "height_decimals",
      })} ${en.ckbtc.btc}`
    );
  });

  it("should display estimated received amount", () => {
    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: 0.0099,
        bitcoinEstimatedFee: 1_000n,
        kytEstimatedFee: 2_000n,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    const element = getByTestId("bitcoin-estimated-amount-value");

    const resultBtc = `${formatToken({
      value: 987_000n,
      detailed: "height_decimals",
    })} ${en.ckbtc.btc}`;
    expect(element?.textContent ?? "").toContain(resultBtc);
  });
});
