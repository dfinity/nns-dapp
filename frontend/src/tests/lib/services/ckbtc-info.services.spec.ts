/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-info.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ckbtc-info-services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ckBTCInfoStore.reset();
  });

  describe("loadCkBTCInfo", () => {
    it("should load info in the store", async () => {
      const spyGetMinterInfo = jest
        .spyOn(minterApi, "minterInfo")
        .mockResolvedValue(mockCkBTCMinterInfo);

      await services.loadCkBTCInfo({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      await waitFor(() =>
        expect(spyGetMinterInfo).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        })
      );

      const storeData = get(ckBTCInfoStore);

      const info = {
        info: mockCkBTCMinterInfo,
        certified: true,
      };

      expect(storeData).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: info,
      });
    });
  });

  describe("already loaded", () => {
    beforeEach(() => {
      ckBTCInfoStore.setInfo({
        info: mockCkBTCMinterInfo,
        certified: true,
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });
    });

    afterEach(() => jest.clearAllMocks());

    it("should not reload info if already loaded", async () => {
      const spyGetMinterInfo = jest
        .spyOn(minterApi, "minterInfo")
        .mockResolvedValue(mockCkBTCMinterInfo);

      await services.loadCkBTCInfo({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      expect(spyGetMinterInfo).not.toBeCalled();
    });
  });
});
