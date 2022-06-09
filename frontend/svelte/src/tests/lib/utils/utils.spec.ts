import {
  bytesToHexString,
  createChunks,
  debounce,
  isDefined,
  isHash,
  isNullable,
  nonNullable,
  stringifyJson,
  uniqueObjects,
} from "../../../lib/utils/utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";

describe("utils", () => {
  const callback = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
  });

  it("should debounce function with timeout", () => {
    const testDebounce = debounce(callback, 100);

    testDebounce();
    testDebounce();
    testDebounce();

    expect(setTimeout).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
  });

  it("should debounce one function call", () => {
    debounce(callback)();

    expect(callback).not.toBeCalled();

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should debounce multiple functions call", () => {
    const anotherCallback = jest.fn();

    const test = debounce(anotherCallback);
    test();
    test();
    test();

    jest.runAllTimers();

    expect(anotherCallback).toBeCalled();
    expect(anotherCallback).toHaveBeenCalledTimes(1);
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
      expect(isDefined(undefined)).toBeFalsy();
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

  describe("bytesToHexString", () => {
    it("converts bytes to string", () => {
      expect(bytesToHexString([])).toBe("");
      expect(bytesToHexString([0])).toBe("00");
      expect(bytesToHexString([1])).toBe("01");
      expect(bytesToHexString([15])).toBe("0f");
      expect(bytesToHexString([255])).toBe("ff");
      expect(bytesToHexString([1, 255, 3, 0])).toBe("01ff0300");
    });
  });

  describe("isNullable", () => {
    it("should determine nullable", () => {
      expect(isNullable(null)).toBeTruthy();
      expect(isNullable(undefined)).toBeTruthy();
      expect(isNullable(0)).toBeFalsy();
      expect(isNullable(1)).toBeFalsy();
      expect(isNullable("")).toBeFalsy();
      expect(isNullable([])).toBeFalsy();
    });
  });

  describe("nonNullable", () => {
    it("should determine nullable", () => {
      expect(nonNullable(null)).toBeFalsy();
      expect(nonNullable(undefined)).toBeFalsy();
      expect(nonNullable(0)).toBeTruthy();
      expect(nonNullable(1)).toBeTruthy();
      expect(nonNullable("")).toBeTruthy();
      expect(nonNullable([])).toBeTruthy();
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
});
