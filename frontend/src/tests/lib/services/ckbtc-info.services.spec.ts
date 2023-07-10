import * as minterApi from "$lib/api/ckbtc-minter.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_MINTER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-info.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { vi } from "vitest";

describe("ckbtc-info-services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ckBTCInfoStore.reset();
  });

  describe("loadCkBTCInfo", () => {
    let spyGetMinterInfo;

    beforeEach(() => {
      spyGetMinterInfo = jest
        .spyOn(minterApi, "minterInfo")
        .mockResolvedValue(mockCkBTCMinterInfo);
    });

    it("should load info in the store", async () => {
      await services.loadCkBTCInfo({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyGetMinterInfo).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          canisterId: CKBTC_MINTER_CANISTER_ID,
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

    it("should not call api if no universe is provided", async () => {
      await services.loadCkBTCInfo({
        universeId: undefined,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(spyGetMinterInfo).not.toBeCalled();
    });

    it("should not call api if universe is not ckBTC", async () => {
      await services.loadCkBTCInfo({
        universeId: OWN_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(spyGetMinterInfo).not.toBeCalled();
    });

    it("should not call api if minter canister ID is not provided", async () => {
      await services.loadCkBTCInfo({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: undefined,
      });

      expect(spyGetMinterInfo).not.toBeCalled();
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

    afterEach(() => vi.clearAllMocks());

    it("should not reload info if already loaded", async () => {
      const spyGetMinterInfo = jest
        .spyOn(minterApi, "minterInfo")
        .mockResolvedValue(mockCkBTCMinterInfo);

      await services.loadCkBTCInfo({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(spyGetMinterInfo).not.toBeCalled();
    });
  });
});
