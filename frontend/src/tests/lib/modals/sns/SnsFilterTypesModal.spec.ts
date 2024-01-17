import SnsFilterTypesModal from "$lib/modals/sns/proposals/SnsFilterTypesModal.svelte";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter, SnsProposalTypeFilterId } from "$lib/types/filters";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsFilterTypesModal", () => {
  afterEach(() => {
    snsFiltersStore.reset();
  });
  const filters: Filter<SnsProposalTypeFilterId>[] = [
    {
      id: "1",
      name: "Motion",
      value: "1",
      checked: true,
    },
    {
      id: "2",
      name: "Motion",
      value: "2",
      checked: false,
    },
  ];
  const props = {
    rootCanisterId: mockPrincipal,
    filters,
  };

  it("should display modal", () => {
    const { container } = render(SnsFilterTypesModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(SnsFilterTypesModal, {
      props,
    });

    expect(getByText(en.voting.types)).toBeInTheDocument();
  });

  it("should render checkboxes", () => {
    const { container } = render(SnsFilterTypesModal, {
      props,
    });

    expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(
      filters.length
    );
  });

  it("should forward close modal event", () =>
    new Promise<void>((done) => {
      const { container, component } = render(SnsFilterTypesModal, {
        props,
      });

      component.$on("nnsClose", () => {
        done();
      });

      const button: HTMLButtonElement | null = container.querySelector(
        "button:first-of-type"
      );

      button && fireEvent.click(button);
    }));

  it("should update selection", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));
    snsFiltersStore.setTypes({
      rootCanisterId: mockPrincipal,
      types: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterTypesModal, {
      props: {
        ...props,
        filters: uncheckedFilters,
      },
    });

    const inputs = queryAllByTestId("checkbox") as HTMLInputElement[];
    const firstInput = inputs[0];
    fireEvent.click(firstInput);
    await waitFor(() => expect(firstInput.checked).toBeTruthy());

    const secondInput = inputs[1];
    fireEvent.click(secondInput);
    await waitFor(() => expect(secondInput.checked).toBeTruthy());

    await clickByTestId(queryByTestId, "apply-filters");

    const types = get(snsFiltersStore)[mockPrincipal.toText()]?.types;

    expect(types.filter(({ checked }) => checked).length).toEqual(2);
  });

  it("should select all filters", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));
    snsFiltersStore.setTypes({
      rootCanisterId: mockPrincipal,
      types: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterTypesModal, {
      props: {
        ...props,
        filters: uncheckedFilters,
      },
    });

    const inputs = queryAllByTestId("checkbox") as HTMLInputElement[];
    await waitFor(() =>
      expect(inputs.reduce((acc, input) => acc && input.checked, true)).toBe(
        false
      )
    );

    await clickByTestId(queryByTestId, "filter-modal-select-all");

    const inputs2 = queryAllByTestId("checkbox") as HTMLInputElement[];
    await waitFor(() =>
      expect(inputs2.reduce((acc, input) => acc && input.checked, true)).toBe(
        true
      )
    );
  });

  it("should clear filters", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: true,
    }));
    snsFiltersStore.setTypes({
      rootCanisterId: mockPrincipal,
      types: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterTypesModal, {
      props: {
        ...props,
        filters: uncheckedFilters,
      },
    });

    const inputs = queryAllByTestId("checkbox") as HTMLInputElement[];
    await waitFor(() =>
      expect(inputs.reduce((acc, input) => acc && input.checked, true)).toBe(
        true
      )
    );

    await clickByTestId(queryByTestId, "filter-modal-clear");

    const inputs2 = queryAllByTestId("checkbox") as HTMLInputElement[];
    await waitFor(() =>
      expect(inputs2.reduce((acc, input) => acc || input.checked, false)).toBe(
        false
      )
    );
  });
});
