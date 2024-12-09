import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { get } from "svelte/store";

describe("icp-swap.derived", () => {
  describe("icpSwapUsdPricesStore", () => {
    it("should be initialized as undefined", () => {
      expect(get(icpSwapUsdPricesStore)).toBeUndefined();
    });

    it("should be 'error' if tickers are not an array", () => {
      // This is theoretically possible because the tickers store content is
      // read from ICP Swap, which we have no control over.
      icpSwapTickersStore.set({} as unknown as IcpSwapTicker[]);

      vi.spyOn(console, "error").mockReturnValue();

      expect(get(icpSwapUsdPricesStore)).toEqual("error");

      expect(console.error).toBeCalledWith(
        new TypeError("tickers.filter is not a function")
      );
      expect(console.error).toBeCalledTimes(1);
    });

    it("should be 'error' if there are no tickers", () => {
      icpSwapTickersStore.set([]);
      expect(get(icpSwapUsdPricesStore)).toEqual("error");
    });

    it("should be 'error' if there is no ckUSDC ticker", () => {
      icpSwapTickersStore.set([mockIcpSwapTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual("error");
    });

    it("should be 'error' if ICP price in ckUSDC is zero", () => {
      const icpPriceInUsd = 0.0;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };

      icpSwapTickersStore.set([ckusdcTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual("error");
    });

    it("should have an ICP price if there is a ckUSDC ticker", () => {
      const icpPriceInUsd = 12.4;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };

      icpSwapTickersStore.set([ckusdcTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: icpPriceInUsd,
        [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
      });
    });

    it("should have a ckETH price", () => {
      const icpPriceInUsd = 12.4;
      const icpPriceInCketh = 0.004;
      const ckethPriceInUsd = icpPriceInUsd / icpPriceInCketh;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };
      const ckethTicker = {
        ...mockIcpSwapTicker,
        base_id: CKETH_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInCketh}`,
      };

      icpSwapTickersStore.set([ckusdcTicker, ckethTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: icpPriceInUsd,
        [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
        [CKETH_LEDGER_CANISTER_ID.toText()]: ckethPriceInUsd,
      });
    });

    it("should skip non-ICP base tickers", () => {
      const icpPriceInUsd = 12.4;
      const icpPriceInCketh = 0.004;
      const ckethPriceInUsd = icpPriceInUsd / icpPriceInCketh;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };
      const ckethTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        target_id: CKETH_LEDGER_CANISTER_ID.toText(),
        last_price: `${ckethPriceInUsd}`,
      };

      icpSwapTickersStore.set([ckusdcTicker, ckethTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: icpPriceInUsd,
        [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
      });
    });

    it("should not divide by zero for zero price", () => {
      const icpPriceInUsd = 12.4;
      const icpPriceInCketh = 0.0;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };
      const ckethTicker = {
        ...mockIcpSwapTicker,
        base_id: CKETH_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInCketh}`,
      };

      icpSwapTickersStore.set([ckusdcTicker, ckethTicker]);
      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: icpPriceInUsd,
        [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
        // No entry for CKETH_LEDGER_CANISTER_ID
      });
    });
  });
});
