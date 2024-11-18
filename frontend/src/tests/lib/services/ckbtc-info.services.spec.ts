import * as minterApi from "$lib/api/ckbtc-minter.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_MINTER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import * as authServices from "$lib/services/auth.services";
import * as services from "$lib/services/ckbtc-info.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import {
  mockGetIdentity,
  mockIdentity,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { toastsStore } from "@dfinity/gix-components";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ckbtc-info-services", () => {
  beforeEach(() => {
    ckBTCInfoStore.reset();
    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
  });

  describe("loadCkBTCInfo", () => {
    let spyGetMinterInfo;

    beforeEach(() => {
      spyGetMinterInfo = vi
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

    it("should reset univers and show toast on error", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const errorMessage = "Error message";
      spyGetMinterInfo = vi
        .spyOn(minterApi, "minterInfo")
        .mockRejectedValue(new Error(errorMessage));

      ckBTCInfoStore.setInfo({
        info: mockCkBTCMinterInfo,
        certified: false,
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(get(ckBTCInfoStore)).not.toEqual({});
      expect(get(toastsStore)).toEqual([]);

      await services.loadCkBTCInfo({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(get(ckBTCInfoStore)).toEqual({});
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: `Sorry, there was an error loading the ckBTC minter information. ${errorMessage}`,
      });
    });

    it("should not reset univers or show toast on uncertified error", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const errorMessage = "Error message";
      spyGetMinterInfo = vi
        .spyOn(minterApi, "minterInfo")
        .mockImplementation(async ({ certified }) => {
          if (!certified) {
            throw new Error(errorMessage);
          }
          return mockCkBTCMinterInfo;
        });

      ckBTCInfoStore.setInfo({
        info: mockCkBTCMinterInfo,
        certified: false,
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(get(ckBTCInfoStore)).not.toEqual({});
      expect(get(toastsStore)).toEqual([]);

      await services.loadCkBTCInfo({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(get(ckBTCInfoStore)).not.toEqual({});
      expect(get(toastsStore)).toEqual([]);
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

    it("should not reload info if already loaded", async () => {
      const spyGetMinterInfo = vi
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
