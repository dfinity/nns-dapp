import ResponsiveTableSortModal from "$lib/modals/common/ResponsiveTableSortModal.svelte";
import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
} from "$lib/types/responsive-table";
import { createAscendingComparator } from "$lib/utils/sort.utils";
import TestTableAgeCell from "$tests/lib/components/ui/TestTableAgeCell.svelte";
import TestTableNameCell from "$tests/lib/components/ui/TestTableNameCell.svelte";
import { ResponsiveTableSortModalPo } from "$tests/page-objects/ResponsiveTableSortModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { get, writable, type Writable } from "svelte/store";

describe("ResponsiveTableSortModal", () => {
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
    order,
    orderStore,
    onClose,
  }: {
    columns: ResponsiveTableColumn<TestRowData>[];
    order: ResponsiveTableOrder;
    orderStore?: Writable<ResponsiveTableOrder>;
    onClose?: () => void;
  }) => {
    const { container, component } = render(ResponsiveTableSortModal, {
      columns,
      order,
    });
    component.$on("nnsClose", () => {
      orderStore?.set(component.$$.ctx[component.$$.props["order"]]);
      onClose?.();
    });

    return ResponsiveTableSortModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should render modal title", async () => {
    const po = renderComponent({ columns, order });
    expect(await po.getModalTitle()).toBe("Sort by");
  });

  it("should render columns", async () => {
    const po = renderComponent({ columns, order });
    expect(await po.getOptions()).toEqual(["Name", "Age"]);
  });

  it("should render arrow", async () => {
    const order = [{ columnId: "name" }];
    const po = renderComponent({ columns, order });
    expect(await po.getOptionWithArrow()).toBe("Name");
  });

  it("should change order", async () => {
    const order = [{ columnId: "name" }];
    const orderStore = writable(order);
    const po = renderComponent({ columns, order, orderStore });
    await po.clickOption("Age");
    await advanceTime(400);
    expect(await po.getOptionWithArrow()).toBe("Age");
    expect(get(orderStore)).toEqual([
      { columnId: "age" },
      { columnId: "name" },
    ]);
  });

  it("should reverse order", async () => {
    const order = [{ columnId: "name" }];
    const orderStore = writable(order);
    const po = renderComponent({ columns, order, orderStore });
    expect(await po.isReversed()).toBe(false);
    await po.clickOption("Name");
    await advanceTime(400);
    expect(get(orderStore)).toEqual([{ columnId: "name", reversed: true }]);
    expect(await po.isReversed()).toBe(true);
    await po.clickOption("Age");
    expect(await po.isReversed()).toBe(false);
  });

  it("should close modal with delay when selecting an option", async () => {
    const close = vi.fn();
    const po = renderComponent({ columns, order, onClose: close });
    expect(close).not.toBeCalled();
    await po.clickOption("Name");
    await advanceTime(200);
    expect(close).not.toBeCalled();
    await advanceTime(100);
    expect(close).toBeCalledTimes(1);
  });
});
