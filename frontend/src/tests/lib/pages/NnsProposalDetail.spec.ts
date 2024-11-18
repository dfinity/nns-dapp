import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import * as proposalsApi from "$lib/api/proposals.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import NnsProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { NnsProposalPo } from "$tests/page-objects/NnsProposal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { ProposalRewardStatus, Vote, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("NnsProposalDetail", () => {
  const neuronId1 = 0n;
  const neuronId2 = 1n;
  const testNeurons = [
    {
      ...mockNeuron,
      neuronId: neuronId1,
    },
    {
      ...mockNeuron,
      neuronId: neuronId2,
    },
  ] as NeuronInfo[];
  const testProposal = {
    ...mockProposalInfo,
    rewardStatus: ProposalRewardStatus.AcceptVotes,
    ballots: [
      {
        neuronId: BigInt(0),
        vote: Vote.Unspecified,
        votingPower: BigInt(1),
      },
      {
        neuronId: BigInt(1),
        vote: Vote.Unspecified,
        votingPower: BigInt(1),
      },
    ],
  };

  beforeEach(() => {
    resetIdentity();
    resetNeuronsApiService();
    toastsStore.reset();
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue(testNeurons);

    actionableProposalsSegmentStore.set("all");
    vi.spyOn(proposalsApi, "queryProposal").mockResolvedValue(testProposal);
    vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue([testProposal]); // actionable proposals update
    page.mock({
      routeId: AppPath.Proposal,
      data: {
        universe: OWN_CANISTER_ID_TEXT,
        proposal: `${testProposal.id}`,
      },
    });
  });

  const props = {
    proposalIdText: `${mockProposalInfo.id}`,
  };

  const renderComponent = () => {
    const { container } = render(NnsProposalDetail, props);
    return NnsProposalPo.under(new JestPageObjectElement(container));
  };

  describe("logged in user", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render proposal detail if signed in", async () => {
      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.isPresent("proposal-details-grid")).toBe(true);
      expect(await po.isContentLoaded()).toBe(true);
      expect(await po.getProposalSystemInfoSectionPo().isPresent()).toBe(true);
      expect(await po.getProposalSummaryPo().isPresent()).toBe(true);
      expect(await po.getProposalProposerActionsEntryPo().isPresent()).toBe(
        true
      );
      expect(get(toastsStore)).toEqual([]);
    });

    it("should show one toast if queryProposal fails", async () => {
      vi.spyOn(console, "error").mockReturnValue(undefined);
      const errorMessage = "proposal not found";
      vi.spyOn(proposalsApi, "queryProposal").mockRejectedValue(
        new Error(errorMessage)
      );

      renderComponent();
      await runResolvedPromises();

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `An error occurred while loading the proposal. id: "${mockProposalInfo.id}". ${errorMessage}`,
        },
      ]);
    });

    it("should query neurons", async () => {
      renderComponent();
      await runResolvedPromises();

      expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: true,
        includeEmptyNeurons: false,
      });
      expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
        includeEmptyNeurons: false,
      });
      expect(governanceApi.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should update votable neurons after voting", async () => {
      let beforeVoting = true;
      const spyOnQueryProposal = vi
        .spyOn(proposalsApi, "queryProposal")
        .mockImplementation(() =>
          Promise.resolve(
            beforeVoting
              ? testProposal
              : {
                  ...testProposal,
                  ballots: [
                    {
                      neuronId: neuronId1,
                      vote: Vote.Yes,
                      votingPower: BigInt(1),
                    },
                    {
                      neuronId: neuronId2,
                      vote: Vote.Yes,
                      votingPower: BigInt(1),
                    },
                  ],
                }
          )
        );

      const po = renderComponent();
      const votingCardPo = po.getVotingCardPo();
      await runResolvedPromises();

      expect(await votingCardPo.isPresent()).toBe(true);
      expect(
        await po.getVotingCardPo().getVotingNeuronSelectListPo().isPresent()
      ).toBe(true);
      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(false);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(false);

      const votingNeuronListItemPos = await po
        .getVotingCardPo()
        .getVotingNeuronSelectListPo()
        .getVotingNeuronListItemPos();
      expect(votingNeuronListItemPos.length).toBe(testNeurons.length);
      expect(await votingNeuronListItemPos[0].getNeuronId()).toBe(
        `${neuronId1}`
      );
      expect(await votingNeuronListItemPos[1].getNeuronId()).toBe(
        `${neuronId2}`
      );
      expect(spyOnQueryProposal).toBeCalledTimes(2);

      beforeVoting = false;
      await votingCardPo.voteYes();
      await runResolvedPromises();

      expect(spyOnQueryProposal).toBeCalledTimes(3);
      expect(
        (
          await po
            .getVotingCardPo()
            .getVotingNeuronSelectListPo()
            .getVotingNeuronListItemPos()
        ).length
      ).toBe(0);
    });

    // There was a bug where queryAndUpdate failed to hide the query response
    // after an update response was already returned.
    // In this case neuronsReady in NnsVotingCard.svelte would be set to false
    // and the VotingNeuronSelectList would not be displayed.
    it("It should work when the queryNeuron update response comes before the query", async () => {
      let beforeVoting = true;
      let resolveListNeuronsUpdate: (value: NeuronInfo[]) => void;
      let resolveListNeuronsQuery: (value: NeuronInfo[]) => void;
      const spyQueryNeurons = vi
        .spyOn(governanceApi, "queryNeurons")
        .mockImplementation(({ certified }: { certified: boolean }) =>
          beforeVoting
            ? certified
              ? new Promise((resolve) => (resolveListNeuronsUpdate = resolve))
              : new Promise((resolve) => (resolveListNeuronsQuery = resolve))
            : // For the neurons UPDATE call after voting
              Promise.resolve(testNeurons)
        );
      const spyOnQueryProposal = vi
        .spyOn(proposalsApi, "queryProposal")
        .mockImplementation(() =>
          Promise.resolve(
            beforeVoting
              ? testProposal
              : {
                  ...testProposal,
                  ballots: [
                    {
                      neuronId: neuronId1,
                      vote: Vote.Yes,
                      votingPower: BigInt(1),
                    },
                    {
                      neuronId: neuronId2,
                      vote: Vote.Yes,
                      votingPower: BigInt(1),
                    },
                  ],
                }
          )
        );

      const po = renderComponent();
      await runResolvedPromises();

      expect(spyQueryNeurons).toBeCalledTimes(2);
      resolveListNeuronsUpdate(testNeurons);
      resolveListNeuronsQuery(testNeurons);
      await runResolvedPromises();

      const votingCardPo = po.getVotingCardPo();
      expect(await votingCardPo.isPresent()).toBe(true);

      expect(
        await po.getVotingCardPo().getVotingNeuronSelectListPo().isPresent()
      ).toBe(true);
      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(false);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(false);

      const votingNeuronListItemPos = await po
        .getVotingCardPo()
        .getVotingNeuronSelectListPo()
        .getVotingNeuronListItemPos();
      expect(votingNeuronListItemPos.length).toBe(testNeurons.length);
      expect(await votingNeuronListItemPos[0].getNeuronId()).toBe(
        `${neuronId1}`
      );
      expect(await votingNeuronListItemPos[1].getNeuronId()).toBe(
        `${neuronId2}`
      );
      expect(spyOnQueryProposal).toBeCalledTimes(2);

      // Vote
      beforeVoting = false;
      await votingCardPo.voteYes();
      await runResolvedPromises();

      expect(spyOnQueryProposal).toBeCalledTimes(3);
      expect(
        (
          await po
            .getVotingCardPo()
            .getVotingNeuronSelectListPo()
            .getVotingNeuronListItemPos()
        ).length
      ).toBe(0);
    });
  });

  describe("logged out user", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render proposal detail if not signed in", async () => {
      const po = renderComponent();
      await runResolvedPromises();

      expect(await po.isPresent("proposal-details-grid")).toBe(true);
      expect(await po.isContentLoaded()).toBe(true);
      expect(await po.getProposalSystemInfoSectionPo().isPresent()).toBe(true);
      expect(await po.getProposalSummaryPo().isPresent()).toBe(true);
      expect(await po.getProposalProposerActionsEntryPo().isPresent()).toBe(
        true
      );
    });

    it("should show one toast if queryProposal fails", async () => {
      vi.spyOn(console, "error").mockReturnValue(undefined);
      const errorMessage = "proposal not found";
      vi.spyOn(proposalsApi, "queryProposal").mockRejectedValue(
        new Error(errorMessage)
      );

      renderComponent();
      await runResolvedPromises();

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `An error occurred while loading the proposal. id: "${mockProposalInfo.id}". ${errorMessage}`,
        },
      ]);
    });

    it("should NOT query neurons", async () => {
      renderComponent();
      await runResolvedPromises();

      expect(governanceApi.queryNeurons).not.toHaveBeenCalled();
    });
  });
});
