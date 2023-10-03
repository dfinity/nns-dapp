/**
 * @jest-environment jsdom
 */

import * as saleApi from "$lib/api/sns-sale.api";
import { loadSnsFinalizationStatus } from "$lib/services/sns-finalization.services";
import {
  getOrCreateSnsFinalizationStatusStore,
  resetSnsFinalizationStatusStore,
} from "$lib/stores/sns-finalization-status.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { snsFinalizationStatusResponseMock } from "$tests/mocks/sns-finalization-status.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("sns-finalization-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("loadSnsFinalizationStatus", () => {
    const rootCanisterId = principal(0);
    afterEach(() => {
      jest.clearAllMocks();
      resetSnsFinalizationStatusStore();
    });

    it("should call api.queryFinalizationStatus and load finalization status in store", async () => {
      const spyQuery = jest
        .spyOn(saleApi, "queryFinalizationStatus")
        .mockResolvedValue(snsFinalizationStatusResponseMock);

      await loadSnsFinalizationStatus(rootCanisterId);

      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
      expect(get(store)).toEqual({
        data: snsFinalizationStatusResponseMock,
        certified: false,
      });
      expect(spyQuery).toBeCalled();
    });

    it("should call api.queryFinalizationStatus but not load finalization status in store if response is `undefined`", async () => {
      const spyQuery = jest
        .spyOn(saleApi, "queryFinalizationStatus")
        .mockResolvedValue(undefined);

      await loadSnsFinalizationStatus(rootCanisterId);

      const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
      expect(get(store)).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });
});
