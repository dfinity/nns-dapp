import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/ckbtc-tokens.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/ckbtc-ledger.api");

describe("ckbtc-tokens-services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
  });

  describe("loadCkBTCToken", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    it("should load token in the store", async () => {
      const spyGetToken = vi
        .spyOn(ledgerApi, "getCkBTCToken")
        .mockResolvedValue(mockCkBTCToken);

      await services.loadCkBTCToken({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      await waitFor(() =>
        expect(spyGetToken).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        })
      );

      const storeData = get(ckBTCTokenStore);

      const token = {
        token: mockCkBTCToken,
        certified: true,
      };

      expect(storeData).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: token,
      });
    });
  });

  describe("loadCkBTCToken already loaded", () => {
    beforeEach(() => {
      tokensStore.setToken({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        token: mockCkBTCToken,
        certified: true,
      });
    });

    it("should not reload token if already loaded", async () => {
      const spyGetToken = vi
        .spyOn(ledgerApi, "getCkBTCToken")
        .mockResolvedValue(mockCkBTCToken);

      await services.loadCkBTCToken({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      expect(spyGetToken).not.toBeCalled();
    });
  });

  describe("loadCkBTCTokens", () => {
    const mockCkTestBTCToken = {
      ...mockCkBTCToken,
      symbol: "ckTESTBTC",
    };
    beforeEach(() => {
      tokensStore.reset();
      vi.spyOn(ledgerApi, "getCkBTCToken").mockImplementation(
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

      it("should load the ckTESTBTC token if enabled", async () => {
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

      it("should load the ckBTC token if enabled", async () => {
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

      it("should load the ckTESTBTC token if enabled", async () => {
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

      it("should load the ckTESTBTC token if enabled", async () => {
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
