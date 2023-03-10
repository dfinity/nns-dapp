/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/ckbtc-tokens.services";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ckbtc-tokens-services", () => {
  describe("loadCkBTCTokens", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    afterEach(() => jest.clearAllMocks());

    it("should load token in the store", async () => {
      const spyGetToken = jest
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

  describe("already loaded", () => {
    beforeEach(() => {
      tokensStore.setToken({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        token: mockCkBTCToken,
        certified: true,
      });
    });

    afterEach(() => jest.clearAllMocks());

    it("should not reload token if already loaded", async () => {
      const spyGetToken = jest
        .spyOn(ledgerApi, "getCkBTCToken")
        .mockResolvedValue(mockCkBTCToken);

      await services.loadCkBTCToken({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      expect(spyGetToken).not.toBeCalled();
    });
  });
});
