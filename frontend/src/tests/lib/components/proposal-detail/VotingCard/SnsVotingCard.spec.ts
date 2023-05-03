/**
 * @jest-environment jsdom
 */

import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { mockSnsCanisterId } from "$tests/mocks/sns.api.mock";
import { NeuronState, Vote } from "@dfinity/nns";
import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
import { SnsVote, type SnsBallot } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { fireEvent, screen } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

describe("SnsVotingCard", () => {
  const testBallots: [string, SnsBallot][] = [
    [
      "01",
      {
        vote: SnsVote.Unspecified,
        cast_timestamp_seconds: 123n,
        voting_power: 10000n,
      },
    ],
    [
      "02",
      {
        vote: SnsVote.Unspecified,
        cast_timestamp_seconds: 123n,
        voting_power: 10000n,
      },
    ],
  ];
  const testProposal: SnsProposalData = {
    ...mockSnsProposal,
    ballots: testBallots,
    proposal_creation_timestamp_seconds: BigInt(Date.now()),
  };
  const testNeurons: SnsNeuron[] = [
    {
      ...createMockSnsNeuron({
        id: [1],
        state: NeuronState.Locked,
      }),
    },
    {
      ...createMockSnsNeuron({
        id: [2],
        state: NeuronState.Locked,
      }),
    },
  ];
  const spyRegisterVote = jest
    .spyOn(snsGovernanceApi, "registerVote")
    .mockResolvedValue();
  const spyOnReloadProposal = jest.fn();
  const renderVotingCard = () =>
    render(SnsVotingCard, {
      props: {
        proposal: testProposal,
        reloadProposal: spyOnReloadProposal,
      },
    });

  beforeEach(() => {
    snsNeuronsStore.reset();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    spyOnReloadProposal.mockClear();
    spyRegisterVote.mockClear();

    page.mock({ data: { universe: mockSnsCanisterId.toText() } });

    snsParametersStore.setParameters({
      rootCanisterId: mockSnsCanisterId,
      parameters: snsNervousSystemParametersMock,
      certified: true,
    });
  });

  it("should be hidden if there is no not-voted-neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: [],
      certified: true,
    });
    const { getByTestId } = renderVotingCard();

    expect(() => expect(getByTestId("voting-confirmation-toolbar"))).toThrow();
  });

  it("should be visible if there are some not-voted-neurons", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { getByTestId } = renderVotingCard();

    await waitFor(() =>
      expect(getByTestId("voting-confirmation-toolbar")).toBeInTheDocument()
    );
  });

  it("should disable action buttons if no neurons selected", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { container } = renderVotingCard();
    // remove neuron selection
    votingNeuronSelectStore.reset();
    // wait for UI update (src/lib/components/proposal-detail/VotingCard/SnsVotingCard.svelte#34)
    await tick();
    expect(container.querySelectorAll("button[disabled]").length).toBe(2);
  });

  it("should enable action buttons when neurons are selected", async () => {
    snsNeuronsStore.setNeurons({
      rootCanisterId: mockSnsCanisterId,
      neurons: testNeurons,
      certified: true,
    });
    const { container } = renderVotingCard();
    expect(container.querySelector("button[disabled]")).toBeNull();
  });

  describe("voting", () => {
    it("should trigger register-vote and call reloadProposal", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledTimes(testNeurons.length)
      );
      await waitFor(() => expect(spyOnReloadProposal).toBeCalledTimes(1));
    });

    it("should trigger register-vote YES", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-yes") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[0].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.Yes,
          })
        )
      );
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[1].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.Yes,
          })
        )
      );
    });

    it("should trigger register-vote NO", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockSnsCanisterId,
        neurons: testNeurons,
        certified: true,
      });

      renderVotingCard();

      expect(spyRegisterVote).toBeCalledTimes(0);
      expect(spyOnReloadProposal).toBeCalledTimes(0);

      await fireEvent.click(screen.queryByTestId("vote-no") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toHaveBeenCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[0].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.No,
          })
        )
      );
      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith(
          expect.objectContaining({
            neuronId: fromDefinedNullable(testNeurons[1].id),
            rootCanisterId: mockSnsCanisterId,
            proposalId: fromDefinedNullable(testProposal.id),
            vote: Vote.No,
          })
        )
      );
    });
  });
});
