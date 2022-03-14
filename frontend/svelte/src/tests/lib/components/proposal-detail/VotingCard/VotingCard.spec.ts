/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import {
  Ballot,
  GovernanceCanister,
  ProposalInfo,
  ProposalStatus,
  Vote,
} from "@dfinity/nns";
import { fireEvent, screen } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import VotingCard from "../../../../../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
import { SECONDS_IN_YEAR } from "../../../../../lib/constants/constants";
import { authStore } from "../../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../../mocks/governance.canister.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("VotingCard", () => {
  const neuronIds = [111, 222].map(BigInt);
  const proposalInfo: ProposalInfo = {
    ...mockProposalInfo,
    ballots: neuronIds.map((neuronId) => ({ neuronId } as Ballot)),
    proposalTimestampSeconds: BigInt(2000),
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
  };
  const neurons: NeuronInfo[] = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    createdTimestampSeconds: BigInt(BigInt(1000)),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    neuronId,
  }));

  it("should be hidden if there is no not-voted-neurons", async () => {
    const { queryByTestId } = render(VotingCard, {
      props: {
        neurons: [],
        proposalInfo,
      },
    });
    await waitFor(() => expect(queryByTestId("card")).not.toBeInTheDocument());
  });

  it("should be visible if there are some not-voted-neurons", async () => {
    const { queryByTestId } = render(VotingCard, {
      props: {
        neurons,
        proposalInfo,
      },
    });
    await waitFor(() => expect(queryByTestId("card")).toBeInTheDocument());
  });

  describe("voting", () => {
    const mockGovernanceCanister: MockGovernanceCanister =
      new MockGovernanceCanister([proposalInfo]);

    let spyListNeurons;
    let spyRegisterVote;

    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);

      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation((): GovernanceCanister => mockGovernanceCanister);
      spyRegisterVote = jest.spyOn(mockGovernanceCanister, "registerVote");
      spyListNeurons = jest.spyOn(mockGovernanceCanister, "listNeurons");

      render(VotingCard, {
        props: {
          neurons,
          proposalInfo,
        },
      });
    });

    it("should trigger register-vote and neuron-list updates", async () => {
      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledTimes(neurons.length)
      );
      await waitFor(() => expect(spyListNeurons).toBeCalledTimes(1));
    });

    it("should trigger register-vote YES", async () => {
      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith({
          neuronId: neuronIds[0],
          vote: Vote.YES,
          proposalId: proposalInfo.id,
        })
      );
    });

    // it's on to show "console.error('vote:..." in the output (because of NO mock in canister)
    it("should trigger register-vote NO", async () => {
      await fireEvent.click(screen.queryByTestId("vote-no") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith({
          neuronId: neuronIds[0],
          vote: Vote.NO,
          proposalId: proposalInfo.id,
        })
      );
    });
  });
});
