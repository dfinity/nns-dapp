/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/ckbtc-tokens.services";
import { tokensStore } from "$lib/stores/tokens.store";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCkBTCToken } from "../../mocks/ckbtc-accounts.mock";

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

      await services.loadCkBTCToken({});

      await waitFor(() =>
        expect(spyGetToken).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
        })
      );

      const storeData = get(ckBTCTokenStore);
      expect(storeData).toEqual({
        token: mockCkBTCToken,
        certified: true,
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

      await services.loadCkBTCToken({});

      expect(spyGetToken).not.toBeCalled();
    });
  });
});
