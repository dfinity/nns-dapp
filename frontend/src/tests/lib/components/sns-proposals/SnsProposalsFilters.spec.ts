import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import { page } from "$mocks/$app/stores";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { SnsProposalFiltersPo } from "$tests/page-objects/SnsProposalFilters.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("SnsProposalsFilters", () => {
  const renderComponent = async () => {
    const { container } = render(SnsProposalsFilters);
    await runResolvedPromises();
    return SnsProposalFiltersPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    page.mock({ data: { universe: mockPrincipal.toText() } });

    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        topics: {
          topics: [
            topicInfoDtoMock({
              topic: "DaoCommunitySettings",
              name: "Topic1",
              description: "This is a description",
              isCritical: false,
            }),
          ],
          uncategorized_functions: [],
        },
      },
    ]);
  });

  it("should open filter modal when status filter is clicked", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByStatusButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  it("should render filter by topics button when sns-aggregator returns topics and project governance canister supports filtering by topic", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();

    expect(await po.getFilterByStatusButtonPo().isPresent()).toBe(true);
    expect(await po.getFilterByTypesButtonPo().isPresent()).toBe(false);
    expect(await po.getFilterByTopicsButtonPo().isPresent()).toBe(true);
  });

  it("should not render filter by topics button when sns-aggregator returns topics but project governance canister doesn't support filtering by topic", async () => {
    unsupportedFilterByTopicSnsesStore.add(mockPrincipal.toText());

    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();

    expect(await po.getFilterByStatusButtonPo().isPresent()).toBe(true);
    expect(await po.getFilterByTypesButtonPo().isPresent()).toBe(true);
    expect(await po.getFilterByTopicsButtonPo().isPresent()).toBe(false);
  });

  it("should open filter modal when topic filter is clicked", async () => {
    const po = await renderComponent();
    await po.getActionableProposalsSegmentPo().clickAllProposals();
    expect(await po.getFilterModalPo().isPresent()).toBe(false);

    await po.clickFiltersByTopicButton();
    await runResolvedPromises();
    expect(await po.getFilterModalPo().isPresent()).toBe(true);
  });

  describe("actionable proposals", () => {
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

    it("should switch proposal lists on segment change", async () => {
      const po = await renderComponent();
      const segmentPo = po.getActionableProposalsSegmentPo();
      await segmentPo.clickAllProposals();

      expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(false);

      await segmentPo.clickActionableProposals();
      expect(await segmentPo.isAllProposalsSelected()).toEqual(false);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(true);

      await segmentPo.clickAllProposals();
      expect(await segmentPo.isAllProposalsSelected()).toEqual(true);
      expect(await segmentPo.isActionableProposalsSelected()).toEqual(false);
    });

    it("should hide and show proposal filters", async () => {
      const po = await renderComponent();
      const segmentPo = po.getActionableProposalsSegmentPo();

      await segmentPo.clickAllProposals();
      expect(await po.getFilterByTopicsButtonPo().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButtonPo().isPresent()).toEqual(true);

      await segmentPo.clickActionableProposals();
      expect(await po.getFilterByTopicsButtonPo().isPresent()).toEqual(false);
      expect(await po.getFilterByStatusButtonPo().isPresent()).toEqual(false);

      await segmentPo.clickAllProposals();
      expect(await po.getFilterByTopicsButtonPo().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButtonPo().isPresent()).toEqual(true);
    });
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
      expect(await po.getFilterByTopicsButtonPo().isPresent()).toEqual(true);
      expect(await po.getFilterByStatusButtonPo().isPresent()).toEqual(true);
    });
  });
});
