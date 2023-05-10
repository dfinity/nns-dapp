import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("BitcoinKYTFee", () => {
  let spyDepositFee;

  const props = {
    minterCanisterId: CKBTC_MINTER_CANISTER_ID,
    selectedNetwork: TransactionNetwork.BTC_TESTNET,
  };

  describe("display fee", () => {
    const result = 789n;

    beforeEach(() => {
      spyDepositFee = vi
        .spyOn(minterApi, "depositFee")
        .mockResolvedValue(result);
    });

    it("should display deposit fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      await waitFor(() =>
        expect(getByTestId("kyt-estimated-fee-label")).not.toBeNull()
      );

      // Query + update
      expect(spyDepositFee).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        const label = getByTestId("kyt-estimated-fee-label")?.textContent ?? "";
        expect(
          label.includes(en.accounts.estimated_internetwork_fee)
        ).toBeTruthy();

        const fee = getByTestId("kyt-estimated-fee")?.textContent ?? "";
        expect(fee.includes(`${formatEstimatedFee(result)}`)).toBeTruthy();
        expect(fee.includes(en.ckbtc.btc)).toBeTruthy();
      });
    });
  });

  describe("has error", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      spyDepositFee = vi
        .spyOn(minterApi, "depositFee")
        .mockImplementation(async () => {
          throw new Error();
        });
    });

    it("should not display deposit fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      await waitFor(() => expect(spyDepositFee).toHaveBeenCalled());

      expect(() => getByTestId("kyt-estimated-fee-label")).toThrow();
      expect(() => getByTestId("kyt-estimated-fee")).toThrow();
    });
  });

  describe("no selected network", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      spyDepositFee = vi.spyOn(minterApi, "depositFee").mockResolvedValue(0n);
    });

    it("should not display deposit fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props: {
          minterCanisterId: CKBTC_MINTER_CANISTER_ID,
        },
      });

      expect(spyDepositFee).not.toHaveBeenCalled();
      expect(() => getByTestId("kyt-estimated-fee-label")).toThrow();
      expect(() => getByTestId("kyt-estimated-fee")).toThrow();
    });
  });
});
