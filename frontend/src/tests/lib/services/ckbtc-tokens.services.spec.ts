import * as ledgerApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-tokens.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { get } from "svelte/store";

vi.mock("$lib/api/wallet-ledger.api");

describe("ckbtc-tokens-services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
  });

  describe("loadCkBTCTokens", () => {
    const mockCkTestBTCToken = {
      ...mockCkBTCToken,
      symbol: "ckTESTBTC",
    };
    beforeEach(() => {
      tokensStore.reset();
      vi.spyOn(ledgerApi, "getToken").mockImplementation(
        async ({ canisterId }) => {
          if (canisterId.toText() === CKBTC_UNIVERSE_CANISTER_ID.toText()) {
            return mockCkBTCToken;
          } else {
            return mockCkTestBTCToken;
          }
        }
      );
    });

    describe("no ckBTC enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      });

      it("should not load the ckBTC related tokens", async () => {
        await services.loadCkBTCTokens();

        expect(
          get(tokensStore)[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]
        ).toBeUndefined();
        expect(
          get(tokensStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()]
        ).toBeUndefined();
      });
    });

    describe("CKBTC enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      });

      it("should load the ckBTC token", async () => {
        await services.loadCkBTCTokens();

        expect(
          get(tokensStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()]?.token
        ).toEqual(mockCkBTCToken);
        expect(
          get(tokensStore)[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]
        ).toBeUndefined();
      });
    });

    describe("CKBTCTest enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      });

      it("should load the ckTESTBTC token", async () => {
        await services.loadCkBTCTokens();

        expect(
          get(tokensStore)[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]?.token
        ).toEqual(mockCkTestBTCToken);
        expect(
          get(tokensStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()]
        ).toBeUndefined();
      });
    });

    describe("both ckbtc enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      });

      it("should load both ckBTC tokes", async () => {
        await services.loadCkBTCTokens();

        expect(
          get(tokensStore)[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]?.token
        ).toEqual(mockCkTestBTCToken);
        expect(
          get(tokensStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()]?.token
        ).toEqual(mockCkBTCToken);
      });
    });
  });
});
