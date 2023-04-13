/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("BitcoinKYTFee", () => {
  let spyDepositFee;

  const props = {
    minterCanisterId: CKBTC_MINTER_CANISTER_ID,
    selectedNetwork: TransactionNetwork.BTC_TESTNET,
  };

  describe("display fee", () => {
    const result = 789n;

    beforeEach(() => {
      spyDepositFee = jest
        .spyOn(minterApi, "depositFee")
        .mockResolvedValue(result);
    });

    it("should display deposit fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      await waitFor(() => expect(getByTestId("kyt-fee")).not.toBeNull());

      // Query + update
      expect(spyDepositFee).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        const content = getByTestId("kyt-fee")?.textContent ?? "";

        expect(content.includes(en.ckbtc.kyt_fee)).toBeTruthy();
        expect(content.includes(`${formatEstimatedFee(result)}`)).toBeTruthy();
        expect(content.includes(en.ckbtc.btc)).toBeTruthy();
      });
    });
  });

  describe("has error", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);

      spyDepositFee = jest
        .spyOn(minterApi, "depositFee")
        .mockImplementation(async () => {
          throw new Error();
        });
    });

    it("should not display deposit fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      await waitFor(() => expect(getByTestId("kyt-fee")).not.toBeNull());

      const content = getByTestId("kyt-fee")?.textContent ?? "";

      expect(content.trim()).toEqual(`${en.ckbtc.kyt_fee}`);
    });
  });
});
