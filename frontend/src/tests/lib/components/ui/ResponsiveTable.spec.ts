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

  const renderComponent = ({ columns, tableData }) => {
    const { container } = render(ResponsiveTable, {
      columns,
      tableData,
    });

    return ResponsiveTablePo.under(new JestPageObjectElement(container));
  };

  it("should render column headers", async () => {
    const po = renderComponent({ columns, tableData });
    // The last column is reserved for actions and is never rendered with a
    // header.
    expect(await po.getColumnHeaders()).toEqual(["Name", "Age", ""]);
  });

  it("should render row data", async () => {
    const po = renderComponent({ columns, tableData });
    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    // The label is repeated in the cell for columns that aren't the first or
    // the last column. They are hidden on desktop and shown on mobile.
    expect(await rows[0].getCells()).toEqual(["Alice", "Age 45", "Alice"]);
    expect(await rows[1].getCells()).toEqual(["Anna", "Age 19", "Anna"]);
    expect(await rows[2].getCells()).toEqual(["Anton", "Age 31", "Anton"]);
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
    expect(await rows[0].getCellClasses()).toEqual([
      expect.arrayContaining(["desktop-align-left"]),
      expect.arrayContaining(["desktop-align-left"]),
      expect.arrayContaining(["desktop-align-right"]),
    ]);
  });

  it("should render column styles depending on the number of columns", async () => {
    // 3 columns
    const po1 = renderComponent({ columns, tableData });
    expect(await po1.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr max-content", // Name
        "1fr", // Age
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po1.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-0 cell-0"'
    );

    // 6 columns
    const po2 = renderComponent({
      columns: [...columns, ...columns],
      tableData,
    });
    expect(await po2.getDesktopGridTemplateColumns()).toBe(
      [
        "1fr max-content", // Name
        "1fr", // Age
        "max-content", // Actions
        "1fr max-content", // Name
        "1fr", // Age
        "max-content", // Actions
      ].join(" ")
    );
    expect(await po2.getMobileGridTemplateAreas()).toBe(
      '"first-cell last-cell" "cell-0 cell-0" "cell-1 cell-1" "cell-2 cell-2" "cell-3 cell-3"'
    );
  });

  it("should have a different grid area for cells in different columns", async () => {
    // 6 columns
    const po = renderComponent({
      columns: [...columns, ...columns],
      tableData,
    });

    // The first and last cell have grid areas set in CSS directly rather than
    // through the style attribute.
    const expectedStyles = [
      "--column-span: 2; --template-columns: 1fr max-content;",
      "--grid-area-name: cell-0; --column-span: 1; --template-columns: 1fr;",
      "--grid-area-name: cell-1; --column-span: 1; --template-columns: max-content;",
      "--grid-area-name: cell-2; --column-span: 2; --template-columns: 1fr max-content;",
      "--grid-area-name: cell-3; --column-span: 1; --template-columns: 1fr;",
      "--column-span: 1; --template-columns: max-content;",
    ];

    const rows = await po.getRows();
    expect(rows).toHaveLength(3);
    expect(await rows[0].getCellStyles()).toEqual(expectedStyles);
  });
});
