import BitcoinEstimatedAmountReceived from "$lib/components/accounts/BitcoinEstimatedAmountReceived.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("BitcoinEstimatedAmountReceived", () => {
  beforeEach(() => {
    ckBTCInfoStore.reset();
  });

  describe("should display zero as estimated received amount", () => {
    const zeroBtc = `${formatEstimatedFee(0n)} ${en.ckbtc.btc}`;

    it("both props undefined", () => {
      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: undefined,
          bitcoinEstimatedFee: undefined,
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
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        },
      });

      const element = getByTestId("bitcoin-estimated-amount-value");
      expect(element?.textContent ?? "").toContain(zeroBtc);
    });

    it("amount does not cover fee", () => {
      ckBTCInfoStore.setInfo({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        info: {
          ...mockCkBTCMinterInfo,
          kyt_fee: 5_000n,
        },
        certified: true,
      });

      const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
        props: {
          amount: 0.0000099,
          bitcoinEstimatedFee: 5_000n,
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
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      },
    });

    expect(getByText(en.ckbtc.btc, { exact: false })).toBeInTheDocument();
  });

  it("should display estimated received amount as zero if estimated btc fee not defined", () => {
    ckBTCInfoStore.setInfo({
      canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: 1_000n,
      },
      certified: true,
    });

    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: 0.0099,
        bitcoinEstimatedFee: undefined,
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
    ckBTCInfoStore.setInfo({
      canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: 2_000n,
      },
      certified: true,
    });

    const { getByTestId } = render(BitcoinEstimatedAmountReceived, {
      props: {
        amount: 0.0099,
        bitcoinEstimatedFee: 1_000n,
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
