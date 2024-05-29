import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { SnsProposalListPo } from "$tests/page-objects/SnsProposalList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsProposalDecisionStatus, type SnsProposalData } from "@dfinity/sns";

describe("SnsProposalsList", () => {
  const renderComponent = async (props) => {
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
    page.mock({ data: { universe: "aaaaa-aa" } });
  });

  it("should render a proposal card per proposal", () => {
    const { queryAllByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: false,
        nsFunctions: [],
      },
    });

    expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
  });

  it("should render a spinner when loading next page", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: false,
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
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: false,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("proposals-loading")).toBeInTheDocument();
  });

  it("should render no proposals found message if proposals is empty", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: [],
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: false,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("no-proposals-msg")).toBeInTheDocument();
  });

  describe("actionable proposals", () => {
    const actionableProposalA = createSnsProposal({
      proposalId: 123n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const actionableProposalB = createSnsProposal({
      proposalId: 321n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    beforeEach(() => {
      resetIdentity();
    });

    it("should render skeletons while proposals are loading", async () => {
      const po = await renderComponent({
        proposals: undefined,
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });

      expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
    });

    it('should display "Not signIn" banner', async () => {
      setNoIdentity();
      const po = await renderComponent({
        proposals: undefined,
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await po.getActionableSignInBanner().isPresent()).toBe(true);

      resetIdentity();
      const po2 = await renderComponent({
        proposals: undefined,
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await po2.getActionableSignInBanner().isPresent()).toBe(false);
    });

    it('should display "No actionable proposals" banner', async () => {
      const po = await renderComponent({
        proposals: [],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await po.getActionableEmptyBanner().isPresent()).toBe(true);

      const po2 = await renderComponent({
        proposals: [actionableProposalA],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await po2.getActionableEmptyBanner().isPresent()).toBe(false);
    });

    it('should display "Actionable not supported" banner', async () => {
      const po = await renderComponent({
        proposals: [],
        includeBallots: false,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await po.getActionableNotSupportedBanner().isPresent()).toBe(true);
      expect(await po.getActionableNotSupportedBanner().getTitleText()).toBe(
        "sns-name doesn't yet support actionable proposals."
      );

      const poTwo = await renderComponent({
        proposals: [],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect(await poTwo.getActionableNotSupportedBanner().isPresent()).toBe(
        false
      );
    });

    it("should display actionable proposals", async () => {
      const po = await renderComponent({
        proposals: [actionableProposalA, actionableProposalB],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect((await po.getProposalCardPos()).length).toEqual(2);
      expect(await (await po.getProposalCardPos())[0].getProposalId()).toEqual(
        "ID: 123"
      );
      expect(await (await po.getProposalCardPos())[1].getProposalId()).toEqual(
        "ID: 321"
      );
    });

    it("should use universe from URL for card href", async () => {
      const po = await renderComponent({
        proposals: [actionableProposalA],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: true,
        nsFunctions: [],
      });
      expect((await po.getProposalCardPos()).length).toEqual(1);
      expect(await (await po.getProposalCardPos())[0].getCardHref()).toEqual(
        `/proposal/?u=aaaaa-aa&proposal=123`
      );
    });

    it("should display actionable mark on all proposals view", async () => {
      const po = await renderComponent({
        proposals: [
          {
            ...mockSnsProposal,
            id: [{ id: 1n }],
            isActionable: false,
          },
          {
            ...mockSnsProposal,
            id: [{ id: 2n }],
            isActionable: true,
          },
          {
            ...mockSnsProposal,
            id: [{ id: 3n }],
            isActionable: true,
          },
        ],
        includeBallots: true,
        snsName: "sns-name",
        actionableSelected: false,
        nsFunctions: [],
      });
      await po
        .getSnsProposalFiltersPo()
        .getActionableProposalsSegmentPo()
        .clickAllProposals();
      await runResolvedPromises();

      const cards = await po.getProposalCardPos();
      expect(
        await cards[0].getProposalStatusTagPo().hasActionableStatusBadge()
      ).toBe(false);
      expect(
        await cards[1].getProposalStatusTagPo().hasActionableStatusBadge()
      ).toBe(true);
      expect(
        await cards[2].getProposalStatusTagPo().hasActionableStatusBadge()
      ).toBe(true);
    });
  });
});
