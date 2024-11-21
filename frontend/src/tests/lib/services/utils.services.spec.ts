import { queryAndUpdate } from "$lib/services/utils.services";
import * as devUtils from "$lib/utils/dev.utils";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { tick } from "svelte";

describe("api-utils", () => {
  describe("queryAndUpdate", () => {
    describe("not logged in user", () => {
      beforeEach(() => {
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

      it("should use 'query' strategy by default", async () => {
        const testResponse = "test";
        const request = vi
          .fn()
          .mockImplementation(() => Promise.resolve(testResponse));
        const onLoad = vi.fn();
        const onError = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          onError,
          identityType: "current",
        });

        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad).toHaveBeenCalledWith({
          certified: false,
          strategy: "query",
          response: testResponse,
        });
      });
    });

    describe("logged in user", () => {
      beforeEach(() => {
        resetIdentity();
      });
      it("should request twice", async () => {
        const response = { certified: true };
        const request = vi
          .fn()
          .mockImplementation(() => Promise.resolve(response));
        const onLoad = vi.fn();
        const onError = vi.fn();

        await queryAndUpdate<number, unknown>({
          request,
          onLoad,
          onError,
        });

        expect(request).toHaveBeenCalledTimes(2);
        expect(onLoad).toHaveBeenCalledTimes(2);
        expect(onLoad).toHaveBeenCalledWith({
          certified: false,
          strategy: "query_and_update",
          response,
        });
        expect(onLoad).toHaveBeenCalledWith({
          certified: true,
          strategy: "query_and_update",
          response,
        });
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
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad).toHaveBeenCalledWith({
          certified: false,
          strategy: "query",
          response: undefined,
        });
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
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onLoad).toHaveBeenCalledWith({
          certified: true,
          strategy: "update",
          response: undefined,
        });
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
          strategy: "query_and_update",
          error: "test",
          identity: mockIdentity,
        });
        expect(onError).toBeCalledWith({
          certified: true,
          strategy: "query_and_update",
          error: "test",
          identity: mockIdentity,
        });
      });

      it("should not call QUERY onLoad when UPDATE comes first", async () => {
        let resolveUpdate: (value: unknown) => void;
        let resolveQuery: (value: unknown) => void;
        const request = vi
          .fn()
          .mockImplementation(({ certified }: { certified: boolean }) =>
            certified
              ? new Promise((resolve) => (resolveUpdate = resolve))
              : new Promise((resolve) => (resolveQuery = resolve))
          );
        const onLoad = vi.fn();
        const onError = vi.fn();

        queryAndUpdate<number, unknown>({
          request,
          onLoad,
          onError,
        });
        await runResolvedPromises();

        expect(request).toBeCalledTimes(2);
        expect(onLoad).toBeCalledTimes(0);
        expect(onError).toBeCalledTimes(0);

        resolveUpdate({ update: true });
        resolveQuery({ query: true });
        await runResolvedPromises();

        expect(onLoad).toBeCalledTimes(1);
        expect(onLoad).toBeCalledWith({
          certified: true,
          response: { update: true },
          strategy: "query_and_update",
        });
        expect(onError).toBeCalledTimes(0);
      });

      it("should ignore QUERY error when UPDATE comes first", async () => {
        let resolveUpdate: (value: unknown) => void;
        let rejectQuery: (value: unknown) => void;
        const request = vi
          .fn()
          .mockImplementation(({ certified }: { certified: boolean }) =>
            certified
              ? new Promise((resolve) => (resolveUpdate = resolve))
              : new Promise((_, reject) => (rejectQuery = reject))
          );
        const onLoad = vi.fn();
        const onError = vi.fn();

        queryAndUpdate<number, unknown>({
          request,
          onLoad,
          onError,
        });
        await runResolvedPromises();

        expect(request).toBeCalledTimes(2);
        expect(onLoad).toBeCalledTimes(0);
        expect(onError).toBeCalledTimes(0);

        resolveUpdate({});
        rejectQuery({});
        await runResolvedPromises();

        expect(onLoad).toBeCalledTimes(1);
        expect(onError).toBeCalledTimes(0);
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
