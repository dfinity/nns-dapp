import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
} from "$lib/types/responsive-table";
import { createAscendingComparator } from "$lib/utils/sort.utils";
import ResponsiveTableSortControlTest from "$tests/lib/components/ui/ResponsiveTableSortControlTest.svelte";
import TestTableAgeCell from "$tests/lib/components/ui/TestTableAgeCell.svelte";
import TestTableNameCell from "$tests/lib/components/ui/TestTableNameCell.svelte";
import { ResponsiveTableSortControlPo } from "$tests/page-objects/ResponsiveTableSortControl.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { get, writable, type Writable } from "svelte/store";

describe("ResponsiveTableSortControl", () => {
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
      id: "age",
      title: "Age",
      cellComponent: TestTableAgeCell,
      alignment: "left",
      templateColumns: ["1fr"],
      comparator: createAscendingComparator((rowData) => rowData.age),
    },
  ];

  const order = [{ columnId: "name" }, { columnId: "age" }];

  const renderComponent = ({
    columns,
    orderStore,
  }: {
    columns: ResponsiveTableColumn<TestRowData>[];
    orderStore?: Writable<ResponsiveTableOrder>;
  }) => {
    orderStore?.set(order);
    const { container } = render(ResponsiveTableSortControlTest, {
      props: {
        columns,
        orderStore,
      },
    });

    return ResponsiveTableSortControlPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render chips", async () => {
    const orderStore = writable(order);
    const po = renderComponent({
      columns,
      orderStore,
    });
    expect(await po.getSortChipLabels()).toEqual(["Name", "Age"]);
  });

  it("should change order", async () => {
    const orderStore = writable(order);
    const po = renderComponent({
      columns,
      orderStore,
    });
    expect(get(orderStore)).toEqual([
      { columnId: "name" },
      { columnId: "age" },
    ]);

    await po.clickSortChip("Age");
    expect(get(orderStore)).toEqual([
      { columnId: "age" },
      { columnId: "name" },
    ]);

    await po.clickSortChip("Name");
    expect(get(orderStore)).toEqual([
      { columnId: "name" },
      { columnId: "age" },
    ]);
  });

  it("should reverse order", async () => {
    const orderStore = writable(order);
    const po = renderComponent({
      columns,
      orderStore,
    });
    expect(get(orderStore)).toEqual([
      { columnId: "name" },
      { columnId: "age" },
    ]);
    expect(await po.isSortDirectionButtonReversed()).toBe(false);

    await po.getSortDirectionButtonPo().click();
    expect(get(orderStore)).toEqual([
      { columnId: "name", reversed: true },
      { columnId: "age" },
    ]);
    expect(await po.isSortDirectionButtonReversed()).toBe(true);

    await po.getSortDirectionButtonPo().click();
    expect(get(orderStore)).toEqual([
      { columnId: "name" },
      { columnId: "age" },
    ]);
    expect(await po.isSortDirectionButtonReversed()).toBe(false);
  });
});
