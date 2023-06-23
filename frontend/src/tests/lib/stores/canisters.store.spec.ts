/**
 * @jest-environment jsdom
 */

import * as canistersApi from "$lib/api/canisters.api";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import {
  getOrCreateFullCanistersStore,
  resetCanistersStoresCacheForTesting,
} from "$lib/stores/canisters.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisters } from "$tests/mocks/canisters.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/canisters.api");

describe("canisters-store", () => {
  blockAllCallsTo(["$lib/api/canisters.api"]);

  beforeEach(() => {
    resetCanistersStoresCacheForTesting();
    jest.clearAllMocks();
  });

  describe("canistersStore", () => {
    it("should load canisters from api", async () => {
      jest
        .spyOn(canistersApi, "queryCanisters")
        .mockResolvedValue(mockCanisters);
      const canistersStore = getOrCreateFullCanistersStore(mockIdentity);

      let canisters = undefined;
      canistersStore.subscribe((storeData) => {
        if (storeData !== NOT_LOADED && !(storeData instanceof Error)) {
          canisters = storeData.canisters;
        }
      });

      expect(canisters).toBeUndefined();
      await runResolvedPromises();

      // Update + query call
      expect(canistersApi.queryCanisters).toBeCalledTimes(2);

      expect(canisters).toEqual(mockCanisters);
    });

    it("should load once for two calls for same identity", async () => {
      jest
        .spyOn(canistersApi, "queryCanisters")
        .mockResolvedValue(mockCanisters);
      const canistersStore = getOrCreateFullCanistersStore(mockIdentity);

      let canisters;
      canistersStore.subscribe((storeData) => {
        if (storeData !== NOT_LOADED && !(storeData instanceof Error)) {
          canisters = storeData.canisters;
        }
      });

      await waitFor(() => expect(canisters).toEqual(mockCanisters));

      // Update + query call
      expect(canistersApi.queryCanisters).toBeCalledTimes(2);

      const canistersStore2 = getOrCreateFullCanistersStore(mockIdentity);

      let canisters2;
      canistersStore2.subscribe((storeData) => {
        if (storeData !== NOT_LOADED && !(storeData instanceof Error)) {
          canisters2 = storeData.canisters;
        }
      });

      expect(canisters2).toEqual(mockCanisters);

      expect(canistersApi.queryCanisters).toBeCalledTimes(2);
    });

    it("should set canisters", async () => {
      jest.spyOn(canistersApi, "queryCanisters").mockResolvedValue([]);
      const canistersStore = getOrCreateFullCanistersStore(mockIdentity);

      let canisters;
      canistersStore.subscribe((storeData) => {
        if (storeData !== NOT_LOADED && !(storeData instanceof Error)) {
          canisters = storeData.canisters;
        }
      });

      await waitFor(() => expect(canisters).toEqual([]));

      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });

      expect(canisters).toEqual(mockCanisters);
    });

    it("should reset canisters", async () => {
      jest.spyOn(canistersApi, "queryCanisters").mockResolvedValue([]);
      const canistersStore = getOrCreateFullCanistersStore(mockIdentity);

      let canisters;
      canistersStore.subscribe((storeData) => {
        if (storeData !== NOT_LOADED && !(storeData instanceof Error)) {
          canisters = storeData.canisters;
        }
      });

      await waitFor(() => expect(canisters).toEqual([]));

      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });
      canistersStore.setCanisters({ canisters: undefined, certified: true });

      expect(canisters).toBeUndefined();
    });
  });
});
