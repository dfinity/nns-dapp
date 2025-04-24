import SnsFilterTopicsModal from "$lib/modals/sns/proposals/SnsFilterTopicsModal.svelte";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter, SnsProposalTopicFilterId } from "$lib/types/filters";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { get } from "svelte/store";

describe("SnsFilterTopicsModal", () => {
  const renderComponent = (props = {}) => {
    const { container } = render(SnsFilterTopicsModal, {
      props,
    });
    return FilterModalPo.under(new JestPageObjectElement(container));
  };

  const filters: Filter<SnsProposalTopicFilterId>[] = [
    {
      id: "1",
      name: "ApplicationBusinessLogic",
      value: "ApplicationBusinessLogic",
      checked: false,
    },
    {
      id: "2",
      name: "CriticalDappOperations",
      value: "CriticalDappOperations",
      checked: false,
    },
  ];

  it("should display modal", async () => {
    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters,
    });

    expect(await po.isPresent()).toBe(true);
  });

  it("should render title", async () => {
    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters,
    });

    expect(await po.getModalTitle()).toBe("Topics");
  });

  it("should render checkboxes", async () => {
    const po = renderComponent({ filters });
    const checkboxes = await po.getFilterEntryPos();
    const labels = (
      await Promise.all(checkboxes.map((checkbox) => checkbox.getText()))
    ).map((s) => s.trim());

    expect(checkboxes.length).toBe(filters.length);
    expect(labels).toEqual([
      "ApplicationBusinessLogic",
      "CriticalDappOperations",
    ]);
  });

  it("should call closeModal function", async () => {
    const closeModal = vi.fn();
    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters,
      closeModal,
    });

    expect(await po.isPresent()).toBe(true);
    expect(closeModal).toHaveBeenCalledTimes(0);

    await po.clickCloseButton();

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("should update filter selection and close modal", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));

    snsFiltersStore.setTopics({
      rootCanisterId: mockPrincipal,
      topics: uncheckedFilters,
    });

    const closeModal = vi.fn();

    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters,
      closeModal,
    });
    const checkboxes = await po.getFilterEntryPos();

    const firstCheckbox = checkboxes[0];
    expect(await firstCheckbox.isChecked()).toBe(false);

    await firstCheckbox.toggle();
    expect(await firstCheckbox.isChecked()).toBe(true);

    const secondCheckbox = checkboxes[1];
    expect(await secondCheckbox.isChecked()).toBe(false);

    await secondCheckbox.toggle();
    expect(await secondCheckbox.isChecked()).toBe(true);

    expect(closeModal).toHaveBeenCalledTimes(0);

    await po.clickConfirmButton();

    const topics = get(snsFiltersStore)[mockPrincipal.toText()]?.topics;
    expect(topics.filter(({ checked }) => checked).length).toEqual(2);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("should select all filters and close modal", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));

    snsFiltersStore.setTopics({
      rootCanisterId: mockPrincipal,
      topics: uncheckedFilters,
    });

    const closeModal = vi.fn();

    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters,
      closeModal,
    });
    const checkboxes = await po.getFilterEntryPos();

    for (const checkbox of checkboxes) {
      expect(await checkbox.isChecked()).toBe(false);
    }

    await po.clickSelectAllButton();

    for (const checkbox of checkboxes) {
      expect(await checkbox.isChecked()).toBe(true);
    }

    expect(closeModal).toHaveBeenCalledTimes(0);

    await po.clickConfirmButton();

    const topics = get(snsFiltersStore)[mockPrincipal.toText()]?.topics;
    expect(topics.filter(({ checked }) => checked).length).toEqual(2);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("should clear all filters and close modal", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: true,
    }));

    snsFiltersStore.setTopics({
      rootCanisterId: mockPrincipal,
      topics: uncheckedFilters,
    });

    const closeModal = vi.fn();

    const po = renderComponent({
      rootCanisterId: mockPrincipal,
      filters: filters.map((filter) => ({
        ...filter,
        checked: true,
      })),
      closeModal,
    });
    const checkboxes = await po.getFilterEntryPos();

    for (const checkbox of checkboxes) {
      expect(await checkbox.isChecked()).toBe(true);
    }

    await po.clickClearSelectionButton();

    for (const checkbox of checkboxes) {
      expect(await checkbox.isChecked()).toBe(false);
    }

    expect(closeModal).toHaveBeenCalledTimes(0);

    await po.clickConfirmButton();

    const topics = get(snsFiltersStore)[mockPrincipal.toText()]?.topics;
    expect(topics.filter(({ checked }) => checked).length).toEqual(2);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
