import { CACHE_EXPIRATION_MILLISECONDS } from "$lib/constants/cache.constants";
import {
  createCachedQueryAndUpdate,
  queryAndUpdate,
} from "$lib/services/utils.services";
import * as devUtils from "$lib/utils/dev.utils";
import { tick } from "svelte";

describe("api-utils", () => {
  describe("queryAndUpdate", () => {
    it("should request twice", async () => {
      const request = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ certified: true }));
      const onLoad = jest.fn();
      const onError = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        onError,
      });

      expect(request).toHaveBeenCalledTimes(2);
      expect(onLoad).toHaveBeenCalledTimes(2);
      expect(onError).not.toBeCalled();
    });

    it("should work w/o await call", async () => {
      const request = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ certified: true }));
      const onLoad = jest.fn();
      const onError = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        onError,
      });

      await tick();

      expect(request).toHaveBeenCalledTimes(2);
      expect(onLoad).toHaveBeenCalledTimes(2);
      expect(onError).not.toBeCalled();
    });

    it('should support "query_and_update" strategy', async () => {
      const requestCertified: boolean[] = [];
      const request = jest
        .fn()
        .mockImplementation(({ certified }: { certified: boolean }) => {
          requestCertified.push(certified);
          return Promise.resolve();
        });
      const onLoad = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
      });

      expect(requestCertified.sort()).toEqual([false, true]);
    });

    it('should support "query" strategy', async () => {
      const requestCertified: boolean[] = [];
      const request = jest
        .fn()
        .mockImplementation(({ certified }: { certified: boolean }) => {
          requestCertified.push(certified);
          return Promise.resolve();
        });
      const onLoad = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        strategy: "query",
      });

      expect(requestCertified.sort()).toEqual([false]);
    });

    it('should support "update" strategy', async () => {
      const requestCertified: boolean[] = [];
      const request = jest
        .fn()
        .mockImplementation(({ certified }: { certified: boolean }) => {
          requestCertified.push(certified);
          return Promise.resolve();
        });
      const onLoad = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        strategy: "update",
      });

      expect(requestCertified.sort()).toEqual([true]);
    });

    it("should catch errors", async () => {
      const request = jest
        .fn()
        .mockImplementation(() => Promise.reject("test"));
      const onLoad = jest.fn();
      const onError = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        onError,
      });

      expect(onLoad).not.toBeCalled();
      expect(onError).toBeCalledTimes(2);
      expect(onError).toBeCalledWith({ certified: false, error: "test" });
    });

    it("should not call QUERY onLoad when UPDATE comes first", async () => {
      let queryDone = false;
      const request = jest
        .fn()
        .mockImplementation(({ certified }: { certified: boolean }) =>
          certified
            ? Promise.resolve()
            : new Promise((resolve) =>
                setTimeout(() => {
                  queryDone = true;
                  resolve({});
                }, 1)
              )
        );
      const onLoad = jest.fn();
      const onError = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        onError,
      });
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(queryDone).toBe(true);
      expect(request).toBeCalledTimes(2);
      expect(onLoad).toBeCalledTimes(1);
      expect(onError).not.toBeCalled();
    });

    it("should resolve promise when the first response is done", async () => {
      let updateDone = false;
      let queryDone = false;
      const request = jest
        .fn()
        .mockImplementation(({ certified }: { certified: boolean }) =>
          certified
            ? new Promise((resolve) => {
                setTimeout(() => {
                  updateDone = true;
                  resolve({});
                }, 1);
              })
            : new Promise((resolve) => {
                setTimeout(() => {
                  queryDone = true;
                  resolve({});
                }, 100);
              })
        );
      const onLoad = jest.fn();

      expect(updateDone).toBeFalsy();
      expect(queryDone).toBeFalsy();
      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
      });
      expect(updateDone).toBeTruthy();
      expect(queryDone).toBeFalsy();
    });

    it("should log", async () => {
      const log = jest.spyOn(devUtils, "logWithTimestamp");
      const request = jest.fn().mockImplementation(() => Promise.resolve());
      const onLoad = jest.fn();

      await queryAndUpdate<number, unknown>({
        request,
        onLoad,
        logMessage: "test-log",
      });

      expect(log).toBeCalled();
    });
  });

  describe("createCachedQueryAndUpdate", () => {
    const request = jest.fn().mockResolvedValue("test");
    const onLoad = jest.fn();
    const onError = jest.fn();

    beforeEach(() => {
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });

    it("should call request twice", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      expect(request).toHaveBeenCalledTimes(2);
      expect(onLoad).toHaveBeenCalledTimes(2);
      expect(onError).not.toBeCalled();
    });

    it("should not request if cache not expired but call onLoad once", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      expect(request).toHaveBeenCalledTimes(2);
      expect(onLoad).toHaveBeenCalledTimes(2 + 1);
      expect(onError).not.toBeCalled();
    });

    it("should request if cache when cache expires", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      jest.advanceTimersByTime(CACHE_EXPIRATION_MILLISECONDS + 1);

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      expect(request).toHaveBeenCalledTimes(2 + 2);
      expect(onLoad).toHaveBeenCalledTimes(2 + 1 + 2);
      expect(onError).not.toBeCalled();
    });

    it("should not request if concurrent calls", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      await Promise.all([
        queryAndUpdateTest({
          request,
          onLoad,
          onError,
        }),
        queryAndUpdateTest({
          request,
          onLoad,
          onError,
        }),
      ]);

      expect(request).toHaveBeenCalledTimes(2);
      expect(onLoad).toHaveBeenCalledTimes(2 + 2);
      expect(onError).not.toBeCalled();
    });

    it("should request if cache is disabled", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });
      await tick();

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
        resetCache: true,
      });

      expect(request).toHaveBeenCalledTimes(2 + 2);
      expect(onLoad).toHaveBeenCalledTimes(2 + 1 + 2);
      expect(onError).not.toBeCalled();
    });

    it("should not use uncertified data for certified calls", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
        strategy: "query",
      });

      expect(request).toHaveBeenCalledTimes(1);
      expect(onLoad).toHaveBeenCalledTimes(1);

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
        strategy: "update",
      });

      expect(request).toHaveBeenCalledTimes(1 + 1);
      expect(onLoad).toHaveBeenCalledTimes(1 + 1);
      expect(onError).not.toBeCalled();
    });

    it("should use uncertified data for uncertified calls", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
        strategy: "query",
      });

      expect(request).toHaveBeenCalledTimes(1);
      expect(onLoad).toHaveBeenCalledTimes(1);

      await queryAndUpdateTest({
        request,
        onLoad,
        onError,
      });

      expect(request).toHaveBeenCalledTimes(1 + 2);
      // 1 - Call from first query strategy
      // 2 - With uncertified data from cache
      // 3 - With uncertified data from request
      // 4 - With certified data from request
      expect(onLoad).toHaveBeenCalledTimes(1 + 3);
      expect(onError).not.toBeCalled();
    });

    it("should handle error", async () => {
      const queryAndUpdateTest = createCachedQueryAndUpdate<string, unknown>();
      const rejectRequest = jest.fn().mockRejectedValue("error");
      await queryAndUpdateTest({
        request: rejectRequest,
        onLoad,
        onError,
      });

      expect(rejectRequest).toHaveBeenCalledTimes(2);
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(2);
    });
  });
});
