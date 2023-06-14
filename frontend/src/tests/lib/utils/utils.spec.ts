import {
  bytesToHexString,
  cancelPoll,
  createChunks,
  expandObject,
  hexStringToBytes,
  isDefined,
  isHash,
  isPngAsset,
  poll,
  PollingCancelledError,
  PollingLimitExceededError,
  removeKeys,
  smallerVersion,
  stringifyJson,
  uniqueObjects,
} from "$lib/utils/utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";

describe("utils", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    toastsStore.reset();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("stringifyJson", () => {
    const SAMPLE = { a: 0, b: [1, 2], c: "c" };

    it("should stringify standard JSON", () => {
      expect(stringifyJson(SAMPLE)).toBe(JSON.stringify(SAMPLE));
    });

    it("should stringify JSON with bigint", () => {
      expect(stringifyJson({ a: BigInt(123) })).toBe(
        JSON.stringify({ a: "123" })
      );
    });

    it("should support the indentation", () => {
      expect(stringifyJson(SAMPLE, { indentation: 2 })).toBe(
        JSON.stringify(SAMPLE, null, 2)
      );
    });

    it("should convert bigints to function call in devMode", () => {
      expect(
        stringifyJson(
          { value: BigInt("123456789012345678901234567890") },
          { devMode: true }
        )
      ).toBe(`{"value":"BigInt('123456789012345678901234567890')"}`);
    });

    it("should render principal as hash", () => {
      expect(stringifyJson({ principal: mockPrincipal })).toBe(
        `{"principal":"${mockPrincipal.toString()}"}`
      );
    });

    it("should not call toString() for Principal alike objects", () => {
      expect(stringifyJson({ _isPrincipal: true })).toBe(
        `{"_isPrincipal":true}`
      );
    });
  });

  describe("uniqueObjects", () => {
    it("should return only unique object", () => {
      expect(
        uniqueObjects([
          { a: 1, b: 2 },
          { a: 1, b: 2 },
        ])
      ).toEqual([{ a: 1, b: 2 }]);
    });
    expect(
      uniqueObjects([
        { a: 1, b: 2 },
        { a: 1, B: 2 },
      ])
    ).toEqual([
      { a: 1, b: 2 },
      { a: 1, B: 2 },
    ]);
    expect(
      uniqueObjects([
        { a: 1, b: { c: "d" } },
        { a: 1, B: { c: "d" } },
      ])
    ).toEqual([
      { a: 1, b: { c: "d" } },
      { a: 1, B: { c: "d" } },
    ]);
    expect(uniqueObjects([1, 2, 3, 1, 2, 3])).toEqual([1, 2, 3]);
    expect(uniqueObjects([])).toEqual([]);
  });

  describe("isDefined", () => {
    it("should return true if not undefined", () => {
      expect(isDefined(true)).toBeTruthy();
      expect(isDefined(1)).toBeTruthy();
      expect(isDefined("")).toBeTruthy();
      expect(isDefined(null)).toBeTruthy();
    });

    it("should return false if undefined", () => {
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe("createChunks", () => {
    it("create chunks of elements", () => {
      const twenty = new Array(20).fill(1);
      expect(createChunks(twenty).length).toBe(2);
      expect(createChunks(twenty)[0].length).toBe(10);
      expect(createChunks(twenty, 7).length).toBe(3);
      expect(createChunks(twenty, 7)[0].length).toBe(7);
      expect(createChunks(twenty, 7)[1].length).toBe(7);
      expect(createChunks(twenty, 7)[2].length).toBe(6);
      expect(createChunks(twenty)[0].length).toBe(10);
      expect(createChunks(twenty, 5).length).toBe(4);
      expect(createChunks(twenty, 5)[0].length).toBe(5);
      expect(createChunks(twenty, 1).length).toBe(twenty.length);
      expect(createChunks(twenty, 1)[0].length).toBe(1);
    });
  });

  describe("bytesToHexString and hexStringToBytes", () => {
    it("converts bytes to string and back", () => {
      expect(hexStringToBytes(bytesToHexString([]))).toEqual([]);
      expect(hexStringToBytes(bytesToHexString([0]))).toEqual([0]);
      expect(hexStringToBytes(bytesToHexString([1]))).toEqual([1]);
      expect(hexStringToBytes(bytesToHexString([15]))).toEqual([15]);
      expect(hexStringToBytes(bytesToHexString([255]))).toEqual([255]);
      expect(hexStringToBytes(bytesToHexString([1, 255, 3, 0]))).toEqual([
        1, 255, 3, 0,
      ]);
    });
  });

  describe("isHash", () => {
    const bytes = (specialValue: unknown = undefined) => {
      const res = Array(32).fill(0);
      if (specialValue !== undefined) {
        res[1] = specialValue;
      }
      return res as number[];
    };

    it("should identify similar to hash arrays", () => {
      expect(isHash(bytes())).toBe(true);
      expect(isHash(bytes(255))).toBe(true);
      expect(isHash([])).toBe(false);
      expect(isHash(bytes().slice(1))).toBe(false);
    });

    it("should identify not byte values", () => {
      expect(isHash(bytes(-1))).toBe(false);
      expect(isHash(bytes(null))).toBe(false);
      expect(isHash(bytes(256))).toBe(false);
      expect(isHash(bytes(1.5))).toBe(false);
      expect(isHash(bytes(""))).toBe(false);
      expect(isHash(bytes(NaN))).toBe(false);
      expect(isHash(bytes(Infinity))).toBe(false);
    });
  });

  describe("smallerVersion", () => {
    it("returns true if current version is smaller than min version", () => {
      expect(
        smallerVersion({
          minVersion: "1.0",
          currentVersion: "0.0.9",
        })
      ).toBe(true);
      expect(
        smallerVersion({
          minVersion: "2.0.0",
          currentVersion: "1.9.9",
        })
      ).toBe(true);
      expect(
        smallerVersion({
          minVersion: "2.1.5",
          currentVersion: "2.1.4",
        })
      ).toBe(true);
      expect(
        smallerVersion({
          minVersion: "2.1.5",
          currentVersion: "1.8.9",
        })
      ).toBe(true);
      expect(
        smallerVersion({
          minVersion: "2",
          currentVersion: "1",
        })
      ).toBe(true);
    });
    it("returns false if current version is bigger than min version", () => {
      expect(
        smallerVersion({
          minVersion: "0.0.9",
          currentVersion: "1.0",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "1.9.9",
          currentVersion: "2.0.0",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "2.1.4",
          currentVersion: "2.1.5",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "1.8.9",
          currentVersion: "2.1.5",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "1",
          currentVersion: "2",
        })
      ).toBe(false);
    });
    it("returns false if current version is same as min version", () => {
      expect(
        smallerVersion({
          minVersion: "1",
          currentVersion: "1.0",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "2",
          currentVersion: "2.0.0",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "2.1.4",
          currentVersion: "2.1.4",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "1.0.0",
          currentVersion: "1",
        })
      ).toBe(false);
      expect(
        smallerVersion({
          minVersion: "13.4.5",
          currentVersion: "13.4.5",
        })
      ).toBe(false);
    });
  });

  describe("poll", () => {
    describe("without timers", () => {
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(global, "setTimeout").mockImplementation((cb: any) => cb());
        // Avoid to print errors during test
        jest.spyOn(console, "log").mockImplementation(() => undefined);
      });

      it("should recall the function until `fn` succeeds", async () => {
        const maxCalls = 3;
        let calls = 0;
        await poll({
          fn: async () => {
            calls += 1;
            if (calls < maxCalls) {
              throw new Error();
            }
            return calls;
          },
          shouldExit: () => false,
        });
        expect(calls).toBe(maxCalls);
      });

      it("should recall the function until `shouldExit` is true", async () => {
        const maxCalls = 3;
        let calls = 0;
        const pollCall = () =>
          poll({
            fn: async () => {
              calls += 1;
              throw new Error("fn failed");
            },
            shouldExit: () => calls >= maxCalls,
          });
        await expect(pollCall).rejects.toThrow("fn failed");
        expect(calls).toBe(maxCalls);
      });

      it("should return the value of `fn` when it doesn't throw", async () => {
        const result = 10;
        const expected = await poll({
          fn: async () => result,
          shouldExit: () => false,
        });
        expect(expected).toBe(result);
      });

      it("should throw when `shouldExit` returns true", async () => {
        const result = 10;
        const expected = await poll({
          fn: async () => result,
          shouldExit: () => true,
        });
        expect(expected).toBe(result);
      });

      it("should throw after `maxAttempts`", async () => {
        let counter = 0;
        const maxAttempts = 5;
        const call = () =>
          poll({
            fn: async () => {
              counter += 1;
              throw new Error();
            },
            shouldExit: () => false,
            maxAttempts,
          });
        // Without the `await`, the line didn't wait the `poll` to throw to
        // move to the next line
        await expect(call).rejects.toThrowError(PollingLimitExceededError);
        expect(counter).toBe(maxAttempts);
      });
    });

    describe("with fake timers", () => {
      const highLoadToast = [
        {
          level: "error",
          text: `${en.error.high_load_retrying}`,
        },
      ];

      beforeEach(() => {
        jest.useFakeTimers();
      });

      const getTimestamps = async ({
        maxAttempts,
        millisecondsToWait,
        useExponentialBackoff,
      }: {
        maxAttempts: number;
        millisecondsToWait?: number;
        useExponentialBackoff: boolean;
      }): Promise<number[]> => {
        const t0 = Date.now();
        const timestamps = [];

        poll({
          fn: async () => {
            timestamps.push(Date.now() - t0);
            throw new Error();
          },
          shouldExit: () => false,
          maxAttempts,
          millisecondsToWait,
          useExponentialBackoff,
        }).catch((err) => {
          expect(err).toBeInstanceOf(PollingLimitExceededError);
        });

        for (let i = 1; i <= maxAttempts - 1; i++) {
          expect(timestamps.length).toEqual(i);
          await advanceTime();
        }
        expect(timestamps.length).toEqual(maxAttempts);
        return timestamps;
      };

      it("should have a default wait time of 500ms", async () => {
        expect(
          await getTimestamps({
            maxAttempts: 2,
            useExponentialBackoff: false,
          })
        ).toEqual([0, 500]);
      });

      it("should wait the same amount between calls", async () => {
        expect(
          await getTimestamps({
            maxAttempts: 5,
            millisecondsToWait: 1000,
            useExponentialBackoff: false,
          })
        ).toEqual([0, 1000, 2000, 3000, 4000]);
      });

      it("should do exponential backoff", async () => {
        expect(
          await getTimestamps({
            maxAttempts: 5,
            millisecondsToWait: 1000,
            useExponentialBackoff: true,
          })
        ).toEqual([0, 1000, 3000, 7000, 15000]);
      });

      it("should not wait after the last failure", async () => {
        const t0 = Date.now();
        const timestamps = await getTimestamps({
          maxAttempts: 5,
          millisecondsToWait: 1000,
          useExponentialBackoff: false,
        });
        const totalTimePassed = Date.now() - t0;
        const timeOfLastCall = timestamps[timestamps.length - 1];
        expect(totalTimePassed).toEqual(timeOfLastCall);
      });

      it("should show 'high load' message after ~1 minute", async () => {
        let calls = 0;
        const failuresBeforeHighLoadMessage = 3;
        const _ = poll({
          fn: async () => {
            calls += 1;
            throw new Error();
          },
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          failuresBeforeHighLoadMessage,
        });
        expect(calls).toEqual(1);
        await advanceTime();
        expect(calls).toBeLessThan(failuresBeforeHighLoadMessage);
        expect(get(toastsStore)).toEqual([]);
        await advanceTime();
        expect(calls).toBeGreaterThanOrEqual(failuresBeforeHighLoadMessage);
        expect(get(toastsStore)).toMatchObject(highLoadToast);
      });

      it("should hide 'high load' message after success", async () => {
        const failuresBeforeHighLoadMessage = 3;
        let shouldFail = true;
        const _ = poll({
          fn: async () => {
            if (shouldFail) {
              throw new Error();
            }
          },
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          failuresBeforeHighLoadMessage,
        });
        await advanceTime();
        await advanceTime();
        await advanceTime();
        expect(get(toastsStore)).toMatchObject(highLoadToast);
        shouldFail = false;
        await advanceTime();
        expect(get(toastsStore)).toEqual([]);
      });

      it("should hide 'high load' message after cancel", async () => {
        const pollId = Symbol();
        const failuresBeforeHighLoadMessage = 3;
        const _ = poll({
          fn: async () => {
            throw new Error();
          },
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          failuresBeforeHighLoadMessage,
          pollId,
        }).catch((err) => {
          expect(err).toBeInstanceOf(PollingCancelledError);
        });
        await advanceTime();
        await advanceTime();
        await advanceTime();
        expect(get(toastsStore)).toMatchObject(highLoadToast);
        cancelPoll(pollId);
        await runResolvedPromises();
        expect(get(toastsStore)).toEqual([]);
      });

      it("should show 'high load' message only once", async () => {
        const _ = poll({
          fn: async () => {
            throw new Error();
          },
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          failuresBeforeHighLoadMessage: 3,
        });
        expect(get(toastsStore)).toEqual([]);
        await advanceTime();
        await advanceTime();
        await advanceTime();
        expect(get(toastsStore)).toMatchObject(highLoadToast);
        await advanceTime();
        await advanceTime();
        await advanceTime();
        // Still only 1 toast.
        expect(get(toastsStore)).toMatchObject(highLoadToast);
      });

      it("should stop polling when cancelled during wait", async () => {
        const pollId = Symbol();
        const fnSpy = jest.fn();
        fnSpy.mockRejectedValue(new Error("failing"));
        let cancelled = false;
        poll({
          fn: fnSpy,
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          pollId,
        })
          .then(() => {
            throw new Error("This shouldn't happen");
          })
          .catch((err) => {
            expect(err).toBeInstanceOf(PollingCancelledError);
            cancelled = true;
          });
        expect(fnSpy).toBeCalledTimes(1);
        await advanceTime();
        expect(fnSpy).toBeCalledTimes(2);
        expect(cancelled).toBe(false);
        cancelPoll(pollId);
        await advanceTime();
        expect(cancelled).toBe(true);
        // No further calls after cancel.
        expect(fnSpy).toBeCalledTimes(2);
      });

      it("should stop polling when cancelled during call", async () => {
        const pollId = Symbol();
        const fnSpy = jest.fn();
        fnSpy.mockReturnValue(
          new Promise(() => {
            //never resolve
          })
        );
        let cancelled = false;
        poll({
          fn: fnSpy,
          shouldExit: () => false,
          maxAttempts: 10,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          pollId,
        })
          .then(() => {
            throw new Error("This shouldn't happen");
          })
          .catch((err) => {
            expect(err).toBeInstanceOf(PollingCancelledError);
            cancelled = true;
          });
        expect(fnSpy).toBeCalledTimes(1);
        await advanceTime();
        expect(cancelled).toBe(false);
        cancelPoll(pollId);
        await advanceTime();
        expect(cancelled).toBe(true);
        // No further calls after cancel.
        expect(fnSpy).toBeCalledTimes(1);
      });

      it("should throw PollingCancelledError when canceled during the last attempt", async () => {
        const maxAttempts = 2;
        const pollId = Symbol();
        const fnSpy = jest.fn();
        let rejectCall: () => void;
        fnSpy.mockImplementation(
          () =>
            new Promise((resolve, reject) => {
              rejectCall = reject;
            })
        );
        let cancelled = false;
        poll({
          fn: fnSpy,
          shouldExit: () => false,
          maxAttempts,
          millisecondsToWait: 20 * 1000,
          useExponentialBackoff: false,
          pollId,
        })
          .then(() => {
            throw new Error("This shouldn't happen");
          })
          .catch((err) => {
            expect(err).toBeInstanceOf(PollingCancelledError);
            cancelled = true;
          });
        rejectCall();
        await advanceTime();
        expect(fnSpy).toBeCalledTimes(maxAttempts);
        expect(cancelled).toBe(false);
        cancelPoll(pollId);
        await advanceTime();
        expect(cancelled).toBe(true);
      });

      it("should cancel immediately when called again while polling", async () => {
        const pollId = Symbol();
        const fnSpy = jest.fn();
        let resolvePromise;
        fnSpy.mockReturnValue(
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );

        const callPoll = () =>
          poll({
            fn: fnSpy,
            shouldExit: () => false,
            maxAttempts: 10,
            millisecondsToWait: 20 * 1000,
            useExponentialBackoff: false,
            pollId,
          });

        const pollPromise = callPoll();
        expect(callPoll).rejects.toThrowError(PollingCancelledError);

        const expectedPollResult = "foo";
        resolvePromise(expectedPollResult);
        expect(await pollPromise).toEqual(expectedPollResult);
      });

      it("should work when called again after success", async () => {
        const pollId = Symbol();
        const fnSpy = jest.fn();

        const expectedResult1 = "foo";
        const expectedResult2 = "bar";

        fnSpy
          .mockResolvedValueOnce(expectedResult1)
          .mockResolvedValueOnce(expectedResult2);

        const callPoll = () =>
          poll({
            fn: fnSpy,
            shouldExit: () => false,
            maxAttempts: 10,
            millisecondsToWait: 20 * 1000,
            useExponentialBackoff: false,
            pollId,
          });

        expect(await callPoll()).toEqual(expectedResult1);
        expect(await callPoll()).toEqual(expectedResult2);
      });

      it("should work when called again after cancel", async () => {
        const pollId = Symbol();
        const fnSpy = jest.fn();

        const expectedResult2 = "baz";

        fnSpy
          .mockReturnValueOnce(
            new Promise(() => {
              // never resolve
            })
          )
          .mockResolvedValueOnce(expectedResult2);

        const callPoll = () =>
          poll({
            fn: fnSpy,
            shouldExit: () => false,
            maxAttempts: 10,
            millisecondsToWait: 20 * 1000,
            useExponentialBackoff: false,
            pollId,
          });

        let canceled = false;
        callPoll().catch((err) => {
          expect(err).toBeInstanceOf(PollingCancelledError);
          canceled = true;
        });
        await advanceTime();
        expect(canceled).toBe(false);
        cancelPoll(pollId);
        await advanceTime();
        expect(canceled).toBe(true);
        expect(await callPoll()).toEqual(expectedResult2);
      });

      it("should cancel only the polling with the correct id", async () => {
        const pollId1 = Symbol();
        const pollId2 = Symbol();
        const fnSpy = jest.fn();

        fnSpy.mockReturnValue(
          new Promise(() => {
            // never resolve
          })
        );

        const callPoll = (id) =>
          poll({
            fn: fnSpy,
            shouldExit: () => false,
            maxAttempts: 10,
            millisecondsToWait: 20 * 1000,
            useExponentialBackoff: false,
            pollId: id,
          });

        let canceled1 = false;
        let canceled2 = false;

        callPoll(pollId1).catch((err) => {
          expect(err).toBeInstanceOf(PollingCancelledError);
          canceled1 = true;
        });

        callPoll(pollId2).catch((err) => {
          expect(err).toBeInstanceOf(PollingCancelledError);
          canceled2 = true;
        });

        await advanceTime();
        expect(canceled1).toBe(false);
        expect(canceled2).toBe(false);
        cancelPoll(pollId2);
        await advanceTime();
        expect(canceled1).toBe(false);
        expect(canceled2).toBe(true);
      });
    });
  });

  describe("removeKeys", () => {
    it("removes the keys passed", () => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
      };
      const expected = {
        a: 1,
        c: 3,
      };
      expect(removeKeys({ obj, keysToRemove: ["b"] })).toEqual(expected);
      expect(
        Object.keys(removeKeys({ obj, keysToRemove: ["b", "a", "c"] })).length
      ).toBe(0);
    });

    it("should ignore keys that are not present", () => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
      };
      const expected = {
        a: 1,
        c: 3,
      };
      expect(removeKeys({ obj, keysToRemove: ["b", "d"] })).toEqual(expected);
    });
  });

  describe("isPngAsset", () => {
    it("returns true for png assets", () => {
      const png1 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==";
      const png2 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcasdfafdaCklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==";
      const pngFile = "file.png";
      expect(isPngAsset(png1)).toBe(true);
      expect(isPngAsset(png2)).toBe(true);
      expect(isPngAsset(pngFile)).toBe(true);
    });

    it("returns false for non png assets", () => {
      const svg1 =
        "data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==";
      const jpg1 =
        "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==";
      const pngFake =
        "data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcasdfafdaCklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5Edata:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcasdfafdaCklEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==";
      const svgFile = "file.svg";
      expect(isPngAsset(svg1)).toBe(false);
      expect(isPngAsset(jpg1)).toBe(false);
      expect(isPngAsset(pngFake)).toBe(false);
      expect(isPngAsset(svgFile)).toBe(false);
    });
  });

  describe("expandObject", () => {
    it("should not do anything in strings that are not JSON", () => {
      const obj = { a: "a string" };
      expect(expandObject(obj)).toEqual(obj);
    });

    it("should parse JSON strings", () => {
      const obj = { a: JSON.stringify({ b: "c" }) };
      expect(expandObject(obj)).toEqual({ a: { b: "c" } });
    });
  });
});
