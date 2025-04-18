import SnsFilterStatusModal from "$lib/modals/sns/proposals/SnsFilterStatusModal.svelte";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import type { Filter } from "$lib/types/filters";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "$tests/utils/svelte.test-utils";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsFilterStatusModal", () => {
  const filters: Filter<SnsProposalDecisionStatus>[] = [
    {
      id: "1",
      name: "status-1",
      value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      checked: true,
    },
    {
      id: "2",
      name: "status-2",
      value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
      checked: false,
    },
  ];
  const closeModal = vi.fn();
  const props = {
    rootCanisterId: mockPrincipal,
    filters,
    closeModal,
  };

  it("should display modal", () => {
    const { container } = render(SnsFilterStatusModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(SnsFilterStatusModal, {
      props,
    });

    expect(getByText(en.voting.status)).toBeInTheDocument();
  });

  it("should render checkboxes", () => {
    const { container } = render(SnsFilterStatusModal, {
      props,
    });

    expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(
      filters.length
    );
  });

  it("should call closeModal function", () => {
    const { container } = render(SnsFilterStatusModal, {
      props,
    });

    const button: HTMLButtonElement | null = container.querySelector(
      "button:first-of-type"
    );

    expect(closeModal).toHaveBeenCalledTimes(0);
    button && fireEvent.click(button);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("should filter filters", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));
    snsFiltersStore.setDecisionStatus({
      rootCanisterId: mockPrincipal,
      decisionStatus: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterStatusModal, {
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

    const statuses =
      get(snsFiltersStore)[mockPrincipal.toText()]?.decisionStatus;

    expect(statuses.filter(({ checked }) => checked).length).toEqual(2);
  });

  it("should select all filters", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));
    snsFiltersStore.setDecisionStatus({
      rootCanisterId: mockPrincipal,
      decisionStatus: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterStatusModal, {
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

  it("should clearfilters", async () => {
    const uncheckedFilters = filters.map((filter) => ({
      ...filter,
      checked: true,
    }));
    snsFiltersStore.setDecisionStatus({
      rootCanisterId: mockPrincipal,
      decisionStatus: uncheckedFilters,
    });
    const { queryAllByTestId, queryByTestId } = render(SnsFilterStatusModal, {
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
