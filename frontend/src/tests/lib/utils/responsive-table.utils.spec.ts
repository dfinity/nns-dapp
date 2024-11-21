import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import {
  getCellGridAreaName,
  selectPrimaryOrder,
  sortTableData,
} from "$lib/utils/responsive-table.utils";
import { createAscendingComparator } from "$lib/utils/sort.utils";

describe("responsive-table.utils", () => {
  describe("getCellGridAreaName", () => {
    it("should return a different name for different index", () => {
      expect(getCellGridAreaName(0)).toBe("cell-0");
      expect(getCellGridAreaName(1)).toBe("cell-1");
      expect(getCellGridAreaName(7)).toBe("cell-7");
    });
  });

  describe("selectPrimaryOrder", () => {
    it("should add a new order to the front", () => {
      expect(
        selectPrimaryOrder({
          order: [{ columnId: "a" }],
          selectedColumnId: "b",
        })
      ).toEqual([{ columnId: "b" }, { columnId: "a" }]);
    });

    it("should move an exist order to the front", () => {
      expect(
        selectPrimaryOrder({
          order: [{ columnId: "a" }, { columnId: "b" }, { columnId: "c" }],
          selectedColumnId: "b",
        })
      ).toEqual([{ columnId: "b" }, { columnId: "a" }, { columnId: "c" }]);
    });

    it("should reverse an existing primary order", () => {
      expect(
        selectPrimaryOrder({
          order: [{ columnId: "a" }, { columnId: "b" }],
          selectedColumnId: "a",
        })
      ).toEqual([{ columnId: "a", reversed: true }, { columnId: "b" }]);
    });

    it("should un-reverse an existing primary order", () => {
      expect(
        selectPrimaryOrder({
          order: [{ columnId: "a", reversed: true }, { columnId: "b" }],
          selectedColumnId: "a",
        })
      ).toEqual([{ columnId: "a" }, { columnId: "b" }]);
    });

    it("should keep an existing order reversed as it becomes secondary", () => {
      expect(
        selectPrimaryOrder({
          order: [{ columnId: "a", reversed: true }, { columnId: "b" }],
          selectedColumnId: "b",
        })
      ).toEqual([{ columnId: "b" }, { columnId: "a", reversed: true }]);
    });

    it("should not keep an existing order reversed as it becomes primary", () => {
      expect(
        selectPrimaryOrder({
          order: [
            { columnId: "a", reversed: true },
            { columnId: "b", reversed: true },
          ],
          selectedColumnId: "b",
        })
      ).toEqual([{ columnId: "b" }, { columnId: "a", reversed: true }]);
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
      expect(
        sortTableData({
          tableData: [item1, item2, item3, item4],
          order: [{ columnId: "a", reversed: true }, { columnId: "b" }],
          columns,
        })
      ).toEqual([item3, item4, item1, item2]);
      expect(
        sortTableData({
          tableData: [item1, item2, item3, item4],
          order: [{ columnId: "a" }, { columnId: "b", reversed: true }],
          columns,
        })
      ).toEqual([item2, item1, item4, item3]);
    });
  });
});
