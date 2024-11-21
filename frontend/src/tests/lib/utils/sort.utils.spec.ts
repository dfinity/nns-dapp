import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
  negate,
} from "$lib/utils/sort.utils";

describe("sort.utils", () => {
  describe("createDescendingComparator", () => {
    it("should return a comparator that sorts in descending order", () => {
      const item1 = { value: 10 };
      const item2 = { value: 20 };
      const comparator = createDescendingComparator(({ value }) => value);
      expect(comparator(item1, item2)).toBe(1);
      expect(comparator(item2, item1)).toBe(-1);
      expect(comparator(item1, item1)).toBe(0);
    });
  });

  describe("createAscendingComparator", () => {
    it("should return a comparator that sorts in ascending order", () => {
      const item1 = { value: 10 };
      const item2 = { value: 20 };
      const comparator = createAscendingComparator(({ value }) => value);
      expect(comparator(item1, item2)).toBe(-1);
      expect(comparator(item2, item1)).toBe(1);
      expect(comparator(item1, item1)).toBe(0);
    });
  });

  describe("mergeComparators", () => {
    it("should create a lexicographic comparator", () => {
      const item1 = { a: 10, b: 10 };
      const item2 = { a: 10, b: 20 };
      const item3 = { a: 20, b: 10 };
      const item4 = { a: 20, b: 20 };
      const comparatorA = createAscendingComparator(({ a }) => a);
      const comparatorB = createAscendingComparator(({ b }) => b);
      const comparator = mergeComparators([comparatorA, comparatorB]);
      expect(comparator(item1, item2)).toBe(-1);
      expect(comparator(item2, item1)).toBe(1);
      expect(comparator(item2, item3)).toBe(-1);
      expect(comparator(item3, item2)).toBe(1);
      expect(comparator(item3, item4)).toBe(-1);
      expect(comparator(item4, item3)).toBe(1);
    });
  });

  describe("negate", () => {
    it("should negate the result of a comparator", () => {
      const ascendingComparator = (a: number, b: number) => a - b;
      const negatedComparator = negate(ascendingComparator);

      expect(ascendingComparator(1, 2)).toBe(-1);
      expect(negatedComparator(1, 2)).toBe(1);

      expect(ascendingComparator(2, 1)).toBe(1);
      expect(negatedComparator(2, 1)).toBe(-1);

      expect(ascendingComparator(1, 1)).toBe(0);
      expect(negatedComparator(1, 1)).toBe(0);
    });

    it("should avoid returning -0", () => {
      const alwaysZeroComparator = () => 0;
      const negatedComparator = negate(alwaysZeroComparator);

      expect(Object.is(negatedComparator(1, 2), -0)).toBe(false);
      expect(negatedComparator(1, 2)).toBe(0);
    });
  });
});
