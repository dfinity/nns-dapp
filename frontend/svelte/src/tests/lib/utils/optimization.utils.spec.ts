import { memoize } from "../../../lib/utils/optimization.utils";

describe("optimization.utils", () => {
  describe("memoize()", () => {
    let mockFn;
    let memoMockFn;

    beforeEach(() => {
      mockFn = jest.fn((...args) => args.reduce((map, x) => map + x * x, 0));
      memoMockFn = memoize(mockFn);
    });

    it("should return the correct values", () => {
      expect(memoMockFn(2)).toBe(4);
    });

    it("should not recall with same arguments", () => {
      expect(memoMockFn(2)).toBe(4);
      memoMockFn(2);
      expect(mockFn.mock.calls.length).toBe(1);
    });

    it("should work w/o arguments", () => {
      expect(memoMockFn()).toBe(0);
      memoMockFn();
      expect(mockFn.mock.calls.length).toBe(1);
    });

    it("should support multiple arguments", () => {
      expect(memoMockFn(1, 2)).toBe(5);
      memoMockFn(1, 2);
      expect(mockFn.mock.calls.length).toBe(1);
    });
  });
});
