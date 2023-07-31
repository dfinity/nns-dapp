import VotingCard from "$lib/components/proposal-detail/VotingCard/VotingCard.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import {
  SELECTED_PROPOSAL_CONTEXT_KEY,
  type SelectedProposalContext,
  type SelectedProposalStore,
} from "$lib/types/selected-proposal.context";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { Ballot, NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { GovernanceCanister, ProposalStatus, Vote } from "@dfinity/nns";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { fireEvent, screen } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { writable } from "svelte/store";
import ContextWrapperTest from "../../ContextWrapperTest.svelte";

describe("VotingCard", () => {
  const neuronIds = [111, 222].map(BigInt);
  const proposalInfo: ProposalInfo = {
    ...mockProposalInfo,
    ballots: neuronIds.map((neuronId) => ({ neuronId } as Ballot)),
    proposalTimestampSeconds: BigInt(2000),
    status: ProposalStatus.Open,
  };
  const neurons: NeuronInfo[] = neuronIds.map((neuronId) => ({
    ...mockNeuron,
    createdTimestampSeconds: BigInt(BigInt(1000)),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    neuronId,
    permission_type: Int32Array.from([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
    ]),
  }));

  const renderVotingCard = () =>
    render(ContextWrapperTest, {
      props: {
        props: {
          proposalInfo,
        },
        contextKey: SELECTED_PROPOSAL_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedProposalStore>({
            proposalId: proposalInfo.id,
            proposal: proposalInfo,
          }),
        } as SelectedProposalContext,
        Component: VotingCard,
      },
    });

  beforeAll(() => vi.spyOn(console, "error").mockReturnValue());

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    neuronsStore.setNeurons({ neurons: [], certified: true });
  });

  afterAll(() => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    vi.resetAllMocks();
  });

  it("should be hidden if there is no not-voted-neurons", async () => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    const { getByTestId } = renderVotingCard();
    expect(() => expect(getByTestId("voting-confirmation-toolbar"))).toThrow();
  });

  it("should be visible if there are some not-voted-neurons", async () => {
    neuronsStore.setNeurons({ neurons, certified: true });
    const { getByTestId } = renderVotingCard();

    await waitFor(() =>
      expect(getByTestId("voting-confirmation-toolbar")).toBeInTheDocument()
    );
  });

  it("should disable action buttons if no neurons selected", async () => {
    neuronsStore.setNeurons({ neurons, certified: true });
    const { container } = renderVotingCard();
    // remove neuron selection
    votingNeuronSelectStore.reset();
    // wait for UI update (src/lib/components/proposal-detail/VotingCard/VotingCard.svelte#34)
    await tick();
    expect(container.querySelectorAll("button[disabled]").length).toBe(2);
  });

  it("should enable action buttons when neurons are selected", async () => {
    // changing the neuronStore automatically updates votingNeuronSelectStore with initial pre-selection of all neurons
    neuronsStore.setNeurons({ neurons, certified: true });
    const { container } = renderVotingCard();
    expect(container.querySelector("button[disabled]")).toBeNull();
  });

  describe("voting", () => {
    const mockGovernanceCanister: MockGovernanceCanister =
      new MockGovernanceCanister([proposalInfo]);

    let spyListNeurons;
    let spyRegisterVote;

    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );

      vi.spyOn(GovernanceCanister, "create").mockImplementation(
        (): GovernanceCanister =>
          mockGovernanceCanister as unknown as GovernanceCanister
      );
      spyRegisterVote = vi.spyOn(mockGovernanceCanister, "registerVote");
      spyListNeurons = vi.spyOn(mockGovernanceCanister, "listNeurons");

      neuronsStore.setNeurons({ neurons, certified: true });
      renderVotingCard();
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
          vote: Vote.Yes,
          proposalId: proposalInfo.id,
        })
      );
    });

    // it's on to show "console.error('vote:..." in the output (because of NO mock in canister)
    it("should trigger register-vote NO", async () => {
      await fireEvent.click(screen.queryByTestId("vote-no") as Element);
      await fireEvent.click(screen.queryByTestId("confirm-yes") as Element);

      await waitFor(() =>
        expect(spyRegisterVote).toHaveBeenCalledWith({
          neuronId: neuronIds[1],
          vote: Vote.No,
          proposalId: proposalInfo.id,
        })
      );

      await waitFor(() =>
        expect(spyRegisterVote).toBeCalledWith({
          neuronId: neuronIds[0],
          vote: Vote.No,
          proposalId: proposalInfo.id,
        })
      );
    });
  });
});
