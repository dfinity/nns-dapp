import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import {
  createAscendingComparator,
  createDescendingComparator,
  getCellGridAreaName,
  mergeComparators,
  sortTableData,
} from "$lib/utils/responsive-table.utils";

describe("responsive-table.utils", () => {
  describe("getCellGridAreaName", () => {
    it("should return a different name for different index", () => {
      expect(getCellGridAreaName(0)).toBe("cell-0");
      expect(getCellGridAreaName(1)).toBe("cell-1");
      expect(getCellGridAreaName(7)).toBe("cell-7");
    });
  });

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

  describe("sortTableData", () => {
    it("should sort based on list of comparators", () => {
      type TestRowData = { a: number; b: number; domKey: string };

      const item1 = { a: 10, b: 10, domKey: "1" };
      const item2 = { a: 10, b: 20, domKey: "2" };
      const item3 = { a: 20, b: 10, domKey: "3" };
      const item4 = { a: 20, b: 20, domKey: "4" };
      const comparatorA = createAscendingComparator(({ a }) => a);
      const comparatorB = createAscendingComparator(({ b }) => b);

      const columnDefaults: ResponsiveTableColumn<TestRowData> = {
        title: "Title",
        alignment: "left",
        templateColumns: ["1fr"],
      };

      const columns: ResponsiveTableColumn<TestRowData>[] = [
        {
          ...columnDefaults,
          id: "a",
          comparator: comparatorA,
        },
        {
          ...columnDefaults,
          id: "b",
          comparator: comparatorB,
        },
      ];

      expect(
        sortTableData({
          tableData: [item3, item1, item4, item2],
          order: [{ columnId: "a" }, { columnId: "b" }],
          columns,
        })
      ).toEqual([item1, item2, item3, item4]);
      expect(
        sortTableData({
          tableData: [item4, item3, item2, item1],
          order: [{ columnId: "a" }, { columnId: "b" }],
          columns,
        })
      ).toEqual([item1, item2, item3, item4]);
      expect(
        sortTableData({
          tableData: [item1, item2, item3, item4],
          order: [{ columnId: "a" }, { columnId: "b" }],
          columns,
        })
      ).toEqual([item1, item2, item3, item4]);
      expect(
        sortTableData({
          tableData: [item1, item2, item3, item4],
          order: [{ columnId: "b" }, { columnId: "a" }],
          columns,
        })
      ).toEqual([item1, item3, item2, item4]);
    });
  });
});
