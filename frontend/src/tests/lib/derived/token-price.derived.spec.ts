import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { tokenPriceStore } from "$lib/derived/token-price.derived";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("token-price.derived", () => {
  const snsRootCanisterIdText = "aax3a-h4aaa-aaaaa-qaahq-cai";
  const snsLedgerCanisterIdText = "c2lt4-zmaaa-aaaaa-qaaiq-cai";
  const snsToken = {
    ...mockSnsToken,
    symbol: "SNS1",
  };

  const mockTokensByLedgerCanisterId = {
    [LEDGER_CANISTER_ID.toText()]: {
      name: "Internet Computer",
      symbol: "ICP",
      decimals: 8,
      fee: 10_000n,
    },
    [CKUSDC_LEDGER_CANISTER_ID.toText()]: mockCkUSDCToken,
    [snsLedgerCanisterIdText]: snsToken,
  };

  const mockIcpTokenAmountV2 = TokenAmountV2.fromUlps({
    amount: 100_000_000n, // 1 ICP
    token: ICPToken,
  });

  describe("tokenPriceStore", () => {
    beforeEach(() => {
      Object.entries(mockTokensByLedgerCanisterId).forEach(
        ([canisterId, token]) => {
          tokensStore.setToken({
            canisterId: Principal.fromText(canisterId),
            token,
            certified: true,
          });
        }
      );
    });

    it("should return undefined when icpSwapUsdPricesStore is undefined", () => {
      icpSwapTickersStore.set([]);

      const store = tokenPriceStore(mockIcpTokenAmountV2);
      expect(get(store)).toBeUndefined();
    });

    it("should return undefined when icpSwapUsdPricesStore is 'error'", () => {
      icpSwapTickersStore.set("error");

      const store = tokenPriceStore(mockIcpTokenAmountV2);
      expect(get(store)).toBeUndefined();
    });

    it("should return undefined when ledger canister ID is not found", () => {
      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: "12.4",
      };
      icpSwapTickersStore.set([ckusdcTicker]);

      const unknownTokenAmount = TokenAmountV2.fromUlps({
        amount: 100_000_000n,
        token: { name: "Unknown", symbol: "UNK", decimals: 8 },
      });

      const store = tokenPriceStore(unknownTokenAmount);
      expect(get(store)).toBeUndefined();
    });

    it("should return ICP price for ICP token", () => {
      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: "12.4",
      };
      icpSwapTickersStore.set([ckusdcTicker]);

      const store = tokenPriceStore(mockIcpTokenAmountV2);
      expect(get(store)).toBe(12.4);
    });

    it("should return ckUSDC price for ckUSDC token", () => {
      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: "12.4",
      };
      icpSwapTickersStore.set([ckusdcTicker]);

      const ckusdcTokenAmount = TokenAmountV2.fromUlps({
        amount: 100_000_000n,
        token: mockCkUSDCToken,
      });

      const store = tokenPriceStore(ckusdcTokenAmount);
      expect(get(store)).toBe(1.0);
    });

    it("should return SNS token price when available", () => {
      setSnsProjects([
        {
          rootCanisterId: Principal.fromText(snsRootCanisterIdText),
          ledgerCanisterId: Principal.fromText(snsLedgerCanisterIdText),
          tokenMetadata: snsToken,
        },
      ]);

      const ckusdcTicker = {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
        last_price: "12.4",
      };
      const snsTicker = {
        ...mockIcpSwapTicker,
        base_id: snsLedgerCanisterIdText,
        last_price: "0.1",
      };
      icpSwapTickersStore.set([ckusdcTicker, snsTicker]);

      const snsTokenAmount = TokenAmountV2.fromUlps({
        amount: 100_000_000n,
        token: snsToken,
      });

      const store = tokenPriceStore(snsTokenAmount);
      expect(get(store)).toBe(124.0); // 12.4 / 0.1
    });
  });
});
