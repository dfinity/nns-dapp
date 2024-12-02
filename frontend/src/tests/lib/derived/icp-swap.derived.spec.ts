import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { get } from "svelte/store";

describe("icp-swap.derived", () => {
  describe("icpSwapUsdPricesStore", () => {
    it("should be initialized as undefined", () => {
      expect(get(icpSwapUsdPricesStore)).toBeUndefined();
    });

    it("should be empty if there are no tickers", () => {
      icpSwapTickersStore.set({ tickers: [], lastUpdateTimestampSeconds: 0 });
      expect(get(icpSwapUsdPricesStore)).toEqual({});
    });

    it("should be empty if there is no ckUSDC ticker", () => {
      icpSwapTickersStore.set({
        tickers: [mockIcpSwapTicker],
        lastUpdateTimestampSeconds: 0,
      });
      expect(get(icpSwapUsdPricesStore)).toEqual({});
    });

    it("should have an ICP price if there is a ckUSDC ticker", () => {
      const icpPriceInUsd = 12.4;

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: `${icpPriceInUsd}`,
      };

      icpSwapTickersStore.set({
        tickers: [ckusdcTicker],
        lastUpdateTimestampSeconds: 0,
      });
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

      icpSwapTickersStore.set({
        tickers: [ckusdcTicker, ckethTicker],
        lastUpdateTimestampSeconds: 0,
      });
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

      icpSwapTickersStore.set({
        tickers: [ckusdcTicker, ckethTicker],
        lastUpdateTimestampSeconds: 0,
      });
      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: icpPriceInUsd,
        [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
      });
    });
  });
});
