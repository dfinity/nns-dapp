import { queryAndUpdate } from "$lib/services/utils.services";
import * as devUtils from "$lib/utils/dev.utils";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { tick } from "svelte";

describe("api-utils", () => {
  describe("queryAndUpdate", () => {
    describe("not logged in user", () => {
      beforeEach(() => {
        vi.clearAllMocks();
        setNoIdentity();
      });

      it("should raise error if another strategy than 'query' is passed", async () => {
        const testResponse = "test";
        const request = vi
          .fn()
          .mockImplementation(() => Promise.resolve(testResponse));
        const onLoad = vi.fn();
        const onError = vi.fn();

        const call = () =>
          queryAndUpdate<number, unknown>({
            request,
            onLoad,
            onError,
            identityType: "current",
            strategy: "query_and_update",
          });

        expect(call).rejects.toThrowError();
      });
    });

    describe("logged in user", () => {
      beforeEach(() => {
        vi.clearAllMocks();
        resetIdentity();
      });
      it("should request twice", async () => {
        const request = vi
          .fn()
          .mockImplementation(() => Promise.resolve({ certified: true }));
        const onLoad = vi.fn();
        const onError = vi.fn();

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
        const request = vi
          .fn()
          .mockImplementation(() => Promise.resolve({ certified: true }));
        const onLoad = vi.fn();
        const onError = vi.fn();

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
        const request = vi
          .fn()
          .mockImplementation(({ certified }: { certified: boolean }) => {
            requestCertified.push(certified);
            return Promise.resolve();
          });
        const onLoad = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
        });

        expect(requestCertified.sort()).toEqual([false, true]);
      });

      it('should support "query" strategy', async () => {
        const requestCertified: boolean[] = [];
        const request = vi
          .fn()
          .mockImplementation(({ certified }: { certified: boolean }) => {
            requestCertified.push(certified);
            return Promise.resolve();
          });
        const onLoad = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          strategy: "query",
        });

        expect(requestCertified.sort()).toEqual([false]);
      });

      it('should support "update" strategy', async () => {
        const requestCertified: boolean[] = [];
        const request = vi
          .fn()
          .mockImplementation(({ certified }: { certified: boolean }) => {
            requestCertified.push(certified);
            return Promise.resolve();
          });
        const onLoad = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          strategy: "update",
        });

        expect(requestCertified.sort()).toEqual([true]);
      });

      it("should catch errors", async () => {
        const request = vi
          .fn()
          .mockImplementation(() => Promise.reject("test"));
        const onLoad = vi.fn();
        const onError = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          onError,
        });

        expect(onLoad).not.toBeCalled();
        expect(onError).toBeCalledTimes(2);
        expect(onError).toBeCalledWith({
          certified: false,
          error: "test",
          identity: mockIdentity,
        });
      });

      it("should not call QUERY onLoad when UPDATE comes first", async () => {
        let queryDone = false;
        const request = vi
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
        const onLoad = vi.fn();
        const onError = vi.fn();

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
        const request = vi
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
        const onLoad = vi.fn();

        expect(updateDone).toBe(false);
        expect(queryDone).toBe(false);
        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
        });
        expect(updateDone).toBeTruthy();
        expect(queryDone).toBe(false);
      });

      it("should log", async () => {
        const log = vi.spyOn(devUtils, "logWithTimestamp");
        const request = vi.fn().mockImplementation(() => Promise.resolve());
        const onLoad = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          logMessage: "test-log",
        });

        expect(log).toBeCalled();
      });
    });
  });
});
