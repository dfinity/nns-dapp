import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import {
  setIcpPrice,
  setIcpSwapUsdPrices,
} from "$tests/utils/icp-swap.test-utils";
import { get } from "svelte/store";

describe("icp-swap.test-utils.spec.ts", () => {
  describe("setIcpSwapUsdPrices", () => {
    it("should set the price of ICP to 10 USD by default", () => {
      setIcpSwapUsdPrices({});

      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: 10,
        [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      });
    });

    it("should set the price of ICP to 123 USD", () => {
      setIcpSwapUsdPrices({
        [LEDGER_CANISTER_ID.toText()]: 123,
      });

      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: 123,
        [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      });
    });

    it("should set the price of ckBTC to 99_000 USD", () => {
      setIcpSwapUsdPrices({
        [CKBTC_LEDGER_CANISTER_ID.toText()]: 99_000,
      });

      expect(get(icpSwapUsdPricesStore)).toEqual({
        [CKBTC_LEDGER_CANISTER_ID.toText()]: 99_000,
        [LEDGER_CANISTER_ID.toText()]: 10,
        [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      });
    });

    it("should set the price of ckBTC to 99_000 USD and ICP to 123 USD", () => {
      setIcpSwapUsdPrices({
        [CKBTC_LEDGER_CANISTER_ID.toText()]: 99_000,
        [LEDGER_CANISTER_ID.toText()]: 123,
      });

      expect(get(icpSwapUsdPricesStore)).toEqual({
        [CKBTC_LEDGER_CANISTER_ID.toText()]: 99_000,
        [LEDGER_CANISTER_ID.toText()]: 123,
        [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      });
    });
  });

  describe("setIcpPrice", () => {
    it("should set the price of ICP to 123 USD", () => {
      setIcpPrice(123);

      expect(get(icpSwapUsdPricesStore)).toEqual({
        [LEDGER_CANISTER_ID.toText()]: 123,
        [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      });
    });
  });
});
