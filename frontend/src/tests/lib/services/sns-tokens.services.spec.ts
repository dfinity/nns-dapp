/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-tokens.services";
import { tokensStore } from "$lib/stores/tokens.store";
import { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsToken } from "../../mocks/sns-projects.mock";

describe("sns-tokens-services", () => {
  describe("loadSnsTokens", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    afterEach(() => jest.clearAllMocks());

    it("should load token in the store", async () => {
      const spyGetToken = jest
        .spyOn(ledgerApi, "getSnsToken")
        .mockResolvedValue(mockSnsToken);

      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");

      await services.loadSnsToken({
        rootCanisterId,
      });

      await waitFor(() =>
        expect(spyGetToken).toBeCalledWith({
          identity: mockIdentity,
          rootCanisterId,
          certified: true,
        })
      );

      const storeData = get(tokensStore);
      expect(storeData[rootCanisterId.toText()]).toEqual({
        token: mockSnsToken,
        certified: true,
      });
    });
  });

  describe("already loaded", () => {
    const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");

    beforeEach(() => {
      tokensStore.setToken({
        canisterId: rootCanisterId,
        token: mockSnsToken,
        certified: true,
      });
    });

    afterEach(() => jest.clearAllMocks());

    it("should not reload token if already loaded", async () => {
      const spyGetToken = jest
        .spyOn(ledgerApi, "getSnsToken")
        .mockResolvedValue(mockSnsToken);

      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");

      await services.loadSnsToken({
        rootCanisterId,
      });

      expect(spyGetToken).not.toBeCalled();
    });
  });
});
