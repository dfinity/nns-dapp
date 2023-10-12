import * as saleApi from "$lib/api/sns-sale.api";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import { loadSnsFinalizationStatus } from "$lib/services/sns-finalization.services";
import {
  getOrCreateSnsFinalizationStatusStore,
  resetSnsFinalizationStatusStore,
} from "$lib/stores/sns-finalization-status.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { snsFinalizationStatusResponseMock } from "$tests/mocks/sns-finalization-status.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-finalization-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("loadSnsFinalizationStatus", () => {
    const rootCanisterId = principal(0);
    const now = Date.now();
    const nowInSeconds = Math.floor(now / 1000);
    const yesterdayInSeconds = nowInSeconds - SECONDS_IN_DAY;
    afterEach(() => {
      vi.useFakeTimers().setSystemTime(now);
      vi.clearAllMocks();
      resetSnsProjects();
      resetSnsFinalizationStatusStore();
    });

    describe("if swap finished less than a week ago", () => {
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Committed,
            swapDueTimestampSeconds: yesterdayInSeconds,
          },
        ]);
      });

      it("should call api.queryFinalizationStatus and load finalization status in store", async () => {
        vi.spyOn(saleApi, "queryFinalizationStatus").mockResolvedValue(
          snsFinalizationStatusResponseMock
        );

        expect(saleApi.queryFinalizationStatus).not.toBeCalled();
        await loadSnsFinalizationStatus({ rootCanisterId });

        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)).toEqual({
          data: snsFinalizationStatusResponseMock,
          certified: false,
        });
        expect(saleApi.queryFinalizationStatus).toBeCalled();
      });

      it("should call api.queryFinalizationStatus but not load finalization status in store if response is `undefined`", async () => {
        vi.spyOn(saleApi, "queryFinalizationStatus").mockResolvedValue(
          undefined
        );

        expect(saleApi.queryFinalizationStatus).not.toBeCalled();
        await loadSnsFinalizationStatus({ rootCanisterId });

        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)).toBeUndefined();
        expect(saleApi.queryFinalizationStatus).toBeCalled();
      });
    });

    describe("if swap is open", () => {
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Open,
          },
        ]);
      });

      it("should call not load finalization status in store nor call api", async () => {
        await loadSnsFinalizationStatus({ rootCanisterId });

        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)).toBeUndefined();
        expect(saleApi.queryFinalizationStatus).not.toBeCalled();
      });

      it("should call api.queryFinalizationStatus and load finalization status in store if forced to fetch", async () => {
        vi.spyOn(saleApi, "queryFinalizationStatus").mockResolvedValue(
          snsFinalizationStatusResponseMock
        );

        expect(saleApi.queryFinalizationStatus).not.toBeCalled();
        await loadSnsFinalizationStatus({ rootCanisterId, forceFetch: true });

        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)).toEqual({
          data: snsFinalizationStatusResponseMock,
          certified: false,
        });
        expect(saleApi.queryFinalizationStatus).toBeCalled();
      });
    });

    describe("if swap is committed more than a week ago", () => {
      beforeEach(() => {
        setSnsProjects([
          {
            rootCanisterId,
            lifecycle: SnsSwapLifecycle.Open,
            swapDueTimestampSeconds: nowInSeconds - SECONDS_IN_MONTH,
          },
        ]);
      });

      it("should call not load finalization status in store nor call api", async () => {
        await loadSnsFinalizationStatus({ rootCanisterId });

        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        expect(get(store)).toBeUndefined();
        expect(saleApi.queryFinalizationStatus).not.toBeCalled();
      });
    });
  });
});
