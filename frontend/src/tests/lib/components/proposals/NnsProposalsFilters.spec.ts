import NnsProposalsFilters from "$lib/components/proposals/NnsProposalsFilters.svelte";
import {
  DEFAULT_PROPOSALS_FILTERS,
  DEPRECATED_TOPICS,
} from "$lib/constants/proposals.constants";
import { authStore } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "$lib/types/proposals";
import { enumSize } from "$lib/utils/enum.utils";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { NnsProposalFiltersPo } from "$tests/page-objects/NnsProposalFilters.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
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

  describe("default filters", () => {
    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

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

    it("should render rewards filters", () => {
      const { container } = render(NnsProposalsFilters);

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.rewards.length,
        totalFilters: enumSize(ProposalRewardStatus) - 1,
        text: en.voting.rewards,
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

    describe("signed in", () => {
      beforeAll(() => {
        authStoreMock.next({
          identity: mockIdentity,
        });
        overrideFeatureFlagsStore.reset();
      });

      it("should render a checkbox", () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", false);
        const { container } = render(NnsProposalsFilters);

        const input: HTMLInputElement | null = container.querySelector("input");

        expect(input?.getAttribute("type")).toEqual("checkbox");
        expect(input?.getAttribute("id")).toEqual("hide-unavailable-proposals");
      });
    });

    describe("not signed in", () => {
      beforeAll(() => {
        authStoreMock.next({
          identity: undefined,
        });
      });

      it("should not render a checkbox", () => {
        const { getByTestId } = render(NnsProposalsFilters);

        expect(() => getByTestId("hide-unavailable-proposals")).toThrow();
      });
    });
  });

  describe("custom filter selection", () => {
    afterEach(() => {
      proposalsFiltersStore.reset();
    });

    it("should not count deprecated selected filters in the count", () => {
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
      overrideFeatureFlagsStore.reset();
      proposalsFiltersStore.reset();

      authStoreMock.next({
        identity: undefined,
      });
    });

    describe("when feature flag true", () => {
      describe("when signed out", () => {
        beforeEach(() => {
          authStoreMock.next({
            identity: undefined,
          });
        });

        it("should render actionable proposals segment", async () => {
          const po = await renderComponent();

          expect(
            await po.getActionableProposalsSegmentPo().isPresent()
          ).toEqual(true);
        });

        it('should "all" be preselected by default', async () => {
          const po = await renderComponent();
          expect(
            await po.getActionableProposalsSegmentPo().isAllProposalsSelected()
          ).toEqual(true);
        });

        it("should be clickable", async () => {
          const po = await renderComponent();
          const segmentPo = po.getActionableProposalsSegmentPo();
          await segmentPo.clickActionableProposals();
          expect(await segmentPo.isActionableProposalsSelected()).toEqual(true);

          await segmentPo.clickAllProposals();
          expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
        });

        it("should hide and show proposal filters", async () => {
          const po = await renderComponent();
          const segmentPo = po.getActionableProposalsSegmentPo();

          expect(await po.getFiltersWrapper().isPresent()).toEqual(true);

          await segmentPo.clickActionableProposals();
          expect(await po.getFiltersWrapper().isPresent()).toEqual(false);

          await segmentPo.clickAllProposals();
          expect(await po.getFiltersWrapper().isPresent()).toEqual(true);
        });
      });

      describe("when signed in", () => {
        beforeEach(() => {
          authStoreMock.next({
            identity: mockIdentity,
          });
        });

        it("should render actionable proposals segment", async () => {
          const po = await renderComponent();

          expect(
            await po.getActionableProposalsSegmentPo().isPresent()
          ).toEqual(true);
        });

        it("should hide votable proposals checkbox", async () => {
          const po = await renderComponent();

          expect(
            await po.getVotableProposalsOnlyCheckboxPo().isPresent()
          ).toEqual(false);
        });

        it('should "all" be preselected by default', async () => {
          const po = await renderComponent();
          expect(
            await po.getActionableProposalsSegmentPo().isAllProposalsSelected()
          ).toEqual(true);
        });

        it("should be clickable", async () => {
          const po = await renderComponent();
          const segmentPo = po.getActionableProposalsSegmentPo();
          await segmentPo.clickActionableProposals();
          expect(await segmentPo.isActionableProposalsSelected()).toEqual(true);

          await segmentPo.clickAllProposals();
          expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
        });

        it("should hide and show proposal filters", async () => {
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

    describe("when feature flag is false", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", false);
      });

      describe("when signed out", () => {
        beforeEach(() => {
          authStoreMock.next({
            identity: undefined,
          });
        });

        it("should not render actionable proposals segment", async () => {
          const po = await renderComponent();
          expect(
            await po.getActionableProposalsSegmentPo().isPresent()
          ).toEqual(false);
        });

        it("should render proposal filters", async () => {
          const po = await renderComponent();
          expect(await po.getFiltersWrapper().isPresent()).toEqual(true);
        });
      });

      describe("when signed in", () => {
        beforeEach(() => {
          authStoreMock.next({
            identity: mockIdentity,
          });
        });

        it("should not render actionable proposals segment", async () => {
          const po = await renderComponent();
          expect(
            await po.getActionableProposalsSegmentPo().isPresent()
          ).toEqual(false);
        });

        it("should render proposal filters", async () => {
          const po = await renderComponent();
          expect(await po.getFiltersWrapper().isPresent()).toEqual(true);
        });

        it("should display votable proposals checkbox", async () => {
          const po = await renderComponent();
          expect(
            await po.getVotableProposalsOnlyCheckboxPo().isPresent()
          ).toEqual(true);
        });
      });
    });
  });
});
