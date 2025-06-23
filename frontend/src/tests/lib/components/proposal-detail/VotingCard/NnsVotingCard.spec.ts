import * as agent from "$lib/api/agent.api";
import * as governanceApi from "$lib/api/governance.api";
import * as proposalsApi from "$lib/api/proposals.api";
import NnsVotingCard from "$lib/components/proposal-detail/VotingCard/NnsVotingCard.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import {
  SELECTED_PROPOSAL_CONTEXT_KEY,
  type SelectedProposalContext,
  type SelectedProposalStore,
} from "$lib/types/selected-proposal.context";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotingCardPo } from "$tests/page-objects/VotingCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { Ballot, NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { ProposalStatus, Vote } from "@dfinity/nns";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import { mock } from "vitest-mock-extended";

describe("VotingCard", () => {
  const neuronIds = [111, 222].map(BigInt);
  const proposalInfo: ProposalInfo = {
    ...mockProposalInfo,
    ballots: neuronIds.map(
      (neuronId) =>
        ({ neuronId, vote: Vote.Unspecified, votingPower: 1n }) as Ballot
    ),
    proposalTimestampSeconds: 2_000n,
    status: ProposalStatus.Open,
  };
  const neurons: NeuronInfo[] = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    createdTimestampSeconds: BigInt(1_000n),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    neuronId,
    permission_type: Int32Array.from([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
    ]),
  }));

  const renderVotingCard = (proposal) =>
    render(ContextWrapperTest, {
      props: {
        props: {
          proposalInfo: proposal,
        },
        contextKey: SELECTED_PROPOSAL_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedProposalStore>({
            proposalId: proposal.id,
            proposal,
          }),
        } as SelectedProposalContext,
        Component: NnsVotingCard,
      },
    });

  const renderComponent = (proposal = proposalInfo) => {
    const { container } = renderVotingCard(proposal);
    return VotingCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
    resetIdentity();
  });

  it("should not be hidden if there is no not-voted-neurons", async () => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    const po = renderComponent();
    expect(await po.hasVotingConfirmationToolbar()).toBe(true);
  });

  it("should be visible if there are some not-voted-neurons", async () => {
    neuronsStore.setNeurons({ neurons, certified: true });
    const po = renderComponent();
    expect(await po.hasVotingConfirmationToolbar()).toBe(true);
  });

  it("should display ineligible neurons", async () => {
    const neuronId = 123n;
    const neurons: NeuronInfo[] = [
      {
        ...mockNeuron,
        neuronId,
        createdTimestampSeconds: BigInt(1_000n),
      },
    ];
    neuronsStore.setNeurons({ neurons, certified: true });
    networkEconomicsStore.setParameters({
      parameters: {
        ...mockNetworkEconomics,
        votingPowerEconomics: {
          ...mockNetworkEconomics.votingPowerEconomics,
          neuronMinimumDissolveDelayToVoteSeconds: BigInt(SECONDS_IN_YEAR),
        },
      },
      certified: true,
    });
    const po = renderComponent({
      ...proposalInfo,
      // Make all the neurons ineligible by dissolve delay
      ballots: [],
    } as ProposalInfo);
    expect(await po.getIneligibleNeurons().isPresent()).toBe(true);
    expect(await po.getIneligibleNeuronListPo().isPresent()).toBe(true);
    expect(await po.getIneligibleNeuronListPo().getNeuronIdTexts()).toEqual([
      neuronId.toString(),
    ]);
    expect(
      await po.getIneligibleNeuronListPo().getIneligibleReasonTexts()
    ).toEqual(["dissolve delay < 1 year"]);
  });

  it("should fallback to default minimum dissolve delay", async () => {
    const neuronId = 123n;
    const neurons: NeuronInfo[] = [
      {
        ...mockNeuron,
        neuronId,
        createdTimestampSeconds: BigInt(1_000n),
      },
    ];
    neuronsStore.setNeurons({ neurons, certified: true });
    networkEconomicsStore.setParameters({
      parameters: {
        ...mockNetworkEconomics,
        votingPowerEconomics: {
          ...mockNetworkEconomics.votingPowerEconomics,
          neuronMinimumDissolveDelayToVoteSeconds: undefined,
        },
      },
      certified: true,
    });
    const po = renderComponent({
      ...proposalInfo,
      // Make all the neurons ineligible by dissolve delay
      ballots: [],
    } as ProposalInfo);
    expect(
      await po.getIneligibleNeuronListPo().getIneligibleReasonTexts()
    ).toEqual(["dissolve delay < 6 months"]);
  });

  it("should disable action buttons if no neurons selected", async () => {
    neuronsStore.setNeurons({ neurons, certified: true });
    const po = renderComponent();

    await runResolvedPromises();
    expect(await po.getVoteYesButtonPo().isDisabled()).toBe(false);
    expect(await po.getVoteNoButtonPo().isDisabled()).toBe(false);

    // remove neuron selection
    votingNeuronSelectStore.reset();
    await runResolvedPromises();
    expect(await po.getVoteYesButtonPo().isDisabled()).toBe(true);
    expect(await po.getVoteNoButtonPo().isDisabled()).toBe(true);
  });

  describe("voting", () => {
    let spyQueryNeurons;
    let spyRegisterVote;

    beforeEach(() => {
      spyRegisterVote = vi.spyOn(governanceApi, "registerVote");
      spyQueryNeurons = vi
        .spyOn(governanceApi, "queryNeurons")
        .mockResolvedValue(neurons);
      vi.spyOn(proposalsApi, "queryProposal").mockResolvedValue(proposalInfo);
      vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue([
        proposalInfo,
      ]);

      neuronsStore.setNeurons({ neurons, certified: true });
    });

    it("should trigger register-vote YES", async () => {
      const po = renderComponent();

      expect(spyRegisterVote).not.toBeCalled();
      expect(spyQueryNeurons).not.toBeCalled();

      await po.voteYes();
      await runResolvedPromises();

      expect(spyRegisterVote).toBeCalledTimes(2);
      expect(spyRegisterVote).toBeCalledWith({
        neuronId: neuronIds[0],
        vote: Vote.Yes,
        proposalId: proposalInfo.id,
        identity: mockIdentity,
      });
      expect(spyRegisterVote).toBeCalledWith({
        neuronId: neuronIds[1],
        vote: Vote.Yes,
        proposalId: proposalInfo.id,
        identity: mockIdentity,
      });

      expect(spyQueryNeurons).toBeCalledTimes(1);
      expect(spyQueryNeurons).toBeCalledWith({
        certified: true,
        includeEmptyNeurons: false,
        identity: mockIdentity,
      });
    });

    it("should trigger register-vote NO", async () => {
      const po = renderComponent();

      expect(spyRegisterVote).not.toBeCalled();
      expect(spyQueryNeurons).not.toBeCalled();

      await po.voteNo();
      await runResolvedPromises();

      expect(spyRegisterVote).toBeCalledTimes(2);
      expect(spyRegisterVote).toBeCalledWith({
        neuronId: neuronIds[0],
        vote: Vote.No,
        proposalId: proposalInfo.id,
        identity: mockIdentity,
      });
      expect(spyRegisterVote).toBeCalledWith({
        neuronId: neuronIds[1],
        vote: Vote.No,
        proposalId: proposalInfo.id,
        identity: mockIdentity,
      });

      expect(spyQueryNeurons).toBeCalledTimes(1);
      expect(spyQueryNeurons).toBeCalledWith({
        certified: true,
        includeEmptyNeurons: false,
        identity: mockIdentity,
      });
    });
  });
});
