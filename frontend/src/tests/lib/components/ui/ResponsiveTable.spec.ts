import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
import TestTableAgeCell from "$tests/lib/components/ui/TestTableAgeCell.svelte";
import TestTableNameCell from "$tests/lib/components/ui/TestTableNameCell.svelte";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ResponseTable", () => {
  const columns = [
    {
      title: "Name",
      cellComponent: TestTableNameCell,
      alignment: "left",
      templateColumns: ["1fr", "max-content"],
    },
    {
      // Column without cellComponent, to create a gap in the grid.
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: "Age",
      cellComponent: TestTableAgeCell,
      alignment: "left",
      templateColumns: ["1fr"],
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
      rowHref: "anna/",
      domKey: "2",
      name: "Anna",
      age: 19,
    },
    {
      domKey: "3",
      name: "Anton",
      age: 31,
    },
  ];

  const renderComponent = (props) => {
    const { container } = render(ResponsiveTable, props);
    return ResponsiveTablePo.under(new JestPageObjectElement(container));
  };

  it("should render column headers", async () => {
    const po = renderComponent({ columns, tableData });
    // The last column is reserved for actions and is never rendered with a
    // header.
    expect(await po.getColumnHeaders()).toEqual(["Name", "", "Age", ""]);
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

  it("should render row data", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    // The label is repeated in the cell for columns that aren't the first or
    // the last column. They are hidden on desktop and shown on mobile.
    expect(await rows[0].getCells()).toEqual(["Alice", "", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anna", "", "Age 19", "Anna"]);
    expect(await rows[2].getCells()).toEqual(["Anton", "", "Age 31", "Anton"]);
  });

  it("should render row href", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getHref()).toBe("alice/");
    expect(await rows[1].getHref()).toBe("anna/");
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
