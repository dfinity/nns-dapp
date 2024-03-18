import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import type { ActionableSnsProposalsData } from "$lib/stores/actionable-sns-proposals.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalListPo } from "$tests/page-objects/SnsProposalList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { beforeEach, describe } from "vitest";

describe("SnsProposalsList", () => {
  const renderComponent = async (props: {
    proposals: SnsProposalData[];
    actionableProposals: ActionableSnsProposalsData | undefined;
    snsName: string | undefined;
    nsFunctions: undefined[];
  }) => {
    const { container } = render(SnsProposalsList, { props });
    await runResolvedPromises();
    return SnsProposalListPo.under(new JestPageObjectElement(container));
  };

  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 1n }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 3n }],
  };
  const proposals = [proposal1, proposal2, proposal3];

  beforeEach(() => {
    actionableProposalsSegmentStore.resetForTesting();
  });

  it("should render a proposal card per proposal", () => {
    const { queryAllByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
      },
    });

    expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
  });

  it("should render a spinner when loading next page", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
        loadingNextPage: true,
      },
    });

    expect(
      queryByTestId("next-page-sns-proposals-spinner")
    ).toBeInTheDocument();
  });

  it("should render a card skeletons if proposals are loading", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: undefined,
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("proposals-loading")).toBeInTheDocument();
  });

  it("should render no proposals found message if proposals is empty", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: [],
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("no-proposals-msg")).toBeInTheDocument();
  });

  describe("when display actionable proposals selected", () => {
    beforeEach(() => {
      actionableProposalsSegmentStore.set("actionable");
      resetIdentity();
    });

    it('should display "Not signIn" banner', async () => {
      setNoIdentity();

      const po = await renderComponent({
        proposals: [],
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
      });

      expect(await po.getActionableSignInBanner().isPresent()).toBe(true);
      expect(await po.getActionableSignInBanner().getTitleText()).toEqual(
        "You are not signed in."
      );
      expect(await po.getActionableSignInBanner().getDescriptionText()).toEqual(
        "Sign in to see actionable proposals"
      );
      expect(
        await po.getActionableSignInBanner().getBannerActionsText()
      ).toEqual("Sign in with Internet Identity");
    });

    it("should display loading skeletons", async () => {
      const po = await renderComponent({
        proposals: [],
        actionableProposals: undefined,
        snsName: undefined,
        nsFunctions: [],
      });
      expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
    });

    it('should display "Actionable not supported" banner', async () => {
      const po = await renderComponent({
        proposals: [],
        actionableProposals: {
          includeBallotsByCaller: false,
          proposals: [],
        },
        snsName: "Sns Name",
        nsFunctions: [],
      });

      expect(await po.getActionableNotSupportedBanner().isPresent()).toBe(true);
      expect(await po.getActionableNotSupportedBanner().getTitleText()).toEqual(
        "Sns Name doesn't yet support actionable proposals."
      );
      expect(
        await po.getActionableNotSupportedBanner().getDescriptionText()
      ).toEqual(
        "Because it is running an older version of the SNS governance canister."
      );
    });

    it('should display "No actionable proposals" banner', async () => {
      const po = await renderComponent({
        proposals: [],
        actionableProposals: {
          includeBallotsByCaller: true,
          proposals: [],
        },
        snsName: undefined,
        nsFunctions: [],
      });

      expect(await po.getActionableEmptyBanner().isPresent()).toBe(true);
      expect(await po.getActionableEmptyBanner().getTitleText()).toEqual(
        "There are no actionable proposals you can vote for."
      );
      expect(await po.getActionableEmptyBanner().getDescriptionText()).toEqual(
        "Check back later!"
      );
    });

    it.only("should display actionable proposals", async () => {
      const po = await renderComponent({
        proposals: [],
        actionableProposals: {
          includeBallotsByCaller: true,
          proposals: [{ ...mockSnsProposal, id: [{ id: 123n }] }],
        },
        snsName: undefined,
        nsFunctions: [],
      });

      expect((await po.getProposalCardPos()).length).toBe(1);
      expect(await (await po.getProposalCardPos())[0].getProposalId()).toBe(
        "ID: 123"
      );
    });
  });
});
