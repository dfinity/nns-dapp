import { debounce, stringifyJson } from "../../../lib/utils/utils";

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
      expect(stringifyJson({ value: SAMPLE })).toBe(
        JSON.stringify(SAMPLE, null, 2)
      );
    });

    it("should stringify JSON with bigint", () => {
      expect(stringifyJson({ value: { a: BigInt(123) } })).toBe(
        JSON.stringify({ a: "123" }, null, 2)
      );
    });

    it("should support the indentation", () => {
      expect(stringifyJson({ value: SAMPLE, indentation: 0 })).toBe(
        JSON.stringify(SAMPLE)
      );
    });
  });
});
