import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
  ResponsiveTableRowData,
} from "$lib/types/responsive-table";
import { createAscendingComparator } from "$lib/utils/sort.utils";
import TestTableAgeCell from "$tests/lib/components/ui/TestTableAgeCell.svelte";
import TestTableNameCell from "$tests/lib/components/ui/TestTableNameCell.svelte";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { nonNullish } from "@dfinity/utils";

describe("ResponsiveTable", () => {
  type TestRowData = {
    domKey: string;
    rowHref?: string;
    name: string;
    age: number;
  };

  const columns: ResponsiveTableColumn<TestRowData>[] = [
    {
      id: "name",
      title: "Name",
      cellComponent: TestTableNameCell,
      alignment: "left",
      templateColumns: ["1fr", "max-content"],
      comparator: createAscendingComparator((rowData) => rowData.name),
    },
    {
      // Column without cellComponent, to create a gap in the grid.
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      id: "age",
      title: "Age",
      cellComponent: TestTableAgeCell,
      alignment: "left",
      templateColumns: ["1fr"],
      comparator: createAscendingComparator((rowData) => rowData.age),
    },
    {
      title: "Actions",
      // Normally each column would have a different cell component but for
      // testing we reuse the name cell component.
      cellComponent: TestTableNameCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];

  const tableData = [
    {
      rowHref: "alice/",
      domKey: "1",
      name: "Alice",
      age: 45,
    },
    {
      rowHref: "anya/",
      domKey: "2",
      name: "Anya",
      age: 19,
    },
    {
      domKey: "3",
      name: "Anton",
      age: 31,
    },
  ];

  beforeEach(() => {
    // Clicking on the rows that are links causes JSDOM to output an error about
    // navigation not being implemented. But the error is not logged immediately
    // and can happen during a different test. So we dissable error logging for
    // all tests.
    vi.spyOn(console, "error").mockImplementation((arg) => {
      expect(arg).toMatch(/Error: Not implemented: navigation/);
    });
  });

  interface RenderComponentProps {
    testId?: string;
    tableData: ResponsiveTableRowData[];
    columns: ResponsiveTableColumn<TestRowData>[];
    order?: ResponsiveTableOrder;
    gridRowsPerTableRow?: number;
    getRowStyle?: (rowData: ResponsiveTableRowData) => string;
  }

  const renderComponent = ({
    onNnsAction = null,
    ...props
  }: RenderComponentProps & {
    onNnsAction?: ({ detail }: { detail: unknown }) => void;
  }) => {
    const { container } = render(ResponsiveTable, {
      props,
      events: {
        ...(nonNullish(onNnsAction) && {
          onNnsAction: ({ detail }) => {
            onNnsAction({ detail });
          },
        }),
      },
    });

    return ResponsiveTablePo.under(new JestPageObjectElement(container));
  };

  it("should render desktop column headers", async () => {
    const po = renderComponent({ columns, tableData });
    // The last column is reserved for actions and is never rendered with a
    // header.
    expect(await po.getDesktopColumnHeaders()).toEqual(["Name", "", "Age", ""]);
  });

  it("should render mobile column headers", async () => {
    const po = renderComponent({ columns, tableData });
    // The last column is reserved for actions and is never rendered with a
    // header.
    expect(await po.getMobileColumnHeaders()).toEqual(["Name", ""]);
  });

  it("should render column header alignments", async () => {
    const po = renderComponent({ columns, tableData });
    expect(await po.getColumnHeaderAlignments()).toEqual([
      "desktop-align-left", // Name
      expect.any(String), // gap
      "desktop-align-left", // Age
      "desktop-align-right", // Actions
    ]);
  });

  it("should render column header alignments when first column is not sortable", async () => {
    const po = renderComponent({
      columns: [
        {
          ...columns[0],
          comparator: undefined,
        },
        ...columns.slice(1),
      ],
      tableData,
    });
    expect(await po.getColumnHeaderAlignments()).toEqual([
      "desktop-align-left", // Name
      expect.any(String), // gap
      "desktop-align-left", // Age
      "desktop-align-right", // Actions
    ]);
  });

  it("should render row data", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    // The label is repeated in the cell for columns that aren't the first or
    // the last column. They are hidden on desktop and shown on mobile.
    expect(await rows[0].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
    expect(await rows[2].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
  });

  it("should render row href", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getHref()).toBe("alice/");
    expect(await rows[1].getHref()).toBe("anya/");
    expect(await rows[2].getHref()).toBe(null);
  });

  it("should render rows with href as link", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getTagName()).toBe("A");
    expect(await rows[1].getTagName()).toBe("A");
    expect(await rows[2].getTagName()).toBe("DIV");
  });

  it("should dispatch nnsAction, only for click on non-link row", async () => {
    const onNnsAction = vi.fn();
    const po = renderComponent({ columns, tableData, onNnsAction });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);

    expect(onNnsAction).not.toBeCalled();
    await rows[0].click();
    expect(onNnsAction).not.toBeCalled();
    await rows[1].click();
    expect(onNnsAction).not.toBeCalled();
    await rows[2].click();
    expect(onNnsAction).toBeCalledTimes(1);
    expect(onNnsAction).toBeCalledWith({ detail: { rowData: tableData[2] } });
  });

  it("should render classes based on column alignment", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(await rows[0].getCellAlignments()).toEqual([
      "desktop-align-left", // Name
      expect.any(String), // gap
      "desktop-align-left", // Age
      "desktop-align-right", // Actions
    ]);
  });

  it("should apply row style", async () => {
    const po = renderComponent({
      columns,
      tableData,
      getRowStyle: (rowData) =>
        rowData.rowHref ? "color: black;" : "color: grey;",
    });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(tableData[0].rowHref).toBeDefined();
    expect(await rows[0].getStyle()).toBe("color: black;");
    expect(tableData[1].rowHref).toBeDefined();
    expect(await rows[1].getStyle()).toBe("color: black;");
    expect(tableData[2].rowHref).toBeUndefined();
    expect(await rows[2].getStyle()).toBe("color: grey;");
  });

  it("should not set empty style attribute", async () => {
    const po = renderComponent({
      columns,
      tableData,
      getRowStyle: (_) => undefined,
    });
    const rows = await po.getRows();
    expect(await rows[0].getStyle()).toBeNull();
  });

  it("should sort rows based on name", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "name" }],
    });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);

    expect(await rows[0].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
  });

  it("should sort rows based on age", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "age" }],
    });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);

    expect(await rows[0].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
  });

  it("should sort rows based clicked column", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "name" }],
    });
    await po.clickColumnHeader("Age");

    let rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);

    await po.clickColumnHeader("Name");
    rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
  });

  it("should reverse sort order when same column is clicked again", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "name" }],
    });
    await po.clickColumnHeader("Age");

    let rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);

    await po.clickColumnHeader("Age");
    rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
    expect(await rows[2].getCells()).toEqual(["Anya", "", "Age 19", "Anya"]);
  });

  it("should show arrow on sorted column", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "name" }],
    });
    expect(await po.getColumnHeaderWithArrow()).toBe("Name");

    await po.clickColumnHeader("Age");
    expect(await po.getColumnHeaderWithArrow()).toBe("Age");

    await po.clickColumnHeader("Age");
    expect(await po.getColumnHeaderWithArrow()).toBe("Age reversed");
  });

  it("should have mobile sorting modal", async () => {
    const po = renderComponent({
      columns,
      tableData,
      order: [{ columnId: "name" }],
    });
    expect(await po.getOpenSortModalButtonPo().isPresent()).toBe(true);
    const sortModal = po.getResponsiveTableSortModalPo();
    expect(await sortModal.isPresent()).toBe(false);
    await po.openSortModal();
    expect(await sortModal.isPresent()).toBe(true);
    expect(await sortModal.getOptionWithArrow()).toBe("Name");
    await sortModal.clickOption("Age");
    await sortModal.waitForClosed();
    await po.openSortModal();
    expect(await sortModal.getOptionWithArrow()).toBe("Age");
  });

  it("should not have a sorting button if no columns are sortable", async () => {
    const po = renderComponent({
      columns: columns.map((column) => ({
        ...column,
        comparator: undefined,
      })),
      tableData,
    });
    expect(await po.getOpenSortModalButtonPo().isPresent()).toBe(false);
  });

  it("should render column styles depending on the number of columns", async () => {
    // 4 columns
    const po1 = renderComponent({ columns, tableData });
    expect(await po1.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr max-content", // Name
        "1fr", // gap
        "1fr", // Age
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po1.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-1 cell-1"'
    );

    // 8 columns
    const po2 = renderComponent({
      columns: [...columns, ...columns],
      tableData,
    });
    expect(await po2.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr max-content", // Name
        "1fr", // gap
        "1fr", // Age
        "max-content", // Actions
        "1fr max-content", // Name
        "1fr", // gap
        "1fr", // Age
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po2.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-1 cell-1" "cell-2 cell-2" "cell-3 cell-3" "cell-5 cell-5"'
    );
  });

  it("should have a different grid area for cells in different columns", async () => {
    // 8 columns
    const po = renderComponent({
      columns: [...columns, ...columns],
      tableData,
    });

    // The first and last cell have grid areas set in CSS directly rather than
    // through the style attribute.
    const expectedStyles = [
      "--desktop-column-span: 2;--mobile-template-columns: 1fr max-content;",
      "--desktop-column-span: 1;--mobile-template-columns: 1fr;--grid-area-name: cell-0;",
      "--desktop-column-span: 1;--mobile-template-columns: 1fr;--grid-area-name: cell-1;",
      "--desktop-column-span: 1;--mobile-template-columns: max-content;--grid-area-name: cell-2;",
      "--desktop-column-span: 2;--mobile-template-columns: 1fr max-content;--grid-area-name: cell-3;",
      "--desktop-column-span: 1;--mobile-template-columns: 1fr;--grid-area-name: cell-4;",
      "--desktop-column-span: 1;--mobile-template-columns: 1fr;--grid-area-name: cell-5;",
      "--desktop-column-span: 1;--mobile-template-columns: max-content;",
    ];

    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCellStyles()).toEqual(expectedStyles);
  });
});
