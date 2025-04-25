import { ALL_SNS_PROPOSALS_WITHOUT_TOPIC } from "$lib/types/filters";
import FilterModalTest from "$tests/lib/modals/common/FilterModalTest.svelte";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic } from "@dfinity/nns";

describe("FilterModal", () => {
  const filters = [
    { id: "1", name: "test", value: 1, checked: false },
    { id: "2", name: "test-2", value: 2, checked: true },
  ];

  const renderComponent = (props = {}, events = {}): FilterModalPo => {
    const { container } = render(FilterModalTest, {
      props,
      events,
    });

    return FilterModalPo.under(new JestPageObjectElement(container));
  };

  it("should display modal", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should render title", async () => {
    const title = "Test title";
    const po = renderComponent({ title });

    expect(await po.getModalTitle()).toBe("Test title");
  });

  it("should render checkboxes", async () => {
    const po = renderComponent({ filters });
    const checkboxes = await po.getFilterEntryPos();
    const labels = (
      await Promise.all(checkboxes.map((checkbox) => checkbox.getText()))
    ).map((s) => s.trim());

    expect(checkboxes.length).toBe(filters.length);
    expect(labels).toEqual(["test", "test-2"]);
  });

  it("should render a modal with spinner if filters are not loaded", async () => {
    const po = renderComponent({ visible: true, filters: undefined });

    expect(await po.getFilterSpinnerPo().isPresent()).toBe(true);
  });

  it("should forward close modal event", async () => {
    const nnsClose = vi.fn();
    const po = renderComponent({ filters }, { nnsClose });

    expect(await po.isPresent()).toBe(true);
    expect(nnsClose).toHaveBeenCalledTimes(0);

    await po.clickCloseButton();

    expect(nnsClose).toHaveBeenCalledTimes(1);
  });

  it("should trigger nnsChange event when checkbox is clicked", async () => {
    const nnsChange = vi.fn();
    const po = renderComponent({ filters }, { nnsChange });
    const checkboxes = await po.getFilterEntryPos();
    const firstCheckbox = checkboxes[0];

    expect(await po.isPresent()).toBe(true);
    expect(await firstCheckbox.isPresent()).toBe(true);
    expect(nnsChange).toHaveBeenCalledTimes(0);

    await firstCheckbox.toggle();

    expect(nnsChange).toHaveBeenCalledTimes(1);
  });

  it("should trigger nnsConfirm event when primary button is clicked", async () => {
    const nnsConfirm = vi.fn();
    const po = renderComponent({ filters }, { nnsConfirm });

    expect(await po.isPresent()).toBe(true);
    expect(nnsConfirm).toHaveBeenCalledTimes(0);

    await po.clickConfirmButton();

    expect(nnsConfirm).toHaveBeenCalledTimes(1);
  });

  it("should trigger nnsSelectAll when select all button is clicked", async () => {
    const nnsSelectAll = vi.fn();
    const po = renderComponent({ filters }, { nnsSelectAll });

    expect(await po.isPresent()).toBe(true);
    expect(nnsSelectAll).toHaveBeenCalledTimes(0);

    await po.clickSelectAllButton();

    expect(nnsSelectAll).toHaveBeenCalledTimes(1);
  });

  it("should trigger nnsClearSelection when clear button is clicked", async () => {
    const nnsClearSelection = vi.fn();
    const po = renderComponent({ filters }, { nnsClearSelection });

    expect(await po.isPresent()).toBe(true);
    expect(nnsClearSelection).toHaveBeenCalledTimes(0);

    await po.clickClearSelectionButton();

    expect(nnsClearSelection).toHaveBeenCalledTimes(1);
  });

  it("should render a Separator if category is topics and value is SnsAndCommunityFund", async () => {
    const filters = [
      {
        id: "topic",
        name: "test",
        value: Topic.SnsAndCommunityFund,
        checked: false,
      },
    ];

    const po = renderComponent({
      filters,
      category: "topics",
    });
    const separator = po.getFilterEntrySeparatorByIdPo(filters[0].id);

    expect(await separator.isPresent()).toBe(true);
  });

  it("should render a Separator if category is topics and there are critical and non-critical topics", async () => {
    const filters = [
      {
        id: "critical-topic",
        name: "test",
        value: "CRITICAL_TOPIC",
        checked: false,
        isCritical: true,
      },

      {
        id: "non-critical-topic",
        name: "test",
        value: "NON_CRITICAL_TOPIC",
        checked: false,
        isCritical: false,
      },
    ];

    const po = renderComponent({
      filters,
      category: "topics",
    });
    const separator = po.getFilterEntrySeparatorByIdPo(filters[0].id);

    expect(await separator.isPresent()).toBe(true);
  });

  it("should render a Separator if category is topics and the next entry is the special filter to show proposals without a topic", async () => {
    const filters = [
      {
        id: "last-known-topic",
        name: "test",
        value: "TOPIC",
        checked: false,
        isCritical: true,
      },

      {
        id: "special-topic-filter",
        name: "test",
        value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
        checked: false,
        isCritical: false,
      },
    ];

    const po = renderComponent({
      filters,
      category: "topics",
    });
    const separator = po.getFilterEntrySeparatorByIdPo(filters[0].id);

    expect(await separator.isPresent()).toBe(true);
  });
});
