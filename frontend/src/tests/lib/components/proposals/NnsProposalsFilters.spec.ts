import NnsProposalsFilters from "$lib/components/proposals/NnsProposalsFilters.svelte";
import {
  DEFAULT_PROPOSALS_FILTERS,
  DEPRECATED_TOPICS,
} from "$lib/constants/proposals.constants";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "$lib/types/proposals";
import { enumSize } from "$lib/utils/enum.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { NnsProposalFiltersPo } from "$tests/page-objects/NnsProposalFilters.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsProposalsFilters", () => {
  const shouldRenderFilter = ({
    container,
    activeFilters,
    totalFilters,
    text,
  }: {
    container: HTMLElement;
    activeFilters: number;
    totalFilters: number;
    text: string;
  }) => {
    const buttonText = `${text} (${activeFilters}/${totalFilters})`;

    const buttons = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent === buttonText
    );

    expect(buttons?.length).toEqual(1);
  };

  beforeEach(() => {
    actionableProposalsSegmentStore.resetForTesting();
    proposalsFiltersStore.reset();
    resetIdentity();
  });

  describe("default filters", () => {
    beforeEach(() => {
      actionableProposalsSegmentStore.set("all");
    });

    it("should render topics filters", () => {
      const { container } = render(NnsProposalsFilters);

      const nonShownTopicsLength = [
        PROPOSAL_FILTER_UNSPECIFIED_VALUE,
        ...DEPRECATED_TOPICS,
      ].length;

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.topics.length,
        totalFilters: enumSize(Topic) - nonShownTopicsLength,
        text: en.voting.topics,
      });
    });

    it("should render proposals filters", () => {
      const { container } = render(NnsProposalsFilters);

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.status.length,
        totalFilters: enumSize(ProposalStatus) - 1,
        text: en.voting.status,
      });
    });
  });

  describe("custom filter selection", () => {
    it("should not count deprecated selected filters in the count", () => {
      actionableProposalsSegmentStore.set("all");

      const activeFilters = [
        Topic.SnsDecentralizationSale,
        Topic.SnsAndCommunityFund,
        Topic.ExchangeRate,
      ];
      proposalsFiltersStore.filterTopics(activeFilters);

      const { container } = render(NnsProposalsFilters);

      const nonShownTopicsLength = [
        PROPOSAL_FILTER_UNSPECIFIED_VALUE,
        ...DEPRECATED_TOPICS,
      ].length;

      shouldRenderFilter({
        container,
        // Should NOT count deprecated SnsDecentralizationSale topic
        activeFilters: activeFilters.length - 1,
        totalFilters: enumSize(Topic) - nonShownTopicsLength,
        text: en.voting.topics,
      });
    });
  });

  describe("actionable proposals", () => {
    const renderComponent = async () => {
      const { container } = render(NnsProposalsFilters);
      await runResolvedPromises();
      return NnsProposalFiltersPo.under(new JestPageObjectElement(container));
    };

    beforeEach(() => {
      proposalsFiltersStore.reset();
    });

    describe("when signed out", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should not render actionable proposals segment", async () => {
        const po = await renderComponent();

        expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
          false
        );
      });

      it("should filters be shown", async () => {
        const po = await renderComponent();

        expect(await po.getFiltersWrapper().isPresent()).toEqual(true);
      });
    });

    describe("when signed in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should render actionable proposals segment", async () => {
        const po = await renderComponent();

        expect(await po.getActionableProposalsSegmentPo().isPresent()).toEqual(
          true
        );
      });

      it('should "actionable" be preselected by default', async () => {
        const po = await renderComponent();
        expect(
          await po
            .getActionableProposalsSegmentPo()
            .isActionableProposalsSelected()
        ).toEqual(true);
      });

      it("should hide and show proposal filters", async () => {
        actionableProposalsSegmentStore.set("all");
        const po = await renderComponent();
        const segmentPo = po.getActionableProposalsSegmentPo();

        expect(await po.getFiltersWrapper().isPresent()).toEqual(true);

        await segmentPo.clickActionableProposals();
        expect(await po.getFiltersWrapper().isPresent()).toEqual(false);

        await segmentPo.clickAllProposals();
        expect(await po.getFiltersWrapper().isPresent()).toEqual(true);
      });
    });
  });
});
