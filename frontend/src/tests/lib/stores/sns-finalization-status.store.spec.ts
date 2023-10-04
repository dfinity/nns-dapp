import {
  createIsSnsFinalizingStore,
  getOrCreateSnsFinalizationStatusStore,
  resetSnsFinalizationStatusStore,
} from "$lib/stores/sns-finalization-status.store";
import {
  createFinalizationStatusMock,
  snsFinalizationStatusResponseMock,
} from "$tests/mocks/sns-finalization-status.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { SnsGetAutoFinalizationStatusResponse } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns finalization status stores", () => {
  const rootCanisterId = principal(0);
  const rootCanisterId2 = principal(1);
  beforeEach(() => {
    resetSnsFinalizationStatusStore();
  });

  describe("getOrCreateSnsFinalizationStatusStore", () => {
    it("set finalization data", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);

      store.setData({
        data: snsFinalizationStatusResponseMock,
        certified: true,
      });

      expect(get(store).data).toEqual(snsFinalizationStatusResponseMock);

      const anotherResponse = {
        ...snsFinalizationStatusResponseMock,
        has_auto_finalize_been_attempted: [true] as [boolean],
      };

      store.setData({
        data: anotherResponse,
        certified: true,
      });

      expect(get(store).data).toEqual(anotherResponse);
    });

    it("caches stores", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);

      const store2 = getOrCreateSnsFinalizationStatusStore(rootCanisterId);

      expect(store).toBe(store2);
    });

    it("creates stores per rootCansiterId", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);

      const store2 = getOrCreateSnsFinalizationStatusStore(rootCanisterId2);

      expect(store).not.toBe(store2);

      store.setData({
        data: snsFinalizationStatusResponseMock,
        certified: true,
      });

      expect(get(store).data).toEqual(snsFinalizationStatusResponseMock);

      const anotherResponse = {
        ...snsFinalizationStatusResponseMock,
        has_auto_finalize_been_attempted: [true] as [boolean],
      };

      store2.setData({
        data: anotherResponse,
        certified: true,
      });

      expect(get(store2).data).toEqual(anotherResponse);
    });
  });

  describe("createIsSnsFinalizingStore", () => {
    it("returns true if finalizing", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
      const finalizingResponse = createFinalizationStatusMock(true);

      store.setData({
        data: finalizingResponse,
        certified: true,
      });

      const isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);

      expect(get(isFinalizingStore)).toBe(true);
    });

    it("returns false if the store not set", () => {
      const isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);

      expect(get(isFinalizingStore)).toBe(false);
    });

    it("returns false if not finalizing because not attempted", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
      const finalizingResponse: SnsGetAutoFinalizationStatusResponse = {
        is_auto_finalize_enabled: [true],
        auto_finalize_swap_response: [],
        has_auto_finalize_been_attempted: [false],
      };

      store.setData({
        data: finalizingResponse,
        certified: true,
      });

      const isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);

      expect(get(isFinalizingStore)).toBe(false);
    });

    it("returns false if not finalizing because it finished", () => {
      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
      const finalizingResponse: SnsGetAutoFinalizationStatusResponse = {
        is_auto_finalize_enabled: [true],
        auto_finalize_swap_response: [
          {
            set_dapp_controllers_call_result: [],
            settle_community_fund_participation_result: [],
            error_message: [],
            set_mode_call_result: [],
            sweep_icp_result: [],
            claim_neuron_result: [],
            sweep_sns_result: [],
          },
        ],
        has_auto_finalize_been_attempted: [true],
      };

      store.setData({
        data: finalizingResponse,
        certified: true,
      });

      const isFinalizingStore = createIsSnsFinalizingStore(rootCanisterId);

      expect(get(isFinalizingStore)).toBe(false);
    });
  });
});
