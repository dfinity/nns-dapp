import {
  createChunks,
  debounce,
  isDefined,
  stringifyJson,
  uniqueObjects,
} from "../../../lib/utils/utils";

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
    debounce(callback);

    expect(callback).not.toBeCalled();

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should debounce multiple functions call", () => {
    debounce(callback);
    debounce(callback);
    debounce(callback);

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback).toHaveBeenCalledTimes(1);
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
});
