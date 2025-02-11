import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import ProposalsFilterModal from "$lib/modals/proposals/NnsProposalsFilterModal.svelte";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import type { ProposalsFilterModalProps } from "$lib/types/proposals";
import { enumKeys } from "$lib/utils/enum.utils";
import en from "$tests/mocks/i18n.mock";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic } from "@dfinity/nns";
import { get } from "svelte/store";

describe("ProposalsFilterModal", () => {
  const props: { props: ProposalsFilterModalProps } = {
    props: {
      category: "topics",
      filters: Topic,
      selectedFilters: DEFAULT_PROPOSALS_FILTERS.topics,
    },
  };

  const renderComponent = (onNnsClose?: () => void): FilterModalPo => {
    const { container } = render(ProposalsFilterModal, {
      props,
      events: { nnsClose: onNnsClose },
    });

    return FilterModalPo.under(new JestPageObjectElement(container));
  };

  it("should display modal", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should render title", async () => {
    const po = renderComponent();

    expect(await po.getModalTitle()).toBe("Topics");
  });

  it("should render checkboxes", async () => {
    const po = renderComponent();
    const checkboxes = await po.getFilterEntryPos();
    const checkboxLabels = (
      await Promise.all(checkboxes.map((checkbox) => checkbox.getText()))
    ).map((s) => s.trim());
    const expectedLabels = [
      "Governance",
      "SNS & Neurons' Fund",
      "API Boundary Node Management",
      "Application Canister Management",
      "Exchange Rate",
      "IC OS Version Deployment",
      "IC OS Version Election",
      "KYC",
      "Network Economics",
      "Neuron Management",
      "Node Admin",
      "Node Provider Rewards",
      "Participant Management",
      "Protocol Canister Management",
      "Service Nervous System Management",
      "Subnet Management",
      "Subnet Rental",
    ];

    expect(checkboxLabels).toEqual(expectedLabels);
  });

  it("should not render filter Unspecified", async () => {
    const po = renderComponent();
    const checkboxes = await po.getFilterEntryPos();
    const checkboxLabels = (
      await Promise.all(checkboxes.map((checkbox) => checkbox.getText()))
    ).map((s) => s.trim());

    expect(checkboxLabels).not.contain(en.topics.Unspecified);
  });

  it("should forward close modal event", async () => {
    const onNnsClose = vitest.fn();
    const po = renderComponent(onNnsClose);
    expect(onNnsClose).toHaveBeenCalledTimes(0);
    await po.clickCloseButton();
    expect(onNnsClose).toHaveBeenCalledTimes(1);
  });

  it("should filter filters", async () => {
    const po = renderComponent();
    const checkboxes = await po.getFilterEntryPos();

    const firstInput = checkboxes[0];
    await firstInput.click();
    expect(await firstInput.isChecked()).toBe(true);

    const secondInput = checkboxes[1];
    await secondInput.click();
    expect(await secondInput.isChecked()).toBe(true);

    expect(get(proposalsFiltersStore).topics).toEqual([]);

    await po.clickConfirmButton();

    expect(get(proposalsFiltersStore).topics).toEqual([
      ...DEFAULT_PROPOSALS_FILTERS.topics,
      Topic.Governance,
      Topic.SnsAndCommunityFund,
    ]);
  });

  it("should select all filters", async () => {
    const po = renderComponent();
    const checkboxes = await po.getFilterEntryPos();
    const getCheckboxStates = () =>
      Promise.all(checkboxes.map((checkbox) => checkbox.isChecked()));

    expect((await getCheckboxStates()).length).toEqual(
      // Unspecified and SnsDecentralizationSale are not displayed
      enumKeys(Topic).length - 2
    );
    expect(await getCheckboxStates()).not.include(true);

    await po.clickSelectAllButton();

    expect(await getCheckboxStates()).not.include(false);
  });

  it("should clear all filters", async () => {
    const po = renderComponent();
    const checkboxes = await po.getFilterEntryPos();
    const getCheckboxStates = () =>
      Promise.all(checkboxes.map((checkbox) => checkbox.isChecked()));

    await po.clickSelectAllButton();
    expect(await getCheckboxStates()).not.include(false);

    await po.clickClearSelectionButton();
    expect(await getCheckboxStates()).not.include(true);
  });
});
