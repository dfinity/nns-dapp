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
    },
    {
      title: "Age",
      cellComponent: TestTableAgeCell,
    },
    {
      title: "Actions",
      // Normally each column would have a different cell component but for
      // testing we reuse the name cell component.
      cellComponent: TestTableNameCell,
    },
  ];

  const tableData = [
    {
      rowHref: "alice/",
      name: "Alice",
      age: 45,
    },
    {
      rowHref: "anna/",
      name: "Anna",
      age: 19,
    },
    {
      rowHref: "anton/",
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
    expect(await rows[2].getHref()).toBe("anton/");
  });
});
