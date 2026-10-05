import CanistersTable from "$lib/components/canisters/CanistersTable/CanistersTable.svelte";
import type { CanistersTableRowData } from "$lib/types/canisters-table";
import { mockCanister, mockCanisters } from "$tests/mocks/canisters.mock";
import { CanistersTablePo } from "$tests/page-objects/CanistersTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/worker-cycles.services", () => ({
  initCyclesWorker: vi.fn(() =>
    Promise.resolve({
      startCyclesTimer: () => {
        // Do nothing
      },
      stopCyclesTimer: () => {
        // Do nothing
      },
      terminate: () => {
        // Do nothing
      },
    })
  ),
}));

describe("CanistersTable", () => {
  const rowData: CanistersTableRowData[] = mockCanisters.map((canister) => ({
    domKey: canister.canister_id.toText(),
    rowHref: `/canister/?u=abc&canister=${canister.canister_id.toText()}`,
    canister,
  }));

  const renderComponent = ({
    data = rowData,
    loading = false,
  }: { data?: CanistersTableRowData[]; loading?: boolean } = {}) => {
    const { container } = render(CanistersTable, {
      props: { rowData: data, loading },
    });
    return CanistersTablePo.under(new JestPageObjectElement(container));
  };

  it("should render a row per canister", async () => {
    const po = renderComponent();

    expect(await po.getRows()).toHaveLength(2);
  });

  it("should render the canister name", async () => {
    const po = renderComponent();

    const [firstRow] = await po.getRows();
    expect(await firstRow.getCanisterName()).toBe("test1");
  });

  it("should render the canister id when the canister has no name", async () => {
    const po = renderComponent();

    const [_, secondRow] = await po.getRows();
    expect(await secondRow.getCanisterName()).toBe(
      mockCanister.canister_id.toText()
    );
  });

  it("should link each row to the canister detail page", async () => {
    const po = renderComponent();

    const [firstRow] = await po.getRows();
    expect(await firstRow.getHref()).toBe(rowData[0].rowHref);
  });

  it("should render the name column header", async () => {
    const po = renderComponent();

    expect(await po.getDesktopColumnHeaders()).toEqual(["Canister Name", ""]);
  });

  it("should render skeleton rows while loading", async () => {
    const po = renderComponent({ data: [], loading: true });

    expect(await po.getDesktopColumnHeaders()).toEqual(["Canister Name", ""]);
    expect(await po.getSkeletonRows()).toHaveLength(3);
  });
});
